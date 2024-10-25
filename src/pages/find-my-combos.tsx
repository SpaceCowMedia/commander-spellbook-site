import React, { useEffect, useState } from 'react';
import pluralize from 'pluralize';
import styles from './find-my-combos.module.scss';
import ArtCircle from '../components/layout/ArtCircle/ArtCircle';
import ComboResults from '../components/search/ComboResults/ComboResults';
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
} from '@spacecowmedia/spellbook-client';
import { apiConfiguration } from 'services/api.service';
import { queryParameterAsString } from 'lib/queryParameters';

const LOCAL_STORAGE_DECK_STORAGE_KEY = 'commander-spellbook-combo-finder-last-decklist';

const DEFAULT_RESULTS = {
  identity: '',
  included: [],
  includedByChangingCommanders: [],
  almostIncluded: [],
  almostIncludedByChangingCommanders: [],
  almostIncludedByAddingColors: [],
  almostIncludedByAddingColorsAndChangingCommanders: [],
};

class Decklist {
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

const FindMyCombos: React.FC = () => {
  const router = useRouter();
  const [decklist, setDecklist] = useState<string>('');
  const [commanderList, setCommanderList] = useState<string>('');
  const [decklistErrors, setDecklistErrors] = useState<string[]>([]);
  const [deckUrl, setDeckUrl] = useState<string>('');
  const [deckUrlError, setDeckUrlHint] = useState<string>('');
  const [lookupInProgress, setLookupInProgress] = useState<boolean>(false);
  const [currentlyParsedDeck, setCurrentlyParsedDeck] = useState<Decklist>();
  const numberOfCardsInDeck = currentlyParsedDeck?.countCards() || 0;
  const numberOfCardsText = `${numberOfCardsInDeck} ${pluralize('card', numberOfCardsInDeck)}`;
  const [results, setResults] = useState<{
    identity: string;
    included: Variant[];
    includedByChangingCommanders: Variant[];
    almostIncluded: Variant[];
    almostIncludedByChangingCommanders: Variant[];
    almostIncludedByAddingColors: Variant[];
    almostIncludedByAddingColorsAndChangingCommanders: Variant[];
  }>(DEFAULT_RESULTS);

  const numOfCombos = results.included.length;
  const combosInDeckHeadingText = !numOfCombos
    ? 'No combos found'
    : `${numOfCombos} ${pluralize('Combo', numOfCombos)} Found`;

  const numPotentialCombos = results.almostIncluded.length;
  const potentialCombosInDeckHeadingText = `${numPotentialCombos} Potential ${pluralize(
    'Combo',
    numPotentialCombos,
  )} Found`;

  const potentialCombosInAdditionalColorsHeadingText = `${results.almostIncludedByAddingColors.length} Potential ${pluralize(
    'Combo',
    results.almostIncludedByAddingColors.length,
  )} Found With Additional Color Requirements`;

  const configuration = apiConfiguration();
  const findMyCombosApi = new FindMyCombosApi(configuration);
  const cardListFromUrlApi = new CardListFromUrlApi(configuration);
  const cardListFromTextApi = new CardListFromTextApi(configuration);

  const handleError = async (err: any) => {
    const error = err as ResponseError;
    const body = JSON.parse(await error.response.text());
    const errorMessages: string[] = [];
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
    } catch (err: any) {
      await handleError(err);
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
      return setLookupInProgress(false);
    }

    localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, JSON.stringify(DeckToJSON(decklist.deck)));

    try {
      const combos = await findMyCombosApi.findMyCombosCreate({
        deckRequest: decklist.deck,
        offset,
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
    } catch (error: any) {
      await handleError(error);
      setResults(DEFAULT_RESULTS);
    }

    setLookupInProgress(false);
  };

  const clearDecklist = () => {
    setCurrentlyParsedDeck(undefined);
    setDecklist('');
    setCommanderList('');
    setDeckUrl('');
    setDeckUrlHint('');
    setDecklistErrors([]);
    setResults(DEFAULT_RESULTS);
    localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    if (router.query.deckUrl) {
      router.push({ pathname: '/find-my-combos/', query: {} });
    }
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (router.query.decklist || router.query.commanders) {
      const decklist = (router.query.decklist as string) || '';
      const commanderList = (router.query.commanders as string) || '';
      parseDecklist(decklist, commanderList).then((decklist) => lookupCombos(decklist));
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
      lookupCombos(decklist);
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
      lookupCombos(decklist);
    } catch (err: any) {
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
              <span
                id="decklist-card-count"
                className={`${styles.decklistCardCount} gradient relative`}
                aria-hidden="true"
              >
                {numberOfCardsText}
              </span>
              {!lookupInProgress && (
                <>
                  <button
                    id="parse-decklist-input"
                    className={`${styles.clearDecklistInput} button`}
                    onClick={() => parseDecklist(decklist, commanderList).then((decklist) => lookupCombos(decklist))}
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
                </>
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
        </section>

        <div id="decklist-app" className={styles.decklistApp}>
          {lookupInProgress && (
            <section>
              <h2 className="heading-subtitle">Loading Combos...</h2>
            </section>
          )}

          {!lookupInProgress && decklist && (
            <section id="combos-in-deck-section">
              <h2 className="heading-subtitle">{combosInDeckHeadingText}</h2>
              <ComboResults results={results.included} hideVariants={true} />
            </section>
          )}

          {!lookupInProgress && !!results.almostIncluded.length && (
            <section id="potential-combos-in-deck-section">
              <h2 className="heading-subtitle">{potentialCombosInDeckHeadingText}</h2>
              <p>List of combos where your decklist is missing 1 combo piece.</p>
              <ComboResults results={results.almostIncluded} deck={currentlyParsedDeck?.deck} hideVariants={true} />
            </section>
          )}

          {!lookupInProgress && !!results.almostIncludedByAddingColors.length && (
            <section id="potential-combos-outside-color-identity-section">
              <h2 className="heading-subtitle">{potentialCombosInAdditionalColorsHeadingText}</h2>
              <p>
                List of combos where your decklist is missing 1 combo piece, but requires at least one additional color.
              </p>
              <ComboResults
                results={results.almostIncludedByAddingColors}
                deck={currentlyParsedDeck?.deck}
                hideVariants={true}
              />
            </section>
          )}
          {!lookupInProgress && !!results.almostIncludedByChangingCommanders.length && (
            <section id="potential-combos-outside-commander-section">
              <h2 className="heading-subtitle">
                {results.almostIncludedByChangingCommanders.length} Potential Combos Found With Different Commander
              </h2>
              <p>List of combos where your decklist is missing 1 combo piece, but requires changing your commander.</p>
              <ComboResults
                results={results.almostIncludedByChangingCommanders}
                deck={currentlyParsedDeck?.deck}
                hideVariants={true}
              />
            </section>
          )}
          {!lookupInProgress && !!results.almostIncludedByAddingColorsAndChangingCommanders.length && (
            <section id="potential-combos-outside-color-identity-and-commander-section">
              <h2 className="heading-subtitle">
                {results.almostIncludedByAddingColorsAndChangingCommanders.length} Potential Combos Found With Different
                Commander and Additional Colors
              </h2>
              <p>
                List of combos where your decklist is missing 1 combo piece, but requires changing your commander and
                adding a color.
              </p>
              <ComboResults
                results={results.almostIncludedByAddingColorsAndChangingCommanders}
                deck={currentlyParsedDeck?.deck}
                hideVariants={true}
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default FindMyCombos;
