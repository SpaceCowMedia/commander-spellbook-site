import React, { useEffect, useState } from 'react';
import pluralize from 'pluralize';
import styles from './find-my-combos.module.scss';
import ArtCircle from '../components/layout/ArtCircle/ArtCircle';
import SpellbookHead from '../components/SpellbookHead/SpellbookHead';
import { isValidHttpUrl } from '../lib/url-check';
import ErrorMessage from 'components/submission/ErrorMessage/ErrorMessage';
import { useRouter } from 'next/router';
import {
  CardListFromTextApi,
  CardListFromUrlApi,
  Deck,
  FindMyCombosApi,
  InvalidUrlResponse,
  Variant,
  DeckToJSON,
  DeckFromJSON,
  ResponseError,
  EstimateBracketApi,
  EstimateBracketResult,
} from '@space-cow-media/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { queryParameterAsString } from 'lib/queryParameters';
import { LEGALITY_FORMATS } from 'lib/types';
import StyledSelect from 'components/layout/StyledSelect/StyledSelect';
import { DEFAULT_ORDERING } from 'lib/constants';
import CombosExportService from 'services/combos-export.service';
import DownloadFileService from 'services/download-file.service';
import normalizeStringInput from 'lib/normalizeStringInput';
import Modal from 'components/ui/Modal/Modal';
import Tab from 'components/ui/Tab/Tab.';
import DeckCombos from 'components/FindMyCombos/DeckCombos';
import DeckBracket from 'components/FindMyCombos/DeckBracket';
import Loader from 'components/layout/Loader/Loader';
import { BRACKET_RANGE_MAP } from 'lib/brackets';

const LOCAL_STORAGE_DECK_STORAGE_KEY = 'commander-spellbook-combo-finder-last-decklist';

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

  countCards(): number {
    return (
      this.deck.main.reduce((acc, card) => acc + card.quantity, 0) +
      this.deck.commanders.reduce((acc, card) => acc + card.quantity, 0)
    );
  }
}

export interface ResultType {
  identity: string;
  included: Variant[];
  includedByChangingCommanders: Variant[];
  almostIncluded: Variant[];
  almostIncludedByChangingCommanders: Variant[];
  almostIncludedByAddingColors: Variant[];
  almostIncludedByAddingColorsAndChangingCommanders: Variant[];
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
  const [format, setFormat] = useState<string>('commander');
  const numberOfCardsInDeck = currentlyParsedDeck?.countCards() || 0;
  const numberOfCardsText = `${numberOfCardsInDeck} ${pluralize('card', numberOfCardsInDeck)}`;
  const [results, setResults] = useState<ResultType>();
  const [bracketInfo, setBracketInfo] = useState<EstimateBracketResult>();

  const configuration = apiConfiguration();
  const findMyCombosApi = new FindMyCombosApi(configuration);
  const estimateBracketApi = new EstimateBracketApi(configuration);
  const cardListFromUrlApi = new CardListFromUrlApi(configuration);
  const cardListFromTextApi = new CardListFromTextApi(configuration);

  const handleFindMyCombosError = async (err: unknown) => {
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
    forwardedResults?: typeof results,
    offset?: number,
  ): Promise<void> => {
    setLookupInProgress(true);

    if (decklist.isEmpty()) {
      setLookupInProgress(false);
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, JSON.stringify(DeckToJSON(decklist.deck)));

    try {
      const combos = await findMyCombosApi.findMyCombosCreate({
        deckRequest: decklist.deck,
        offset,
        ordering: DEFAULT_ORDERING,
        q: format ? `legal:${format}` : undefined,
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
        return lookupCombos(decklist, newResults, resultCount);
      } // Adding a page limit to prevent infinite loops

      setResults(newResults);
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
    localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    if (router.query.deckUrl) {
      router.push({ pathname: '/find-my-combos/', query: {} });
    }
  };

  const analyzeDeck = (decklist: Decklist) => {
    lookupCombos(decklist);
    lookupBracket(decklist);
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (router.query.decklist || router.query.commanders) {
      const decklist = (router.query.decklist as string) || '';
      const commanderList = (router.query.commanders as string) || '';
      parseDecklist(decklist, commanderList).then(analyzeDeck);
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
      analyzeDeck(decklist);
    } catch (e) {
      console.error('Failed to load saved decklist from local storage', e);
      clearDecklist();
    }
  }, [router.isReady]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDecklist(e.target.value);
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
      analyzeDeck(decklist);
    } catch (err) {
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

  useEffect(() => {
    if (currentlyParsedDeck) {
      analyzeDeck(currentlyParsedDeck);
    }
  }, [format]);

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
            onChange={(e) => setCommanderList(e.target.value)}
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
              {!lookupInProgress && (
                <div className="flex flex-col gap-y-2 lg:flex-row">
                  <div className="flex flex-row gap-y-2">
                    <button
                      id="parse-decklist-input"
                      className={`${styles.clearDecklistInput} button`}
                      onClick={() => {
                        window.history.replaceState(null, '', '/find-my-combos/');
                        parseDecklist(decklist, commanderList).then(analyzeDeck);
                      }}
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
              {decklistErrors.map((error) => (
                <ErrorMessage key={error}>{error}</ErrorMessage>
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
                onChange={(e) => setDeckUrl(e.target.value)}
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

          <div className="w-full flex mt-4">
            <label
              htmlFor="format-select"
              className="border-dark border text-center align-middle p-2 bg-dark text-white"
            >
              Format
            </label>
            <StyledSelect
              label="Format"
              id="format-select"
              options={LEGALITY_FORMATS}
              value={format}
              onChange={setFormat}
              selectBackgroundClassName="flex-grow border-dark border"
            />
          </div>
        </section>
        {currentlyParsedDeck &&
          (format === 'commander' ? (
            <Tab
              tabs={[
                {
                  title: <>Combos&nbsp;{lookupInProgress && <Loader />}</>,
                  content: <DeckCombos results={results} format={format} currentlyParsedDeck={currentlyParsedDeck} />,
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
            <DeckCombos results={results} format={format} currentlyParsedDeck={currentlyParsedDeck} />
          ))}
      </div>
    </>
  );
};

export default FindMyCombos;
