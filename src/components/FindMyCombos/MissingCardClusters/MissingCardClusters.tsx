import styles from './missingCardClusters.module.scss';
import React, { useContext, useId, useMemo, useState, ViewTransition } from 'react';
import Link from 'next/link';
import pluralize from 'pluralize';
import { Card, Deck, Variant, VariantStatusEnum } from '@space-cow-media/spellbook-client';
import Modal, { ModalDepthContext } from 'components/ui/Modal/Modal';
import CardTooltip from 'components/layout/CardTooltip/CardTooltip';
import CardName from 'components/layout/CardName/CardName';
import Icon from 'components/layout/Icon/Icon';
import SpoilerFog from 'components/layout/SpoilerFog/SpoilerFog';
import ComboResultFrame from 'components/search/ComboResultFrame/ComboResultFrame';
import ComboResults from 'components/search/ComboResults/ComboResults';
import { GatheredVariants } from 'components/search/VariantTransition/VariantTransition';
import { DEFAULT_SORT } from 'lib/constants';
import { isMissingFromDeck } from 'lib/countDeckCards';
import { cardPath } from 'lib/cards';
import { MODAL_REGROUP, REGROUP_FADE } from 'lib/viewTransitions';
import { groupVariantsByCombo, VariantCategory } from 'lib/variantGroups';
import useVariantGrouping from 'lib/useVariantGrouping';
import VariantGroupingSwitch from 'components/search/VariantGroupingSwitch/VariantGroupingSwitch';

export interface MissingCardGroup {
  key: string;
  card: Card;
  combos: Variant[];
  /* Only when every combo of the group shares it. */
  status?: VariantStatusEnum;
  previewCards: Card[];
}

type MissingCardCombos = Pick<MissingCardGroup, 'key' | 'card' | 'combos'>;

interface MissingCardPreviewProps {
  card: Card;
  className: string;
  fallbackClassName: string;
  interactive?: boolean;
}

const MissingCardPreview: React.FC<MissingCardPreviewProps> = ({ card, className, fallbackClassName, interactive }) => {
  const imageUri = card.imageUriFrontNormal;
  return (
    <SpoilerFog name={card.name} spoiler={card.spoiler} interactive={interactive} className={className}>
      {imageUri ? (
        <img src={imageUri} alt={`Preview of ${card.name}`} />
      ) : (
        <span className={fallbackClassName} aria-hidden="true">
          <Icon name="card" />
        </span>
      )}
    </SpoilerFog>
  );
};

const getMissingCardUse = (combo: Variant, deckCardCounts?: Map<string, number>) =>
  combo.uses.find((use) => isMissingFromDeck(use, deckCardCounts));

const getGroupPreviewCards = (group: MissingCardCombos) => {
  const cards = new Map<string, { card: Card; count: number }>();

  group.combos.forEach((combo) => {
    combo.uses.forEach(({ card }) => {
      const key = card.name.toLowerCase();
      if (key === group.key) {
        return;
      }
      const existing = cards.get(key);
      cards.set(key, {
        card,
        count: (existing?.count ?? 0) + 1,
      });
    });
  });

  return Array.from(cards.values())
    .sort((left, right) => right.count - left.count || left.card.name.localeCompare(right.card.name))
    .slice(0, 2)
    .map(({ card }) => card);
};

const getSharedStatus = (combos: Variant[]) =>
  combos.every(({ status }) => status === combos[0].status) ? combos[0].status : undefined;

export const groupByMissingCard = (combos: Variant[], deckCardCounts?: Map<string, number>): MissingCardGroup[] => {
  const groups = new Map<string, MissingCardCombos>();

  combos.forEach((combo) => {
    const missingCardUse = getMissingCardUse(combo, deckCardCounts);
    if (!missingCardUse) {
      return;
    }

    const key = missingCardUse.card.name.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.combos.push(combo);
      return;
    }

    groups.set(key, {
      key,
      card: missingCardUse.card,
      combos: [combo],
    });
  });

  return Array.from(groups.values())
    .map((group) => ({ ...group, status: getSharedStatus(group.combos), previewCards: getGroupPreviewCards(group) }))
    .sort((left, right) => right.combos.length - left.combos.length || left.card.name.localeCompare(right.card.name));
};

const MissingCardHand: React.FC<{ group: MissingCardGroup }> = ({ group }) => {
  // From the back of the hand to the missing card, held in front.
  const hand: [Card | undefined, string][] = [
    [group.previewCards[0], styles.groupHandCardBack],
    [group.previewCards[1], styles.groupHandCardMiddle],
    [group.card, styles.groupHandCardFront],
  ];

  return (
    <div className={styles.groupCardHand}>
      {hand.map(
        ([card, slotClassName]) =>
          card && (
            <CardTooltip card={card} key={slotClassName}>
              <div className={`${styles.groupHandCardSlot} ${slotClassName}`}>
                <MissingCardPreview
                  card={card}
                  className={styles.groupHandCard}
                  fallbackClassName={styles.groupCardPreviewFallback}
                />
              </div>
            </CardTooltip>
          ),
      )}
    </div>
  );
};

interface Props {
  groups: MissingCardGroup[];
  /* The categories of the combos found, theirs first, for grouping a cluster's combos by combo. */
  categories: VariantCategory[];
  deck?: Deck;
  viewTransitionScope?: string;
}

const ClusterCombos: React.FC<Omit<Props, 'groups' | 'viewTransitionScope'> & { group: MissingCardGroup }> = ({
  group,
  categories,
  deck,
}) => {
  const [grouping, regroup] = useVariantGrouping('combo', MODAL_REGROUP);
  const id = useId();
  // Only when some of the combos are variants of the same one, and not inside a modal already nested: its groups open
  // modals of their own, which would open more without end.
  const nested = useContext(ModalDepthContext) > 1;
  const groupable = useMemo(
    () => !nested && groupVariantsByCombo(group.combos).length < group.combos.length,
    [nested, group.combos],
  );
  return (
    <>
      {groupable && <VariantGroupingSwitch id={`${id}grouping`} value={grouping} onChange={regroup} />}
      <div className={styles.groupModalResults}>
        <ComboResults
          results={group.combos}
          deck={deck}
          sort={DEFAULT_SORT}
          hideVariants={true}
          localPageLimit={100}
          groupVariants={groupable && grouping === 'combo' ? categories : undefined}
        />
      </div>
    </>
  );
};

// The combos that miss a card, one cluster per card, each opening its combos. Given a scope, their cards fly into the
// clusters and out of them as they are grouped otherwise; in a modal, which can't clip them, the modal resizes instead.
const MissingCardClusters: React.FC<Props> = ({ groups, categories, deck, viewTransitionScope }) => {
  const [expandedGroupKey, setExpandedGroupKey] = useState<string>();
  const expandedGroup = groups.find((group) => group.key === expandedGroupKey);
  const grid = (
    <div className={styles.groupGrid}>
      {groups.map((group) => (
        <div
          key={group.key}
          role="button"
          tabIndex={0}
          className={styles.groupCardButton}
          onClick={() => setExpandedGroupKey(group.key)}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) {
              return;
            }
            event.preventDefault();
            setExpandedGroupKey(group.key);
          }}
        >
          <SpoilerFog name={group.card.name} spoiler={group.card.spoiler} blurContent>
            <ComboResultFrame
              status={group.status}
              header={
                <div className={styles.groupCardHeader}>
                  <CardTooltip card={group.card}>
                    <span>
                      <CardName name={group.card.name} />
                    </span>
                  </CardTooltip>
                </div>
              }
              footer={`${group.combos.length} ${pluralize('combo', group.combos.length)}`}
            >
              <div className={styles.groupCardBody}>
                <MissingCardHand group={group} />
              </div>
            </ComboResultFrame>
          </SpoilerFog>
          {viewTransitionScope && <GatheredVariants scope={viewTransitionScope} variants={group.combos} />}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {viewTransitionScope ? (
        <ViewTransition enter={REGROUP_FADE} exit={REGROUP_FADE} default="none">
          {grid}
        </ViewTransition>
      ) : (
        grid
      )}

      <Modal open={!!expandedGroup} onClose={() => setExpandedGroupKey(undefined)} closeIcon={true} size="large">
        {expandedGroup && (
          <div className={styles.groupModalContent}>
            <Link
              href={cardPath(expandedGroup.card) ?? '#'}
              prefetch={false}
              className={styles.groupModalHeader}
              title={`Open ${expandedGroup.card.name} and its combos`}
            >
              <CardTooltip card={expandedGroup.card} disableTapPreview>
                <MissingCardPreview
                  card={expandedGroup.card}
                  className={styles.groupModalPreview}
                  fallbackClassName={styles.groupCardPreviewFallback}
                  interactive={false}
                />
              </CardTooltip>
              <div className={styles.groupModalCopy}>
                <p className={styles.groupModalLabel}>Missing card</p>
                <h3 className={styles.groupModalTitle}>
                  <CardTooltip card={expandedGroup.card} disableTapPreview>
                    <span className={styles.groupModalCardName}>
                      <CardName name={expandedGroup.card.name} />
                    </span>
                  </CardTooltip>
                </h3>
              </div>
            </Link>
            <p className={styles.groupModalDescription}>
              This cluster contains {expandedGroup.combos.length} {pluralize('combo', expandedGroup.combos.length)} that
              all miss this single piece.
            </p>
            <ClusterCombos group={expandedGroup} categories={categories} deck={deck} />
          </div>
        )}
      </Modal>
    </>
  );
};

export default MissingCardClusters;
