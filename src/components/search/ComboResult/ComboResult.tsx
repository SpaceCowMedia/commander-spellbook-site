import styles from './comboResult.module.scss';
import Link from 'next/link';
import ColorIdentity from 'components/symbols/ColorIdentity/ColorIdentity';
import CardTooltip from 'components/card/CardTooltip/CardTooltip';
import TemplateTooltip from 'components/card/TemplateTooltip/TemplateTooltip';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';
import CardName from 'components/card/CardName/CardName';
import pluralize from 'pluralize';
import { CardPrices, Variant } from '@space-cow-media/spellbook-client';
import React from 'react';
import { countNotablePrerequisites } from 'lib/combo/prerequisitesProcessor';
import Icon from 'components/ui/Icon/Icon';
import { IS_LOCK } from 'lib/constants';
import { useRouter } from 'next/router';
import { queryParameterAsString } from 'lib/http/queryParameters';
import { getTemplateNameSummary } from 'lib/card/faces';
import useFoolsDay, { bonusResult } from 'lib/foolsDay';
import SolRingPrice from 'components/combo/SolRingPrice/SolRingPrice';
import { formatSalt, MAX_SALT } from 'lib/salt/salt';

interface Props {
  decklist?: Map<string, number>; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  combo: Variant;
  sort?: string;
  newTab?: boolean;
  hideVariants?: boolean;
}

const ComboResult: React.FC<Props> = ({ combo, decklist, sort, newTab, hideVariants, decklistMessage }) => {
  const router = useRouter();

  // A result opened from a search hands the query over to the combo page, the same way the redirect
  // to a single match does: the search bar picks it up and drops it from the URL, so the search
  // stays visible and ready to be resumed. Results listed anywhere else carry nothing.
  const searchQuery = router.pathname === '/search' ? queryParameterAsString(router.query.q) : undefined;
  const comboLink =
    searchQuery === undefined ? `/combo/${combo.id}` : `/combo/${combo.id}?${new URLSearchParams({ q: searchQuery })}`;

  const foolsDay = useFoolsDay();
  const priceStore: keyof CardPrices | undefined = !sort?.startsWith('price')
    ? undefined
    : sort.includes('cardkingdom')
      ? 'cardkingdom'
      : sort.includes('cardmarket')
        ? 'cardmarket'
        : 'tcgplayer';

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

    if (sort === 'salt') {
      if (combo.salt === null) {
        return 'Too few salt votes';
      }

      return `Salt ${formatSalt(combo.salt)} / ${MAX_SALT} (${combo.saltVoteCount} ${pluralize('vote', combo.saltVoteCount)})`;
    }

    if (priceStore) {
      return `${priceStore === 'cardmarket' ? '€' : '$'}${combo.prices[priceStore]}`;
    }

    return '';
  };

  const prereqCount = countNotablePrerequisites(combo);

  const statusClass =
    combo.status === 'OK' ? styles.okStatus : combo.status === 'E' ? styles.exampleStatus : styles.draftStatus;
  const stateBasedTooltip =
    combo.status === 'OK' ? undefined : combo.status === 'E' ? 'Combo marked as EXAMPLE' : 'Combo marked as DRAFT';
  const isLock = combo.produces.some((result) => result.feature.name.toLowerCase() === 'lock');
  const results = combo.produces.filter((result) => result.feature.name.toLowerCase() != 'lock');

  return (
    <Link
      href={comboLink}
      key={combo.id}
      className={`${styles.comboResult} w-full md:w-1/4`}
      rel={newTab ? 'noopener noreferrer' : undefined}
      target={newTab ? '_blank' : undefined}
    >
      <div className="flex flex-col relative">
        <div className="absolute left-2 top-2 text-xl text-gray-600" title={IS_LOCK}>
          {isLock && <Icon name="lock" />}
        </div>
        <div className={`flex items-center grow flex-col ${statusClass}`} title={stateBasedTooltip}>
          <ColorIdentity identity={combo.identity} size="small" />
        </div>
        <div className={`grow  ${styles.comboResultSection}`}>
          <div className="py-1">
            <span className="sr-only">Cards in combo:</span>
            {combo.uses.map(({ card, quantity, usedFace }) => (
              <CardTooltip card={card} faceToShow={usedFace} key={card.name}>
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
            {combo.requires.map((template) => (
              <TemplateTooltip
                template={template}
                key={template.template.id}
                caption="Open the combo to see all possible replacements"
              >
                <div className={`${styles.prerequisites} ${styles.cardName} pl-3 pr-3`}>
                  <span>
                    + {template.quantity > 1 ? `${template.quantity}x ` : ''}
                    <TextWithMagicSymbol
                      text={getTemplateNameSummary(template.template.name) ?? template.template.name}
                    />
                  </span>
                </div>
              </TemplateTooltip>
            ))}
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
          {results.map((result) => (
            <div key={result.feature.name} className={`result pl-3 pr-3`}>
              <TextWithMagicSymbol text={result.feature.name} />
            </div>
          ))}
          {foolsDay && results.length > 0 && <div className="result pl-3 pr-3">{bonusResult(combo.id)}</div>}
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
          <div className={`sort-footer w-full py-1 text-center shrink ${statusClass}`} title={stateBasedTooltip}>
            {sortStatMessage(combo)}
            {priceStore && <SolRingPrice className="ml-1" price={combo.prices[priceStore]} store={priceStore} />}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ComboResult;
