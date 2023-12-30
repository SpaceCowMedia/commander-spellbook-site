import styles from "./comboResults.module.scss";
import Link from "next/link";
import ColorIdentity from "../../layout/ColorIdentity/ColorIdentity";
import CardTooltip from "../../layout/CardTooltip/CardTooltip";
import {Variant, VendorValue} from "../../../lib/types";
import TextWithMagicSymbol from "../../layout/TextWithMagicSymbol/TextWithMagicSymbol";
import pluralize from "pluralize";
import {Deck} from "../../../lib/decklist-parser";

type Props = {
  deck?: Deck; // If passed in, will highlight cards in the combo that are not in the deck
  results: Variant[];
  sort?: string;
  vendor?: VendorValue;
}

const ComboResults = ({
  results,
  sort,
  vendor,
  deck,
}: Props) => {
  const sortStatMessage = (combo: Variant) => {
    if (!sort) {
      return "";
    }

    if (sort === "popularity") {
      const numberOfDecks = combo.popularity;

      if (numberOfDecks === null || numberOfDecks === undefined) {
        return "No deck data (EDHREC)";
      }

      const deckString = pluralize("deck", numberOfDecks);

      return `${numberOfDecks} ${deckString} (EDHREC)`;
    }

    if (sort.startsWith("price")) {
      if (sort.includes("cardkingdom")) {
        return `$${combo.prices.cardkingdom}`;
      }
      if (sort.includes("cardmarket")) {
        return `€${combo.prices.cardmarket}`;
      }
      return `$${combo.prices.tcgplayer}`;
    }

    // switch (sort) {
    //   case "uses":
    //   case "steps":
    //   case "produces":
    //     if (combo[sort].length === 1) {
    //       // remove the s in the sort word
    //       return `1 ${sort.slice(0, -1)}`;
    //     }
    //     return `${combo[sort].length} ${results.sort}`;
    // }

    return "";
  };

  return (
    <div className={styles.comboResultsWrapper}>
      {results.map((combo) => (
        <Link
          href={`/combo/${combo.id}`}
          key={combo.id}
          className={`${styles.comboResult} w-full md:w-1/4`}
        >
          <div className="flex flex-col">
            <div className="flex items-center flex-grow flex-col bg-dark text-white">
              <ColorIdentity colors={Array.from(combo.identity)} size="small" />
            </div>
            <div className="flex-grow border-b-2 border-light">
              <div className="py-1">
                <span className="sr-only">Cards in combo:</span>
                {combo.uses.map(({card}) => (
                  <CardTooltip cardName={card.name} key={card.name}>
                    <div className="card-name pl-3 pr-3">
                      {(deck && !deck.cards.includes(card.name)) ? (
                        <strong className="text-red-800">
                          {card.name} (not in deck)
                        </strong>
                      ) : (
                        <span>{card.name}</span>
                      )}
                    </div>
                  </CardTooltip>
                ))}
              </div>
            </div>
            <div className="flex-grow">
              <span className="sr-only">Results in combo:</span>
              {combo.produces.map((result) => (
                <div key={result.name} className={`result pl-3 pr-3`}>
                  <TextWithMagicSymbol text={result.name} />
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
