import styles from './comboVariantGroup.module.scss';
import pluralize from 'pluralize';
import React, { useContext, useId, useMemo, useState } from 'react';
import { ColorEnum, Deck, Variant } from '@space-cow-media/spellbook-client';
import ColorIdentity from 'components/layout/ColorIdentity/ColorIdentity';
import CardTooltip from 'components/layout/CardTooltip/CardTooltip';
import TemplateTooltip from 'components/layout/TemplateTooltip/TemplateTooltip';
import TextWithMagicSymbol from 'components/layout/TextWithMagicSymbol/TextWithMagicSymbol';
import CardName from 'components/layout/CardName/CardName';
import Icon from 'components/layout/Icon/Icon';
import Modal, { ModalDepthContext } from 'components/ui/Modal/Modal';
import ComboResultFrame from '../ComboResultFrame/ComboResultFrame';
import ComboResults from '../ComboResults/ComboResults';
import VariantTransition, { GatheredVariants } from '../VariantTransition/VariantTransition';
import VariantGroupingSwitch from '../VariantGroupingSwitch/VariantGroupingSwitch';
import MissingCardClusters, {
  groupByMissingCard,
} from 'components/FindMyCombos/MissingCardClusters/MissingCardClusters';
import useVariantGrouping from 'lib/useVariantGrouping';
import { MODAL_REGROUP } from 'lib/viewTransitions';
import { ComboPiece, ReplaceablePiece, VariantCategory, variantReplacements } from 'lib/variantGroups';
import { getTemplateNameSummary } from 'lib/types';
import { DEFAULT_SORT, IS_LOCK } from 'lib/constants';
import cn from 'lib/cn';
import countDeckCards, { isMissingFromDeck } from 'lib/countDeckCards';

interface Props {
  variants: Variant[];
  /* Every category with its variants of the same combo, in the order the modal lists them, this group's own first. */
  categories: VariantCategory[];
  deck?: Deck;
  viewTransitionScope?: string;
}

const colorsOf = (identity: ColorEnum) => identity.split('').filter((color) => color !== ColorEnum.C);

const combinedIdentity = (variants: Variant[]) => {
  const colors = new Set(variants.flatMap(({ identity }) => colorsOf(identity)));
  return (
    Object.values(ColorEnum).find((identity) => {
      const own = colorsOf(identity);
      return own.length === colors.size && own.every((color) => colors.has(color));
    }) ?? ColorEnum.C
  );
};

const SHOWN_REPLACEMENTS = 3;

const nameOf = (piece: ComboPiece) =>
  'card' in piece ? piece.card.card.name : `template ${piece.template.template.id}`;

// Each card is named once, under the first card of the most popular variant it replaces.
const namedOnce = (replaceablePieces: ReplaceablePiece[]): ReplaceablePiece[] => {
  const named = new Set(replaceablePieces.map(({ piece }) => nameOf(piece)));
  return replaceablePieces.map(({ piece, replacements }) => ({
    piece,
    replacements: replacements.filter(({ piece: replacement }) => {
      const name = nameOf(replacement);
      const isNew = !named.has(name);
      named.add(name);
      return isNew;
    }),
  }));
};

const deckOf = (variant: Variant): Deck => ({
  commanders: [],
  main: variant.uses.map(({ card, quantity }) => ({ card: card.name, quantity })),
});

const Piece: React.FC<{ piece: ComboPiece; decklist?: Map<string, number> }> = ({ piece, decklist }) => {
  if ('card' in piece) {
    const { card, quantity, usedFace } = piece.card;
    return (
      <CardTooltip card={card} faceToShow={usedFace}>
        <span className={`card-name ${styles.piece}`}>
          {decklist && isMissingFromDeck(piece.card, decklist) ? (
            <strong className="text-red-800">
              <CardName name={card.name} /> (not in deck)
            </strong>
          ) : (
            <>
              {quantity > 1 ? `${quantity} ` : ''}
              <CardName name={card.name} />
            </>
          )}
        </span>
      </CardTooltip>
    );
  }
  const { template, quantity } = piece.template;
  return (
    <TemplateTooltip template={piece.template} caption="Open the combo to see all possible replacements">
      <span className={cn(styles.piece, styles.muted)}>
        + {quantity > 1 ? `${quantity}x ` : ''}
        <TextWithMagicSymbol text={getTemplateNameSummary(template.name) ?? template.name} />
      </span>
    </TemplateTooltip>
  );
};

// The variants of the first category, which can be grouped by the card they miss.
const ModalCategory: React.FC<{ categories: VariantCategory[]; deck?: Deck }> = ({ categories, deck }) => {
  const [{ label, detail, variants, inDeck }] = categories;
  const [grouping, regroup] = useVariantGrouping('card', MODAL_REGROUP);
  const id = useId();
  // Clusters open modals of their own, which would open more without end inside a modal already nested.
  const nested = useContext(ModalDepthContext) > 1;
  const groupable = !inDeck && !nested;
  const groups = useMemo(
    () => (groupable ? groupByMissingCard(variants, countDeckCards(deck)) : []),
    [groupable, variants, deck],
  );

  return (
    <>
      <h4 className={styles.modalSection}>
        {variants.length} {label}
        {detail && `, ${detail}`}
      </h4>
      {inDeck ? (
        <p className={styles.modalDescription}>
          The most popular comes first, and the cards the others use instead of its own are highlighted.
        </p>
      ) : (
        groupable && (
          <VariantGroupingSwitch
            id={`${id}grouping`}
            value={grouping}
            onChange={regroup}
            groupings={['card', 'ungrouped']}
          />
        )
      )}
      {grouping === 'card' && groups.length > 0 ? (
        <MissingCardClusters groups={groups} categories={categories} deck={deck} />
      ) : (
        <div className={styles.modalResults}>
          <ComboResults
            results={variants}
            sort={DEFAULT_SORT}
            hideVariants={true}
            localPageLimit={100}
            decklistMessage={inDeck ? '' : undefined}
            deck={inDeck ? deckOf(variants[0]) : deck}
          />
        </div>
      )}
    </>
  );
};

const ComboVariantGroup: React.FC<Props> = ({ variants, categories, deck, viewTransitionScope }) => {
  const [mostPopular, ...otherVariants] = variants;
  const [category] = categories;
  const replaceablePieces = useMemo(() => namedOnce(variantReplacements(variants)), [variants]);
  const [open, setOpen] = useState(false);
  const decklist = countDeckCards(deck);
  const variantCount = categories.reduce((count, { variants }) => count + variants.length, 0);

  const results = mostPopular.produces.filter(({ feature }) =>
    variants.every(({ produces }) => produces.some((result) => result.feature.id === feature.id)),
  );
  const otherResultCount =
    new Set(variants.flatMap(({ produces }) => produces.map(({ feature }) => feature.id))).size - results.length;
  const isLock = results.some(({ feature }) => feature.name.toLowerCase() === 'lock');
  const shownResults = results.filter(({ feature }) => feature.name.toLowerCase() !== 'lock');
  const status = variants.every(({ status }) => status === mostPopular.status) ? mostPopular.status : undefined;

  return (
    <>
      <VariantTransition scope={viewTransitionScope} variant={mostPopular}>
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          className={`relative flex w-full min-w-0 max-w-lg my-2 grow md:w-1/4 ${styles.comboVariantGroup}`}
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
              return;
            }
            event.preventDefault();
            setOpen(true);
          }}
        >
          <ComboResultFrame
            status={status}
            header={
              <>
                {isLock && (
                  <div className="absolute left-2 top-2 text-xl text-gray-600" title={IS_LOCK}>
                    <Icon name="lock" />
                  </div>
                )}
                <ColorIdentity identity={combinedIdentity(variants)} size="small" />
              </>
            }
            banner={`+ ${variants.length - 1}/${variantCount - 1} variants ${category.label}`}
            footer="Click to see the variants"
          >
            <div className="flex flex-col">
              <div className={`grow py-1 ${styles.tree}`}>
                <span className="sr-only">Cards in the most popular variant, each followed by its replacements:</span>
                {replaceablePieces.map(({ piece, replacements }) => (
                  <div key={piece.key}>
                    <div className={cn(styles.stop, styles.mostPopular)}>
                      <Piece piece={piece} decklist={decklist} />
                    </div>
                    {replacements.length > 0 && (
                      <ul className={styles.replacements}>
                        {replacements.slice(0, SHOWN_REPLACEMENTS).map(({ piece: replacement }) => (
                          <li key={replacement.key} className={styles.replacement}>
                            <div className={styles.stop}>
                              <Piece piece={replacement} decklist={decklist} />
                            </div>
                          </li>
                        ))}
                        {replacements.length > SHOWN_REPLACEMENTS && (
                          <li className={styles.more}>
                            <span className="sr-only">and {replacements.length - SHOWN_REPLACEMENTS} more</span>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <div className="grow">
                <span className="sr-only">Results in every variant:</span>
                {shownResults.map((result) => (
                  <div key={result.feature.id} className="result pl-3 pr-3">
                    <TextWithMagicSymbol text={result.feature.name} />
                  </div>
                ))}
                {otherResultCount > 0 && (
                  <div className={cn('pl-3 pr-3', styles.muted)}>
                    {results.length
                      ? `+${otherResultCount} more ${pluralize('result', otherResultCount)} in some variants`
                      : `${otherResultCount} ${pluralize('result', otherResultCount)}, depending on the variant`}
                  </div>
                )}
              </div>
            </div>
          </ComboResultFrame>
          {viewTransitionScope && <GatheredVariants scope={viewTransitionScope} variants={otherVariants} />}
        </div>
      </VariantTransition>

      <Modal open={open} onClose={() => setOpen(false)} closeIcon={true} size="large">
        <h3 className={styles.modalTitle}>{variantCount} variants of the same combo</h3>
        {categories
          .filter(({ variants }) => variants.length)
          .map((shownCategory) => (
            <ModalCategory
              key={`${shownCategory.label} ${shownCategory.detail}`}
              categories={[shownCategory, ...categories.filter((category) => category !== shownCategory)]}
              deck={deck}
            />
          ))}
      </Modal>
    </>
  );
};

export default ComboVariantGroup;
