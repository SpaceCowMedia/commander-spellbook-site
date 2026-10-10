import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import pluralize from 'pluralize';
import styles from './find-my-combos.module.scss';
import ArtCircle from 'components/card/ArtCircle/ArtCircle';
import SpellbookHead from 'components/layout/SpellbookHead/SpellbookHead';
import { isValidHttpUrl } from 'lib/http/urlCheck';
import ErrorMessage from 'components/submission/ErrorMessage/ErrorMessage';
import { useRouter } from 'next/router';
import {
  CardListFromTextApi,
  CardListFromUrlApi,
  Deck,
  FindMyCombosApi,
  InvalidUrlResponse,
  DeckToJSON,
  DeckFromJSON,
  ResponseError,
  EstimateBracketApi,
  EstimateBracketResult,
  ExplainQueryApi,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { queryParameterAsString } from 'lib/http/queryParameters';
import { DEFAULT_ORDERING } from 'lib/constants';
import {
  DEFAULT_FIND_MY_COMBOS_QUERY,
  ResultType,
  clearResultsCache,
  mergeResultsCache,
  readResultsCache,
} from 'lib/findMyCombos/findMyCombosResultsCache';
import CombosExportService from 'services/combos-export.service';
import DownloadFileService from 'services/download-file.service';
import normalizeStringInput from 'lib/text/normalizeStringInput';
import normalizeQuotes from 'lib/text/normalizeQuotes';
import Modal from 'components/layout/Modal/Modal';
import Tab from 'components/layout/Tab/Tab';
import DeckCombos from 'components/findMyCombos/DeckCombos/DeckCombos';
import DeckBracket from 'components/bracket/DeckBracket/DeckBracket';
import Loader from 'components/ui/Loader/Loader';
import { BRACKET_RANGE_MAP } from 'lib/bracket/brackets';
import useFoolsDay from 'lib/foolsDay';
import { apiErrorMessage, httpErrorStatus, rateLimitRetryAfterSeconds } from 'lib/http/httpErrors';
import SearchInput from 'components/search/SearchInput/SearchInput';
import { useDebounce } from 'use-debounce';

const LOCAL_STORAGE_DECK_STORAGE_KEY = 'commander-spellbook-combo-finder-last-decklist';
const LOCAL_STORAGE_QUERY_STORAGE_KEY = 'commander-spellbook-combo-finder-last-query';
const EXPLANATION_DELAY = 300;

// A term starts the query or follows whitespace, a parenthesis or a boolean operator alias, but not the
// `-` that negates it: excluding Commander-legal combos is no reason to estimate a Commander bracket.
const isCommanderLegalityQuery = (query: string) => /(?:^|[\s()&|])(?:legal|format):(?:commander|edh)\b/i.test(query);

export class Decklist {
  deck: Deck;

  constructor(deck: Deck) {
    this.deck = deck;
  }

  commanderListString(): string {
    return this.deck.commanders.map((card) => `${card.quantity} ${card.card}`).join('\n');
  }

  mainListString(): string {
    return this.deck.main.map((card) => `${card.quantity} ${card.card}`).join('\n');
  }

  toString(): string {
    return `${this.mainListString()}\n// Commanders\n${this.commanderListString()}`;
  }

  isEmpty(): boolean {
    return !this.deck.main.length && !this.deck.commanders.length;
  }

  contains(cardName: string): boolean {
    const name = cardName.toLowerCase();
    return this.deck.main.concat(this.deck.commanders).some((card) => card.card.toLowerCase() === name);
  }

  countCards(): number {
    return (
      this.deck.main.reduce((acc, card) => acc + card.quantity, 0) +
      this.deck.commanders.reduce((acc, card) => acc + card.quantity, 0)
    );
  }
}

const FindMyCombos: React.FC = () => {
  const router = useRouter();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [decklist, setDecklist] = useState<string>('');
  const [commanderList, setCommanderList] = useState<string>('');
  const [decklistErrors, setDecklistErrors] = useState<string[]>([]);
  const [deckUrl, setDeckUrl] = useState<string>('');
  const [deckUrlError, setDeckUrlHint] = useState<string>('');
  const [lookupInProgress, setLookupInProgress] = useState<boolean>(false);
  const [currentlyParsedDeck, setCurrentlyParsedDeck] = useState<Decklist>();
  const [query, setQuery] = useState<string>(DEFAULT_FIND_MY_COMBOS_QUERY);
  const [debouncedQuery] = useDebounce(query.trim(), EXPLANATION_DELAY);
  // Kept together with the query it describes, so an explanation is never presented as the meaning
  // of a query the user has since edited.
  const [queryExplanation, setQueryExplanation] = useState<{ query: string; text: string }>();
  // Tracks the query the currently-loaded `results` were computed for.
  const [analyzedQuery, setAnalyzedQuery] = useState<string>(DEFAULT_FIND_MY_COMBOS_QUERY);
  const numberOfCardsInDeck = currentlyParsedDeck?.countCards() || 0;
  const numberOfCardsText = `${numberOfCardsInDeck} ${pluralize('card', numberOfCardsInDeck)}`;
  const [results, setResults] = useState<ResultType>();
  const [bracketInfo, setBracketInfo] = useState<EstimateBracketResult>();
  const foolsDay = useFoolsDay();
  // When restoring from cache, hold the target scroll position until `results` commits.
  // useLayoutEffect below applies it before paint so we never scroll into a still-empty page.
  const pendingScrollY = useRef<number | null>(null);

  const configuration = apiConfiguration();
  const findMyCombosApi = new FindMyCombosApi(configuration);
  const estimateBracketApi = new EstimateBracketApi(configuration);
  const cardListFromUrlApi = new CardListFromUrlApi(configuration);
  const cardListFromTextApi = new CardListFromTextApi(configuration);

  const handleFindMyCombosError = async (err: unknown) => {
    const status = httpErrorStatus(err);
    // Only a rejected decklist comes with the reasons it was rejected
    if (status !== 400) {
      setDecklistErrors([apiErrorMessage(status ?? 500, rateLimitRetryAfterSeconds(err))]);
      return;
    }
    const error = err as ResponseError;
    const body = JSON.parse(await error.response.text());
    const errorMessages: string[] = [];
    if (Array.isArray(body.main)) {
      body.main.forEach((message: string) => {
        if (typeof message === 'string') {
          errorMessages.push(message);
        }
      });
    }
    Object.keys(body.main).forEach((key) => {
      if (body.main[key].card) {
        errorMessages.push(`Card #${key}: ${body.main[key].card}`);
      }
      if (body.main[key].quantity) {
        errorMessages.push(`Card #${key} quantity: ${body.main[key].quantity}`);
      }
    });
    setDecklistErrors(errorMessages);
  };

  const parseDecklist = async (decklistRaw: string, commanderListRaw?: string): Promise<Decklist> => {
    if (commanderListRaw) {
      decklistRaw = `${decklistRaw}\n// Commanders\n${commanderListRaw}`;
    }
    setDecklist(decklistRaw);
    setCommanderList(commanderListRaw || '');
    setCurrentlyParsedDeck(undefined);
    setDeckUrl('');
    try {
      const deck = await cardListFromTextApi.cardListFromTextCreate({
        body: decklistRaw,
      });
      const decklist = new Decklist(deck);
      setDecklist(decklist.mainListString());
      setCommanderList(decklist.commanderListString());
      setCurrentlyParsedDeck(decklist);
      setDecklistErrors([]);
      return decklist;
    } catch (err) {
      await handleFindMyCombosError(err);
      return new Decklist({ commanders: [], main: [] });
    }
  };

  const lookupCombos = async (
    decklist: Decklist,
    queryValue: string,
    forwardedResults?: typeof results,
    offset?: number,
  ): Promise<void> => {
    setLookupInProgress(true);

    if (decklist.isEmpty()) {
      setLookupInProgress(false);
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, JSON.stringify(DeckToJSON(decklist.deck)));
    localStorage.setItem(LOCAL_STORAGE_QUERY_STORAGE_KEY, queryValue);

    try {
      const combos = await findMyCombosApi.findMyCombosCreate({
        deckRequest: decklist.deck,
        offset,
        ordering: DEFAULT_ORDERING,
        q: queryValue.trim() ? queryValue : undefined,
      });

      const newResults = {
        identity: combos.results.identity,
        included: (forwardedResults?.included || []).concat(combos.results.included),
        includedByChangingCommanders: (forwardedResults?.includedByChangingCommanders || []).concat(
          combos.results.includedByChangingCommanders,
        ),
        almostIncluded: (forwardedResults?.almostIncluded || []).concat(combos.results.almostIncluded),
        almostIncludedByChangingCommanders: (forwardedResults?.almostIncludedByChangingCommanders || []).concat(
          combos.results.almostIncludedByChangingCommanders,
        ),
        almostIncludedByAddingColors: (forwardedResults?.almostIncludedByAddingColors || []).concat(
          combos.results.almostIncludedByAddingColors,
        ),
        almostIncludedByAddingColorsAndChangingCommanders: (
          forwardedResults?.almostIncludedByAddingColorsAndChangingCommanders || []
        ).concat(combos.results.almostIncludedByAddingColorsAndChangingCommanders),
      };

      const resultCount =
        newResults.included.length +
        newResults.almostIncluded.length +
        newResults.almostIncludedByAddingColors.length +
        newResults.almostIncludedByChangingCommanders.length +
        newResults.almostIncludedByAddingColorsAndChangingCommanders.length;

      if (combos.next && (offset ?? 0) <= 5000) {
        return lookupCombos(decklist, queryValue, newResults, resultCount);
      } // Adding a page limit to prevent infinite loops

      setResults(newResults);
      setAnalyzedQuery(queryValue);
      mergeResultsCache({
        deckJson: JSON.stringify(DeckToJSON(decklist.deck)),
        query: queryValue,
        results: newResults,
        scrollY: 0,
      });
    } catch (error) {
      await handleFindMyCombosError(error);
      setResults(undefined);
    }

    setLookupInProgress(false);
  };

  const lookupBracket = async (decklist: Decklist): Promise<void> => {
    try {
      const bracketInfo = await estimateBracketApi.estimateBracketCreate({
        deckRequest: decklist.deck,
      });
      setBracketInfo(bracketInfo);
      mergeResultsCache({
        deckJson: JSON.stringify(DeckToJSON(decklist.deck)),
        bracketInfo,
      });
    } catch (error) {
      console.error('Failed to fetch bracket info', error);
      setBracketInfo(undefined);
    }
  };

  const clearDecklist = () => {
    setCurrentlyParsedDeck(undefined);
    setDecklist('');
    setCommanderList('');
    setDeckUrl('');
    setDeckUrlHint('');
    setDecklistErrors([]);
    setResults(undefined);
    setBracketInfo(undefined);
    setQuery(DEFAULT_FIND_MY_COMBOS_QUERY);
    setAnalyzedQuery(DEFAULT_FIND_MY_COMBOS_QUERY);
    localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_QUERY_STORAGE_KEY);
    clearResultsCache();
    if (router.query.deckUrl) {
      router.push({ pathname: '/find-my-combos/', query: {} });
    }
  };

  const analyzeDeck = (decklist: Decklist, queryValue: string) => {
    lookupCombos(decklist, queryValue);
    lookupBracket(decklist);
  };

  const tryHydrateFromCache = (decklist: Decklist): boolean => {
    if (decklist.isEmpty()) {
      return false;
    }
    const cache = readResultsCache();
    if (!cache) {
      return false;
    }
    const deckJson = JSON.stringify(DeckToJSON(decklist.deck));
    if (cache.deckJson !== deckJson) {
      clearResultsCache();
      return false;
    }
    pendingScrollY.current = cache.scrollY;
    setResults(cache.results);
    setBracketInfo(cache.bracketInfo);
    setQuery(cache.query);
    setAnalyzedQuery(cache.query);
    return true;
  };

  // Persist the scroll position after navigating to a combo detail page
  useLayoutEffect(() => {
    if (pendingScrollY.current === null || !results) {
      return;
    }
    const target = pendingScrollY.current;
    pendingScrollY.current = null;
    window.scrollTo(0, target);
  }, [results]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (!readResultsCache()) {
        return;
      }
      mergeResultsCache({ scrollY: window.scrollY });
    };
    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  useEffect(() => {
    if (!debouncedQuery) {
      setQueryExplanation(undefined);
      return;
    }
    let outdated = false;
    new ExplainQueryApi(configuration)
      .explainQueryRetrieve({ q: debouncedQuery })
      .then(({ explanation }) => {
        if (!outdated) {
          setQueryExplanation({ query: debouncedQuery, text: explanation });
        }
      })
      .catch(() => {
        // An invalid query is reported by the lookup itself, there is just nothing to explain.
        if (!outdated) {
          setQueryExplanation(undefined);
        }
      });
    return () => {
      outdated = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const savedQuery = localStorage.getItem(LOCAL_STORAGE_QUERY_STORAGE_KEY) || DEFAULT_FIND_MY_COMBOS_QUERY;
    setQuery(savedQuery);

    if (router.query.decklist || router.query.commanders) {
      const decklist = (router.query.decklist as string) || '';
      const commanderList = (router.query.commanders as string) || '';
      parseDecklist(decklist, commanderList).then((parsed) => {
        if (tryHydrateFromCache(parsed)) {
          return;
        }
        analyzeDeck(parsed, savedQuery);
      });
      return;
    }

    const savedDeckString = localStorage.getItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    if (!savedDeckString) {
      return;
    }

    try {
      const savedDeck: Deck = DeckFromJSON(JSON.parse(savedDeckString));
      const decklist: Decklist = new Decklist(savedDeck);
      setDecklist(decklist.mainListString());
      setCommanderList(decklist.commanderListString());
      setCurrentlyParsedDeck(decklist);
      if (tryHydrateFromCache(decklist)) {
        return;
      }
      analyzeDeck(decklist, savedQuery);
    } catch (e) {
      console.error('Failed to load saved decklist from local storage', e);
      clearDecklist();
    }
  }, [router.isReady]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDecklist(normalizeQuotes(e.target.value));
  };

  const handleUrlInput = async () => {
    if (!isValidHttpUrl(deckUrl)) {
      setDeckUrlHint('You must paste a valid URL.');
      return;
    }
    try {
      const deck = await cardListFromUrlApi.cardListFromUrlRetrieve({
        url: deckUrl,
      });
      setDeckUrlHint('');
      const decklist = new Decklist(deck);
      setDecklist(decklist.mainListString());
      setCommanderList(decklist.commanderListString());
      setCurrentlyParsedDeck(decklist);
      analyzeDeck(decklist, query);
    } catch (err) {
      const status = httpErrorStatus(err);
      // A URL the backend cannot read a deck from is explained in the body, other failures are not
      if (status === undefined || status === 429 || status >= 500) {
        setDeckUrlHint(apiErrorMessage(status ?? 500, rateLimitRetryAfterSeconds(err)));
        return;
      }
      const error = err as ResponseError;
      const body: InvalidUrlResponse = JSON.parse(await error.response.text());
      setDeckUrlHint(body.detail);
    }
  };

  const urlQueryParam = queryParameterAsString(router.query.deckUrl) ?? '';

  useEffect(() => {
    if (router.query.deckUrl != undefined) {
      setDeckUrl(urlQueryParam);
    }
  }, [router.query.deckUrl]);

  useEffect(() => {
    if (deckUrl === urlQueryParam && urlQueryParam != '') {
      handleUrlInput();
    }
  }, [deckUrl, urlQueryParam]);

  const refreshDeckAnalysis = () => {
    window.history.replaceState(null, '', '/find-my-combos/');
    parseDecklist(decklist, commanderList).then((parsed) => analyzeDeck(parsed, query));
  };

  const getNormalizedFileName = () => {
    const commandersNormalized = currentlyParsedDeck
      ? currentlyParsedDeck.deck.commanders
          .map((c) => normalizeStringInput(c.card))
          .join('+')
          .trim()
          .replace(/\s+/g, '_')
          .substring(0, 50)
      : '';
    return `${commandersNormalized ? `${commandersNormalized}_` : ''}decklist_combos`;
  };

  const handleExportCombosToText = () => {
    if (results === undefined || results.included.length === 0) {
      return;
    }

    const combosExport = CombosExportService.exportToText(results.included);
    DownloadFileService.downloadTextFile(`${getNormalizedFileName()}.txt`, combosExport);
  };

  const handleExportCombosToCsv = () => {
    if (results === undefined || results.included.length === 0) {
      return;
    }

    const combosExport = CombosExportService.exportToCsv(results.included);
    DownloadFileService.downloadTextFile(`${getNormalizedFileName()}.csv`, combosExport);
  };

  const showBracketTab = isCommanderLegalityQuery(analyzedQuery);

  return (
    <>
      <SpellbookHead
        title="Commander Spellbook: Find My Combos"
        description="Input a decklist to generate all possible combos in your deck as well as combo suggestions."
      />
      <div className={`${styles.findMyCombosContainer} static-page`}>
        <ArtCircle cardName="Exploration" className="m-auto md:block hidden" />
        <h1 className="heading-title text-center">Find My Combos</h1>
        <h2 className="heading-subtitle text-center mt-0">
          Uncover combos in your deck, and discover potential combos.
        </h2>
        <label htmlFor="decklist-input" className="sr-only">
          Copy and paste your decklist into the text box to discover the combos in your deck.
        </label>
        <section>
          <label>Commanders:</label>
          <textarea
            id="commander-input"
            className={`${styles.decklistInput} ${styles.commanderInput}`}
            value={commanderList}
            placeholder={`ex: Ezuri, Claw of Progress`}
            onChange={(e) => setCommanderList(normalizeQuotes(e.target.value))}
          />
          <textarea
            id="decklist-input"
            className={styles.decklistInput}
            value={decklist}
            placeholder={`Supported decklist formats:
              Ancient Tomb
              1 Ancient Tomb
              1x Ancient Tomb
              Ancient Tomb (uma) 236
              1 Aetherflux Reservoir (KLD) 192 *F*
              `}
            onChange={handleInput}
          />

          {!!decklist && (
            <>
              {currentlyParsedDeck && (
                <span
                  id="decklist-card-count"
                  className={`${styles.decklistCardCount} gradient relative`}
                  aria-hidden="true"
                >
                  {numberOfCardsText}
                </span>
              )}
              {foolsDay && currentlyParsedDeck && !currentlyParsedDeck.isEmpty() && (
                <p id="sol-ring-verdict" className="text-center italic">
                  {currentlyParsedDeck.contains('Sol Ring')
                    ? 'Sol Ring detected. Of course it was.'
                    : 'No Sol Ring? A deck of rare courage and restraint. We salute you.'}
                </p>
              )}
              <div className={styles.queryInputShell}>
                <label htmlFor="combo-filter-query-input" className={styles.queryInputLabel}>
                  Combo filter query
                </label>
                <form
                  className={styles.queryInputForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    refreshDeckAnalysis();
                  }}
                >
                  <SearchInput
                    id="combo-filter-query-input"
                    value={query}
                    placeholder={DEFAULT_FIND_MY_COMBOS_QUERY}
                    onChange={setQuery}
                    inputClassName={styles.queryInput}
                    showSubmitButton
                    submitButtonClassName={styles.queryInputSubmit}
                  />
                </form>
                <p className={styles.queryInputHint}>
                  Add filter terms to narrow suggestions (example: <code>legal:commander and prerequisites&lt;=2</code>
                  ). Exclude a card with <code>-card:&quot;Sol Ring&quot;</code>.
                  {queryExplanation?.query === query.trim() && (
                    <span id="combo-filter-query-explanation" className={styles.queryExplanation}>
                      {' Currently filtering for '}
                      {queryExplanation.text}
                    </span>
                  )}
                </p>
                {query.trim() !== analyzedQuery.trim() && !lookupInProgress && (
                  <p className={styles.queryOutOfDateHint}>Filter changed. Click Find New Combos! to refresh.</p>
                )}
              </div>
              {!lookupInProgress && (
                <div className="flex flex-col gap-y-2 lg:flex-row">
                  <div className="flex flex-row gap-y-2">
                    <button
                      id="parse-decklist-input"
                      className={`${styles.clearDecklistInput} button`}
                      onClick={refreshDeckAnalysis}
                    >
                      Find New Combos!
                    </button>

                    <button
                      id="clear-decklist-input"
                      className={`${styles.clearDecklistInput} button`}
                      onClick={clearDecklist}
                    >
                      Clear Decklist
                    </button>
                  </div>

                  {decklistErrors.length === 0 && results && results.included.length > 0 && (
                    <>
                      <Modal open={exportModalOpen} onClose={() => setExportModalOpen(false)} closeIcon={true}>
                        <h2>Select a file format to export combos</h2>
                        <div className="flex flex-row gap-y-2">
                          <button
                            id="download-combos-txt-btn"
                            type="button"
                            className={`${styles.exportCombosInput} button`}
                            onClick={handleExportCombosToText}
                          >
                            TXT
                          </button>
                          <button
                            id="download-combos-csv-btn"
                            type="button"
                            className={`${styles.exportCombosInput} button`}
                            onClick={handleExportCombosToCsv}
                          >
                            CSV
                          </button>
                        </div>
                      </Modal>
                      <button
                        id="download-combos-file-btn"
                        type="button"
                        className={`${styles.exportCombosInput} button`}
                        onClick={() => setExportModalOpen(true)}
                      >
                        Export Combos To File
                      </button>
                    </>
                  )}
                </div>
              )}
              {decklistErrors.map((error, index) => (
                <ErrorMessage key={index}>{error}</ErrorMessage>
              ))}
            </>
          )}

          {!decklist && (
            <div id="decklist-hint" className={`${styles.decklistHint} heading-subtitle`} aria-hidden="true">
              Paste your decklist
            </div>
          )}

          {!decklist && (
            <section>
              <p className={`${styles.or} heading-subtitle`}>or</p>
              <input
                id="decklist-url-input"
                className={styles.decklistInput}
                type="text"
                value={deckUrl}
                placeholder="Supported deckbuilding sites: Archidekt, Moxfield, Deckstats.net, TappedOut.net."
                onChange={(e) => setDeckUrl(normalizeQuotes(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlInput();
                  }
                }}
              />
              <div id="decklist-url-hint" className={`${styles.decklistHint} heading-subtitle`} aria-hidden="true">
                Paste your decklist url
              </div>
              {!!deckUrl && (
                <button
                  id="submit-url-input"
                  className={`${styles.clearDecklistInput} button`}
                  onClick={() =>
                    router.push({
                      pathname: '/find-my-combos/',
                      query: { deckUrl },
                    })
                  }
                >
                  Submit URL
                </button>
              )}
              {deckUrlError && <ErrorMessage>{deckUrlError}</ErrorMessage>}
            </section>
          )}
        </section>
        {currentlyParsedDeck &&
          (showBracketTab ? (
            <Tab
              tabs={[
                {
                  title: <>Combos&nbsp;{lookupInProgress && <Loader />}</>,
                  content: (
                    <DeckCombos results={results} query={analyzedQuery} currentlyParsedDeck={currentlyParsedDeck} />
                  ),
                },
                {
                  title: (
                    <>
                      Bracket Info&nbsp;
                      {bracketInfo ? `(Est. ${BRACKET_RANGE_MAP[bracketInfo.bracketTag]})` : <Loader />}
                    </>
                  ),
                  content: <DeckBracket results={bracketInfo} />,
                },
              ]}
            />
          ) : (
            <DeckCombos results={results} query={analyzedQuery} currentlyParsedDeck={currentlyParsedDeck} />
          ))}
      </div>
    </>
  );
};

export default FindMyCombos;
