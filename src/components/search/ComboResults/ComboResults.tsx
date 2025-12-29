import styles from './comboResults.module.scss';
import Link from 'next/link';
import ColorIdentity from '../../layout/ColorIdentity/ColorIdentity';
import CardTooltip from '../../layout/CardTooltip/CardTooltip';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import pluralize from 'pluralize';
import { Deck, Variant, VariantPrices } from '@space-cow-media/spellbook-client';
import React, { useRef, useState } from 'react';
import { countPrerequisites } from 'lib/prerequisitesProcessor';
import Icon from 'components/layout/Icon/Icon';
import { IS_LOCK } from 'lib/constants';

type ResultProps = {
  decklist?: Map<string, number>; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  combo: Variant;
  sort?: string;
  newTab?: boolean;
  hideVariants?: boolean;
};

export const ComboResult: React.FC<ResultProps> = ({
  combo,
  decklist,
  sort,
  newTab,
  hideVariants,
  decklistMessage,
}) => {
  const sortStatMessage = (combo: Variant) => {
    if (!sort) {
      return '';
    }

    if (sort === 'popularity') {
      const numberOfDecks = combo.popularity;

      if (numberOfDecks === null || numberOfDecks === undefined) {
        return 'No deck data (EDHREC)';
      }

      const deckString = pluralize('deck', numberOfDecks);

      return `${numberOfDecks} ${deckString} (EDHREC)`;
    }

    if (sort.startsWith('price')) {
      if (sort.includes('cardkingdom')) {
        return `$${combo.prices.cardkingdom}`;
      }
      if (sort.includes('cardmarket')) {
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

    return '';
  };

  const prereqCount = countPrerequisites(combo);

  const stateBasedColor = combo.status === 'OK' ? 'dark' : combo.status === 'E' ? '[#888888]' : 'wip';
  const stateBasedColorInverse = combo.status === 'OK' ? 'light' : combo.status === 'E' ? 'dark' : 'light';
  const stateBasedTooltip =
    combo.status === 'OK' ? undefined : combo.status === 'E' ? 'Combo marked as EXAMPLE' : 'Combo marked as DRAFT';
  const isLock = combo.produces.some((result) => result.feature.name.toLowerCase() === 'lock');

  return (
    <Link
      href={`/combo/${combo.id}`}
      key={combo.id}
      className={`${styles.comboResult} w-full md:w-1/4`}
      rel={newTab ? 'noopener noreferrer' : undefined}
      target={newTab ? '_blank' : undefined}
    >
      <div className="flex flex-col relative">
        <div className="absolute left-2 top-2 text-xl text-gray-600" title={IS_LOCK}>
          {isLock && <Icon name="lock" />}
        </div>
        <div
          className={`flex items-center flex-grow flex-col bg-${stateBasedColor} text-white`}
          title={stateBasedTooltip}
        >
          <ColorIdentity identity={combo.identity} size="small" />
        </div>
        <div className={`flex-grow  ${styles.comboResultSection}`}>
          <div className="py-1">
            <span className="sr-only">Cards in combo:</span>
            {combo.uses.map(({ card, quantity }) => (
              <CardTooltip card={card} key={card.name}>
                <div className={`card-name pl-3 pr-3 ${styles.cardName}`}>
                  {decklist && quantity - (decklist.get(card.name.toLowerCase()) ?? 0) > 0 ? (
                    decklistMessage != undefined ? (
                      <strong className="text-blue-800">
                        {card.name}
                        {decklistMessage ? ` (${decklistMessage})` : ''}
                      </strong>
                    ) : (
                      <strong className="text-red-800">{card.name} (not in deck)</strong>
                    )
                  ) : (
                    <span>
                      {quantity > 1 ? `${quantity} ` : ''}
                      {card.name}
                    </span>
                  )}
                </div>
              </CardTooltip>
            ))}
            {combo.requires.length > 0 && (
              <div className={`${styles.prerequisites} pl-3 pr-3`}>
                <span>
                  +{combo.requires.reduce((q, r) => q + r.quantity, 0)} other card
                  {combo.requires.reduce((q, r) => q + r.quantity, 0) > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {prereqCount > 0 && (
              <div className={`${styles.prerequisites} pl-3 pr-3`}>
                <span>
                  +{prereqCount} other prerequisite{prereqCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <span className="sr-only">Results in combo:</span>
          {combo.produces
            .filter((result) => result.feature.name.toLowerCase() != 'lock')
            .map((result) => (
              <div key={result.feature.name} className={`result pl-3 pr-3`}>
                <TextWithMagicSymbol text={result.feature.name} />
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center flex-grow flex-col">
        <div className="flex-grow" />
        {!hideVariants && combo.variantCount > 1 && (
          <div className={styles.variantBanner}>
            <span className="pl-3 pr-3">
              + {combo.variantCount - 1} variant{combo.variantCount > 2 ? 's' : ''}
            </span>
          </div>
        )}
        {sortStatMessage(combo) && (
          <div
            className={`sort-footer w-full py-1 text-center flex-shrink bg-${stateBasedColor} text-${stateBasedColorInverse}`}
            title={stateBasedTooltip}
          >
            {sortStatMessage(combo)}
          </div>
        )}
      </div>
    </Link>
  );
};

type Props = {
  deck?: Deck; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  results: Variant[];
  sort?: string;
  vendor?: Array<keyof VariantPrices>;
  hideVariants?: boolean;
  localPageLimit?: number; // If passed in, will limit the number of results shown on the local page
};

const ComboResults: React.FC<Props> = ({ results, sort, deck, hideVariants, decklistMessage, localPageLimit }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const decklist = deck?.main.concat(deck.commanders).reduce((acc, card) => {
    const lowercase = card.card.toLowerCase();
    acc.set(lowercase, (acc.get(lowercase) ?? 0) + card.quantity);
    return acc;
  }, new Map<string, number>());

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const element = ref.current;
    if (element) {
      element.scrollIntoView();
    }
  };

  const hasMoreResults = localPageLimit ? page * localPageLimit < results.length : false;

  const localResults = localPageLimit ? results.slice((page - 1) * localPageLimit, page * localPageLimit) : results;

  return (
    <div ref={ref} className={styles.comboResultsWrapper}>
      {localResults.map((combo) => (
        <ComboResult
          combo={combo}
          decklist={decklist}
          sort={sort}
          key={combo.id}
          hideVariants={hideVariants}
          decklistMessage={decklistMessage}
        />
      ))}
      {!!localPageLimit && (
        <div className="w-full flex justify-center">
          {page > 1 && (
            <button className="button" onClick={() => handlePageChange(page - 1)}>
              View Previous
            </button>
          )}
          {hasMoreResults && (
            <button className="button" onClick={() => handlePageChange(page + 1)}>
              View More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboResults;
