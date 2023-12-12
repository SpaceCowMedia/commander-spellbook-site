import { ChangeEventHandler, useEffect, useState } from "react";
import pluralize from "pluralize";
import { ColorIdentityColors, FormattedApiResponse } from "../lib/types";
import {
  convertDecklistToDeck,
} from "../lib/decklist-parser";
import styles from "./find-my-combos.module.scss";
import PageWrapper from "../components/layout/PageWrapper/PageWrapper";
import ArtCircle from "../components/layout/ArtCircle/ArtCircle";
import ComboResults from "../components/search/ComboResults/ComboResults";
import SpellbookHead from "../components/SpellbookHead/SpellbookHead";
import findMyCombosService from "../services/findMyCombos.service";
import {processBackendResponses} from "../lib/backend-processors";
import formatApiResponse from "../lib/format-api-response";

const LOCAL_STORAGE_DECK_STORAGE_KEY =
  "commander-spellbook-combo-finder-last-decklist";
const LOCAL_STORAGE_COMMANDER_STORAGE_KEY =
  "commander-spellbook-combo-finder-last-commander";

const FindMyCombos = () => {
  const [decklist, setDecklist] = useState<string>("");
  const [commanderList, setCommanderList] = useState<string>("");
  const [numberOfCardsInDeck, setNumberOfCardsInDeck] = useState<number>(0);
  const [lookupInProgress, setLookupInProgress] = useState<boolean>(false);
  const [combosInDeck, setCombosInDeck] = useState<Array<FormattedApiResponse>>(
    []
  );
  const [potentialCombos, setPotentialCombos] = useState<
    Array<FormattedApiResponse>
  >([]);
  const [results, setResults] = useState<{
    identity: string,
    included: FormattedApiResponse[],
    includedByChangingCommanders: FormattedApiResponse[],
    almostIncluded: FormattedApiResponse[],
    almostIncludedByChangingCommanders: FormattedApiResponse[],
    almostIncludedByAddingColors: FormattedApiResponse[],
    almostIncludedByAddingColorsAndChangingCommanders: FormattedApiResponse[],
  }>({
    identity: "",
    included: [],
    includedByChangingCommanders: [],
    almostIncluded: [],
    almostIncludedByChangingCommanders: [],
    almostIncludedByAddingColors: [],
    almostIncludedByAddingColorsAndChangingCommanders: [],
  })

  const [missingDeckListCards, setMissingDeckListCards] = useState<Array<any>>(
    []
  );
  const [potentialCombosColorIdentity, setPotentialCombosColorIdentity] =
    useState<Array<ColorIdentityColors>>(["w", "u", "b", "r", "g"]);
  const [deckColorIdentity, setDeckColorIdentity] = useState<
    Array<ColorIdentityColors>
  >([]);

  const numberOfCardsText = `${numberOfCardsInDeck} ${pluralize(
    "card",
    numberOfCardsInDeck
  )}`;

  const numOfCombos = results.included.length;
  const combosInDeckHeadingText = !numOfCombos
    ? "No combos found"
    : `${numOfCombos} ${pluralize("Combo", numOfCombos)} Found`;

  const potentialCombosMatchingDeckColorIdentity = potentialCombos.filter(
    (combo) => combo.colorIdentity.isWithin(deckColorIdentity)
  );
  const potentialCombosOutsideDeckColorIdentity = potentialCombos.filter(
    (combo) => !combo.colorIdentity.isWithin(deckColorIdentity)
  );
  const numPotentialCombos = results.almostIncluded.length;
  const potentialCombosInDeckHeadingText = `${numPotentialCombos} Potential ${pluralize(
    "Combo",
    numPotentialCombos
  )} Found`;

  const potentialCombosOutsideDeckColorIdentityFilteredByPicker =
    potentialCombosOutsideDeckColorIdentity.filter((combo) =>
      combo.colorIdentity.isWithin(potentialCombosColorIdentity)
    );
  const potentialCombosMatchingColorIdentityPicker = potentialCombos.filter(
    (combo) => combo.colorIdentity.isWithin(potentialCombosColorIdentity)
  );

  const numbInAdditionalColors = potentialCombosOutsideDeckColorIdentity.length;
  const potentialCombosInAdditionalColorsHeadingText = `${results.almostIncludedByAddingColors.length} Potential ${pluralize(
    "Combo",
    numbInAdditionalColors
  )} Found With Additional Color Requirements`;

  const lookupCombos = async (newDeckList: string, newCommanderList: string, forwardedResults?: typeof results, next?: string, page=1): Promise<any> => {
    setLookupInProgress(true);
    const deck = await convertDecklistToDeck(newDeckList);
    setNumberOfCardsInDeck(deck.numberOfCards);

    setCombosInDeck([]);
    setPotentialCombos([]);
    setMissingDeckListCards([]);
    setPotentialCombosColorIdentity(["w", "u", "b", "r", "g"]);
    setDeckColorIdentity(deck.colorIdentity);

    if (deck.numberOfCards < 2) return setLookupInProgress(false);

    localStorage.setItem(LOCAL_STORAGE_DECK_STORAGE_KEY, newDeckList);
    localStorage.setItem(LOCAL_STORAGE_COMMANDER_STORAGE_KEY, commanderList);

    const combos = await findMyCombosService.findFromString(newDeckList, newCommanderList, next)

    const newResults = {
      identity: combos.results.identity,
      included: (forwardedResults?.included || []).concat(formatApiResponse(processBackendResponses(combos.results.included))),
      includedByChangingCommanders: (forwardedResults?.includedByChangingCommanders || []).concat(formatApiResponse(processBackendResponses(combos.results.includedByChangingCommanders))),
      almostIncluded: (forwardedResults?.almostIncluded || []).concat(formatApiResponse(processBackendResponses(combos.results.almostIncluded))),
      almostIncludedByChangingCommanders: (forwardedResults?.almostIncludedByChangingCommanders || []).concat(formatApiResponse(processBackendResponses(combos.results.almostIncludedByChangingCommanders))),
      almostIncludedByAddingColors: (forwardedResults?.almostIncludedByAddingColors || []).concat(formatApiResponse(processBackendResponses(combos.results.almostIncludedByAddingColors))),
      almostIncludedByAddingColorsAndChangingCommanders: (forwardedResults?.almostIncludedByAddingColorsAndChangingCommanders || []).concat(formatApiResponse(processBackendResponses(combos.results.almostIncludedByAddingColorsAndChangingCommanders))),
    }

    if (combos.next && page < 5) return lookupCombos(newDeckList, newCommanderList, newResults, combos.next, page+1); // Adding a page limit to prevent infinite loops

    setResults(newResults)
    setLookupInProgress(false);
  };

  const clearDecklist = () => {
    setDecklist("");
    setCombosInDeck([]);
    setPotentialCombos([]);
    localStorage.removeItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_COMMANDER_STORAGE_KEY);
  };

  useEffect(() => {
    const savedDeck = localStorage.getItem(LOCAL_STORAGE_DECK_STORAGE_KEY);
    const savedCommanderList = localStorage.getItem(LOCAL_STORAGE_COMMANDER_STORAGE_KEY);

    if (!savedDeck?.trim()) return;

    setDecklist(savedDeck);
    setCommanderList(savedCommanderList || "");

    lookupCombos(savedDeck, savedCommanderList || "");
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDecklist(e.target.value);
  };

  return (
    <PageWrapper>
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
          Copy and paste your decklist into the text box to discover the combos
          in your deck.
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
              <button
                id="clear-decklist-input"
                className={`${styles.clearDecklistInput} button`}
                onClick={() => lookupCombos(decklist, commanderList)}
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

          {!decklist && (
            <div
              id="decklist-hint"
              className={`${styles.decklistHint} heading-subtitle`}
              aria-hidden="true"
            >
              Paste your decklist
            </div>
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
              <ComboResults results={results.included} />
            </section>
          )}

          {!lookupInProgress &&
            !!results.almostIncluded.length && (
              <section id="potential-combos-in-deck-section">
                <h2 className="heading-subtitle">
                  {potentialCombosInDeckHeadingText}
                </h2>
                <p>
                  List of combos where your decklist is missing 1 combo piece.
                </p>
                <ComboResults
                  results={results.almostIncluded}
                  missingDecklistCards={missingDeckListCards}
                />
              </section>
            )}

          {!lookupInProgress && !!results.almostIncludedByAddingColors.length &&
              <section id="potential-combos-outside-color-identity-section">
                <h2 className="heading-subtitle">
                  {potentialCombosInAdditionalColorsHeadingText}
                </h2>
                <p>
                  List of combos where your decklist is missing 1 combo piece,
                  but requires at least one additional color.
                </p>
                <ComboResults
                  results={results.almostIncludedByAddingColors}
                  missingDecklistCards={missingDeckListCards}
                />
              </section>
            }
          {!lookupInProgress && !!results.almostIncludedByChangingCommanders.length &&
            <section id="potential-combos-outside-commander-section">
              <h2 className="heading-subtitle">
                {results.almostIncludedByChangingCommanders.length} Potential Combos Found With Different Commander
              </h2>
              <p>
                List of combos where your decklist is missing 1 combo piece,
                but requires changing your commander.
              </p>
              <ComboResults
                results={results.almostIncludedByChangingCommanders}
                missingDecklistCards={missingDeckListCards}
              />
            </section>
          }
          {!lookupInProgress && !!results.almostIncludedByAddingColorsAndChangingCommanders.length &&
            <section id="potential-combos-outside-color-identity-and-commander-section">
              <h2 className="heading-subtitle">
                {results.almostIncludedByAddingColorsAndChangingCommanders.length} Potential Combos Found With Different Commander and Additional Colors
              </h2>
              <p>
                List of combos where your decklist is missing 1 combo piece,
                but requires changing your commander and adding a color.
              </p>
              <ComboResults
                results={results.almostIncludedByAddingColorsAndChangingCommanders}
                missingDecklistCards={missingDeckListCards}
              />
            </section>
          }
        </div>
      </div>
    </PageWrapper>
  );
};

export default FindMyCombos;
