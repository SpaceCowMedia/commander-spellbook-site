import React from 'react';
import styles from './cardHeader.module.scss';
import CardName from '../../layout/CardName/CardName';
import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';

/* A combo title only names the first few cards; everything else is summarised in the subtitle.
   Templates never appear by name in the title but do count towards the leftovers. */
const MAX_TITLE_CARDS = 3;
const NO_CARDS_TITLE = 'No specific cards';
const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

interface Props {
  cards: CardInVariant[];
  templates?: TemplateInVariant[];
  cardsArt?: string[];
}

function getTitleCards(cards: CardInVariant[]): CardInVariant[] {
  return cards.slice(0, MAX_TITLE_CARDS);
}

function getSubtitle(cards: CardInVariant[], templates: TemplateInVariant[]): string {
  const titleCount = getTitleCards(cards).reduce((count, card) => count + card.quantity, 0);
  const totalCount =
    cards.reduce((count, card) => count + card.quantity, 0) +
    templates.reduce((count, template) => count + template.quantity, 0);
  const otherCount = totalCount - titleCount;

  if (otherCount === 0) {
    return '';
  }

  return otherCount === 1 ? `(and ${NUMBERS[1]} other card)` : `(and ${NUMBERS[otherCount]} other cards)`;
}

/* Plain-text rendering of the same title, for contexts that cannot hold markup such as <title>
   and og:title. Card names keep their raw "A-" alchemy prefix here; only the JSX below swaps it
   for the alchemy symbol. */
export function comboTitleToText(cards: CardInVariant[], templates: TemplateInVariant[] = []): string {
  const title =
    cards.length === 0
      ? NO_CARDS_TITLE
      : getTitleCards(cards)
          .map(({ card, quantity }) => (quantity > 1 ? `${quantity} ${card.name}` : card.name))
          .join(' | ');

  return [title, getSubtitle(cards, templates)].filter(Boolean).join(' ');
}

const CardHeader: React.FC<Props> = ({ cards, templates = [], cardsArt = [] }) => {
  const subtitle = getSubtitle(cards, templates);

  return (
    <header className={`hidden sm:flex ${styles.header}`}>
      <div className="flex w-full h-64">
        {cardsArt.map((cardArt, index) => (
          <img
            alt="Card art"
            src={cardArt}
            key={index}
            className={styles.cardWrapper}
            // style={{ backgroundImage: `url(${encodeURI(cardArt)})` }}
          />
        ))}
      </div>
      <div className={styles.mask} />
      <div className={styles.comboTitleWrapper}>
        <h1 className={`heading-title ${styles.headingTitle} ${styles.comboTitle}`}>
          {cards.length === 0
            ? NO_CARDS_TITLE
            : getTitleCards(cards).map(({ card, quantity }, index) => (
                <React.Fragment key={index}>
                  {index > 0 && ' | '}
                  {quantity > 1 && `${quantity} `}
                  <CardName name={card.name} />
                </React.Fragment>
              ))}
        </h1>
        {subtitle && <h2 className={`heading-title ${styles.headingTitle} ${styles.comboSubtitle}`}>{subtitle}</h2>}
      </div>
    </header>
  );
};

export default CardHeader;
