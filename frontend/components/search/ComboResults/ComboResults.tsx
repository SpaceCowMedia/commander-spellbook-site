import { SearchResultsState } from "../../../pages/search";
import styles from "./comboResults.module.scss";
import Link from "next/link";
import ColorIdentity from "../../layout/ColorIdentity/ColorIdentity";
import CardTooltip from "../../layout/CardTooltip/CardTooltip";
import { FormattedApiResponse } from "../../../lib/types";
import Card from "../../../lib/card";
import TextWithMagicSymbol from "../../layout/TextWithMagicSymbol/TextWithMagicSymbol";
import pluralize from "pluralize";

type Props = {
  missingDecklistCards?: Card[];
} & (
  | {
      results: SearchResultsState;
      paginatedResults: FormattedApiResponse[];
    }
  | { results: FormattedApiResponse[]; paginatedResults?: never }
);

const getCardNames = (combo: FormattedApiResponse) =>
  combo.cards.map((card) => card.name);

const ComboResults = ({
  results,
  paginatedResults,
  missingDecklistCards = [],
}: Props) => {
  const isMissingInDecklistCards = (cardName: string) =>
    !!missingDecklistCards.find((card) => card.matchesNameExactly(cardName));

  const sortStatMessage = (combo: FormattedApiResponse) => {
    if (!results.sort) {
      return "";
    }

    if (results.sort === "popularity") {
      const numberOfDecks = combo.numberOfEDHRECDecks;

      if (!numberOfDecks) {
        return "No deck data (EDHREC)";
      }

      const deckString = pluralize("deck", numberOfDecks);

      return `${numberOfDecks} ${deckString} (EDHREC)`;
    }

    if (results.sort === "price") {
      const vendor = results.vendor;

      if (combo.cards.getPrice(vendor) === 0) {
        return "Price Unavailable";
      }
      return `$${combo.cards.getPriceAsString(vendor)}`;
    }

    switch (results.sort) {
      case "prerequisites":
      case "steps":
      case "results":
      case "cards":
        if (combo[results.sort].length === 1) {
          // remove the s in the sort word
          return `1 ${results.sort.slice(0, -1)}`;
        }
        return `${combo[results.sort].length} ${results.sort}`;
    }

    return "";
  };

  return (
    <div className={styles.comboResultsWrapper}>
      {(paginatedResults || results).map((combo) => (
        <Link
          href={`/combo/${combo.commanderSpellbookId}`}
          key={combo.commanderSpellbookId}
          className={`${styles.comboResult} w-full md:w-1/4`}
        >
          <div className="flex flex-col">
            <div className="flex items-center flex-grow flex-col bg-dark text-white">
              <ColorIdentity colors={combo.colorIdentity.colors} size="small" />
            </div>
            <div className="flex-grow border-b-2 border-light">
              <div className="py-1">
                <span className="sr-only">Cards in combo:</span>
                {getCardNames(combo).map((cardName) => (
                  <CardTooltip cardName={cardName} key={cardName}>
                    <div className="card-name pl-3 pr-3">
                      {isMissingInDecklistCards(cardName) ? (
                        <strong className="text-red-800">
                          {cardName} (not in deck)
                        </strong>
                      ) : (
                        <span>{cardName}</span>
                      )}
                    </div>
                  </CardTooltip>
                ))}
              </div>
            </div>
            <div className="flex-grow">
              <span className="sr-only">Results in combo:</span>
              {combo.results.map((result) => (
                <div key={result} className={`result pl-3 pr-3`}>
                  <TextWithMagicSymbol text={result} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center flex-grow flex-col">
            <div className="flex-grow" />
            {sortStatMessage(combo) && (
              <div className="sort-footer w-full py-1 text-center flex-shrink bg-dark text-white">
                {sortStatMessage(combo)}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ComboResults;
