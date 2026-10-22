import styles from './comboResult.module.scss';
import Link from 'next/link';
import ColorIdentity from '../../layout/ColorIdentity/ColorIdentity';
import CardTooltip from '../../layout/CardTooltip/CardTooltip';
import TemplateTooltip from '../../layout/TemplateTooltip/TemplateTooltip';
import TextWithMagicSymbol from '../../layout/TextWithMagicSymbol/TextWithMagicSymbol';
import CardName from '../../layout/CardName/CardName';
import pluralize from 'pluralize';
import { CardPrices, ColorEnum, Variant } from '@space-cow-media/spellbook-client';
import React, { useContext } from 'react';
import { countNotablePrerequisites } from 'lib/prerequisitesProcessor';
import Icon from 'components/layout/Icon/Icon';
import { IS_LOCK } from 'lib/constants';
import { useRouter } from 'next/router';
import { queryParameterAsString } from 'lib/queryParameters';
import { getTemplateNameSummary } from 'lib/types';
import useFoolsDay, { bonusResult } from 'lib/foolsDay';
import { formatSalt, MAX_SALT } from 'lib/salt';
import { NewTabContext } from 'lib/newTab';
import ComboResultFrame from '../ComboResultFrame/ComboResultFrame';
import VariantTransition from '../VariantTransition/VariantTransition';
import useSolRingPrice, { priceInSolRings, SOL_RING } from 'lib/solRingPrice';
import { isMissingFromDeck } from 'lib/countDeckCards';

interface Props {
  decklist?: Map<string, number>; // If passed in, will highlight cards in the combo that are not in the deck
  decklistMessage?: string;
  combo: Variant;
  sort?: string;
  hideVariants?: boolean;
  viewTransitionScope?: string;
}

const ComboResult: React.FC<Props> = ({
  combo,
  decklist,
  sort,
  hideVariants,
  decklistMessage,
  viewTransitionScope,
}) => {
  const router = useRouter();
  const newTab = useContext(NewTabContext);

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

  const solRingPrice = useSolRingPrice(priceStore);

  // The value the combos are sorted by, if the combo has one to show.
  const sortStatMessage = (): string | undefined => {
    switch (sort) {
      case 'popularity':
        if (combo.popularity === null || combo.popularity === undefined) {
          return 'No deck data (EDHREC)';
        }
        return `${combo.popularity} ${pluralize('deck', combo.popularity)} (EDHREC)`;
      case 'salt':
        if (combo.salt === null) {
          return 'Too few salt votes';
        }
        return `Salt: ${formatSalt(combo.salt)} / ${MAX_SALT} (${combo.saltVoteCount} ${pluralize('vote', combo.saltVoteCount)})`;
      case 'identity_count': {
        const colors = combo.identity === ColorEnum.C ? 0 : combo.identity.length;
        return colors ? `${colors} ${pluralize('color', colors)}` : 'Colorless';
      }
      case 'variant_count':
        return `${combo.variantCount} ${pluralize('variant', combo.variantCount)}`;
      case 'card_count': {
        const cards = combo.uses.length + combo.requires.length;
        return `${cards} ${pluralize('card', cards)}`;
      }
      case 'result_count':
        return `${combo.produces.length} ${pluralize('result', combo.produces.length)}`;
    }

    if (priceStore) {
      const price = combo.prices[priceStore];
      const solRings = priceInSolRings(price, solRingPrice);
      return solRings === undefined
        ? `Price: ${priceStore === 'cardmarket' ? '€' : '$'}${price}`
        : `Price: ${solRings.toFixed(2)} ${pluralize(SOL_RING, solRings)}`;
    }

    // Combos carry no creation or update date to show.
    return undefined;
  };

  const prereqCount = countNotablePrerequisites(combo);

  const isLock = combo.produces.some((result) => result.feature.name.toLowerCase() === 'lock');
  const results = combo.produces.filter((result) => result.feature.name.toLowerCase() != 'lock');
  const sortStat = sortStatMessage();
  // Left to the footer when the combos are sorted by their number of variants.
  const variantCountText =
    !hideVariants && sort !== 'variant_count' && combo.variantCount > 1
      ? `+ ${combo.variantCount - 1} variant${combo.variantCount > 2 ? 's' : ''}`
      : undefined;

  return (
    <VariantTransition scope={viewTransitionScope} variant={combo}>
      <Link
        href={comboLink}
        key={combo.id}
        className="flex w-full min-w-0 max-w-lg my-2 grow md:w-1/4 no-underline"
        rel={newTab ? 'noopener noreferrer' : undefined}
        target={newTab ? '_blank' : undefined}
      >
        <ComboResultFrame
          status={combo.status}
          header={
            <>
              {isLock && (
                <div className="absolute left-2 top-2 text-xl text-gray-600" title={IS_LOCK}>
                  <Icon name="lock" />
                </div>
              )}
              <ColorIdentity identity={combo.identity} size="small" />
            </>
          }
          banner={variantCountText}
          footer={sortStat && <span className="sort-footer">{sortStat}</span>}
        >
          <div className="flex flex-col">
            <div className={`grow  ${styles.comboResultSection}`}>
              <div className="py-1">
                <span className="sr-only">Cards in combo:</span>
                {combo.uses.map((use) => {
                  const { card, quantity, usedFace } = use;
                  return (
                    <CardTooltip card={card} faceToShow={usedFace} key={card.name}>
                      <div className={`card-name pl-3 pr-3 ${styles.cardName}`}>
                        {decklist && isMissingFromDeck(use, decklist) ? (
                          decklistMessage != undefined ? (
                            <strong className="text-blue-800 dark:text-blue-300">
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
                  );
                })}
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
        </ComboResultFrame>
      </Link>
    </VariantTransition>
  );
};

export default ComboResult;
