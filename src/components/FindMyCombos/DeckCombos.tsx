import ComboResults from 'components/search/ComboResults/ComboResults';
import React, { useMemo, useState } from 'react';
import { Decklist } from 'pages/find-my-combos';
import { ResultType } from 'lib/findMyCombosResultsCache';
import pluralize from 'pluralize';
import { Card, Deck, Variant } from '@space-cow-media/spellbook-client';
import styles from './deckCombos.module.scss';
import Modal from 'components/ui/Modal/Modal';
import CardTooltip from 'components/layout/CardTooltip/CardTooltip';
import CardName from 'components/layout/CardName/CardName';
import Icon from 'components/layout/Icon/Icon';
import SpoilerFog from 'components/layout/SpoilerFog/SpoilerFog';
import ComboResultFrame from 'components/search/ComboResult/ComboResultFrame';
import { DEFAULT_SORT } from 'lib/constants';

interface Props {
  currentlyParsedDeck?: Decklist;
  results: ResultType | undefined;
  query: string;
}

interface MissingCardGroup {
  key: string;
  card: Card;
  combos: Variant[];
  previewCards: Card[];
}

interface MissingCardSectionProps {
  id: string;
  title: string;
  description: string;
  combos: Variant[];
  deck?: Deck;
  deckCardCounts?: Map<string, number>;
}

interface MissingCardPreviewProps {
  card: Card;
  className: string;
  fallbackClassName: string;
  spoilerInteractive?: boolean;
}

const MissingCardPreview: React.FC<MissingCardPreviewProps> = ({
  card,
  className,
  fallbackClassName,
  spoilerInteractive = true,
}) => {
  const imageUri = card.imageUriFrontNormal;
  return (
    <SpoilerFog name={card.name} spoiler={card.spoiler} interactive={spoilerInteractive} className={className}>
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

const getDeckCardCounts = (deck?: Deck) =>
  deck?.main.concat(deck.commanders).reduce((acc, card) => {
    const key = card.card.toLowerCase();
    acc.set(key, (acc.get(key) ?? 0) + card.quantity);
    return acc;
  }, new Map<string, number>());

const getMissingCardUse = (combo: Variant, deckCardCounts?: Map<string, number>) =>
  combo.uses.find(({ card, quantity }) => quantity - (deckCardCounts?.get(card.name.toLowerCase()) ?? 0) > 0);

const getGroupPreviewCards = (group: Omit<MissingCardGroup, 'previewCards'>) => {
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

const groupByMissingCard = (combos: Variant[], deckCardCounts?: Map<string, number>): MissingCardGroup[] => {
  const groups = new Map<string, Omit<MissingCardGroup, 'previewCards'>>();

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
    .map((group) => ({ ...group, previewCards: getGroupPreviewCards(group) }))
    .sort((left, right) => right.combos.length - left.combos.length || left.card.name.localeCompare(right.card.name));
};

const MissingCardHand: React.FC<{ group: MissingCardGroup }> = ({ group }) => (
  <div className={styles.groupCardHand}>
    {group.previewCards[0] && (
      <CardTooltip card={group.previewCards[0]} portalPreview>
        <div className={`${styles.groupHandCardSlot} ${styles.groupHandCardBack}`}>
          <MissingCardPreview
            card={group.previewCards[0]}
            className={styles.groupHandCard}
            fallbackClassName={styles.groupCardPreviewFallback}
          />
        </div>
      </CardTooltip>
    )}
    {group.previewCards[1] && (
      <CardTooltip card={group.previewCards[1]} portalPreview>
        <div className={`${styles.groupHandCardSlot} ${styles.groupHandCardMiddle}`}>
          <MissingCardPreview
            card={group.previewCards[1]}
            className={styles.groupHandCard}
            fallbackClassName={styles.groupCardPreviewFallback}
          />
        </div>
      </CardTooltip>
    )}
    <CardTooltip card={group.card} portalPreview>
      <div className={`${styles.groupHandCardSlot} ${styles.groupHandCardFront}`}>
        <MissingCardPreview
          card={group.card}
          className={styles.groupHandCard}
          fallbackClassName={styles.groupCardPreviewFallback}
        />
      </div>
    </CardTooltip>
  </div>
);

const MissingCardSection: React.FC<MissingCardSectionProps> = ({
  id,
  title,
  description,
  combos,
  deck,
  deckCardCounts,
}) => {
  const [expandedGroupKey, setExpandedGroupKey] = useState<string>();
  const groups = useMemo(() => groupByMissingCard(combos, deckCardCounts), [combos, deckCardCounts]);
  const expandedGroup = groups.find((group) => group.key === expandedGroupKey);

  if (!combos.length) {
    return null;
  }

  return (
    <section id={id}>
      <h2 className="heading-subtitle">{title}</h2>
      <p>
        {description}{' '}
        {groups.length > 0 && (
          <strong>
            Grouped into {groups.length} missing-card {pluralize('cluster', groups.length)}. Select one to inspect its
            variants.
          </strong>
        )}
      </p>
      {groups.length > 0 ? (
        <>
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
                <SpoilerFog
                  name={group.card.name}
                  spoiler={group.card.spoiler}
                  blurContent
                  className={styles.groupSpoilerFog}
                >
                  <ComboResultFrame
                    className={styles.groupCard}
                    footerText={`${group.combos.length} ${pluralize('combo', group.combos.length)}`}
                  >
                    <div className={styles.groupCardHeader}>
                      <CardTooltip card={group.card} portalPreview>
                        <span>
                          <CardName name={group.card.name} />
                        </span>
                      </CardTooltip>
                    </div>
                    <div className={styles.groupCardBody}>
                      <MissingCardHand group={group} />
                    </div>
                  </ComboResultFrame>
                </SpoilerFog>
              </div>
            ))}
          </div>

          <Modal open={!!expandedGroup} onClose={() => setExpandedGroupKey(undefined)} closeIcon={true} size="large">
            {expandedGroup && (
              <div className={styles.groupModalContent}>
                <div className={styles.groupModalHeader}>
                  <CardTooltip card={expandedGroup.card}>
                    <MissingCardPreview
                      card={expandedGroup.card}
                      className={styles.groupModalPreview}
                      fallbackClassName={styles.groupCardPreviewFallback}
                      spoilerInteractive
                    />
                  </CardTooltip>
                  <div className={styles.groupModalCopy}>
                    <p className={styles.groupModalLabel}>Missing card</p>
                    <h3 className={styles.groupModalTitle}>
                      <CardTooltip card={expandedGroup.card}>
                        <span className={styles.groupModalCardName}>
                          <CardName name={expandedGroup.card.name} />
                        </span>
                      </CardTooltip>
                    </h3>
                  </div>
                </div>
                <p className={styles.groupModalDescription}>
                  This cluster contains {expandedGroup.combos.length} {pluralize('combo', expandedGroup.combos.length)}{' '}
                  that all miss this single piece.
                </p>
                <ComboResults
                  results={expandedGroup.combos}
                  deck={deck}
                  sort={DEFAULT_SORT}
                  hideVariants={true}
                  localPageLimit={100}
                />
              </div>
            )}
          </Modal>
        </>
      ) : (
        <ComboResults results={combos} deck={deck} sort={DEFAULT_SORT} hideVariants={true} localPageLimit={100} />
      )}
    </section>
  );
};

const DeckCombos = ({ results, query, currentlyParsedDeck }: Props) => {
  const deckCardCounts = useMemo(() => getDeckCardCounts(currentlyParsedDeck?.deck), [currentlyParsedDeck]);

  if (!results) {
    return (
      <div>
        <br />
        <h1 className="heading-subtitle">Loading Combos...</h1>
      </div>
    );
  }
  const numOfCombos = results.included.length;
  const combosInDeckHeadingText = !numOfCombos
    ? `No combos found${query.trim() ? ' for this filter query' : ''}`
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

  return (
    <div className={`${styles.deckCombos} py-4`}>
      <section id="combos-in-deck-section">
        <h2 className="heading-subtitle">{combosInDeckHeadingText}</h2>
        <ComboResults results={results.included} sort={DEFAULT_SORT} hideVariants={true} localPageLimit={100} />
      </section>

      <MissingCardSection
        id="potential-combos-in-deck-section"
        title={potentialCombosInDeckHeadingText}
        description="List of combos where your decklist is missing 1 combo piece."
        combos={results.almostIncluded}
        deck={currentlyParsedDeck?.deck}
        deckCardCounts={deckCardCounts}
      />

      <MissingCardSection
        id="potential-combos-outside-color-identity-section"
        title={potentialCombosInAdditionalColorsHeadingText}
        description="List of combos where your decklist is missing 1 combo piece, but requires at least one additional color."
        combos={results.almostIncludedByAddingColors}
        deck={currentlyParsedDeck?.deck}
        deckCardCounts={deckCardCounts}
      />
      <MissingCardSection
        id="potential-combos-outside-commander-section"
        title={`${results.almostIncludedByChangingCommanders.length} Potential Combos Found With Different Commander`}
        description="List of combos where your decklist is missing 1 combo piece, but requires changing your commander."
        combos={results.almostIncludedByChangingCommanders}
        deck={currentlyParsedDeck?.deck}
        deckCardCounts={deckCardCounts}
      />
      <MissingCardSection
        id="potential-combos-outside-color-identity-and-commander-section"
        title={`${results.almostIncludedByAddingColorsAndChangingCommanders.length} Potential Combos Found With Different Commander and Additional Colors`}
        description="List of combos where your decklist is missing 1 combo piece, but requires changing your commander and adding a color."
        combos={results.almostIncludedByAddingColorsAndChangingCommanders}
        deck={currentlyParsedDeck?.deck}
        deckCardCounts={deckCardCounts}
      />
    </div>
  );
};

export default DeckCombos;
