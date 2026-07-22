import styles from './comboResult.module.scss';
import Link from 'next/link';
import ColorIdentity from '../../layout/ColorIdentity/ColorIdentity';
import CardTooltip from '../../layout/CardTooltip/CardTooltip';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import CardName from '../../layout/CardName/CardName';
import pluralize from 'pluralize';
import { Variant } from '@space-cow-media/spellbook-client';
import React from 'react';
import { countPrerequisites } from 'lib/prerequisitesProcessor';
import Icon from 'components/layout/Icon/Icon';
import { IS_LOCK } from 'lib/constants';

interface Props {
  decklist?: Map<string, number>; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  combo: Variant;
  sort?: string;
  newTab?: boolean;
  hideVariants?: boolean;
}

const ComboResult: React.FC<Props> = ({ combo, decklist, sort, newTab, hideVariants, decklistMessage }) => {
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
        <div className={`flex items-center grow flex-col bg-${stateBasedColor} text-white`} title={stateBasedTooltip}>
          <ColorIdentity identity={combo.identity} size="small" />
        </div>
        <div className={`grow  ${styles.comboResultSection}`}>
          <div className="py-1">
            <span className="sr-only">Cards in combo:</span>
            {combo.uses.map(({ card, quantity }) => (
              <CardTooltip card={card} key={card.name}>
                <div className={`card-name pl-3 pr-3 ${styles.cardName}`}>
                  {decklist && quantity - (decklist.get(card.name.toLowerCase()) ?? 0) > 0 ? (
                    decklistMessage != undefined ? (
                      <strong className="text-blue-800">
                        <CardName name={card.name} />
                        {decklistMessage ? ` (${decklistMessage})` : ''}
                      </strong>
                    ) : (
                      <strong className="text-red-800">
                        <CardName name={card.name} /> (not in deck)
                      </strong>
                    )
                  ) : (
                    <span>
                      {quantity > 1 ? `${quantity} ` : ''}
                      <CardName name={card.name} />
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
        <div className="grow">
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
      <div className="flex items-center grow flex-col">
        <div className="grow" />
        {!hideVariants && combo.variantCount > 1 && (
          <div className={styles.variantBanner}>
            <span className="pl-3 pr-3">
              + {combo.variantCount - 1} variant
              {combo.variantCount > 2 ? 's' : ''}
            </span>
          </div>
        )}
        {sortStatMessage(combo) && (
          <div
            className={`sort-footer w-full py-1 text-center shrink bg-${stateBasedColor} text-${stateBasedColorInverse}`}
            title={stateBasedTooltip}
          >
            {sortStatMessage(combo)}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ComboResult;
