import { CardInVariant, TemplateInVariant } from '@space-cow-media/spellbook-client';

/* A combo title only names the first few cards; everything else is summarised in the subtitle.
   Templates never appear by name in the title but do count towards the leftovers. */
const MAX_TITLE_CARDS = 3;
export const NO_CARDS_TITLE = 'No specific cards';
const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export function comboTitleCards(cards: CardInVariant[]): CardInVariant[] {
  return cards.slice(0, MAX_TITLE_CARDS);
}

export function comboSubtitle(cards: CardInVariant[], templates: TemplateInVariant[]): string {
  const titleCount = comboTitleCards(cards).reduce((count, card) => count + card.quantity, 0);
  const totalCount =
    cards.reduce((count, card) => count + card.quantity, 0) +
    templates.reduce((count, template) => count + template.quantity, 0);
  const otherCount = totalCount - titleCount;

  if (otherCount === 0) {
    return '';
  }

  return otherCount === 1 ? `(and ${NUMBERS[1]} other card)` : `(and ${NUMBERS[otherCount]} other cards)`;
}

/* Plain-text rendering of the combo title, for contexts that cannot hold markup such as <title>
   and og:title. Card names keep their raw "A-" alchemy prefix here; only ComboTitle swaps it
   for the alchemy symbol. */
export function comboTitleToText(
  cards: CardInVariant[],
  templates: TemplateInVariant[] = [],
  separator = ' | ',
): string {
  const title =
    cards.length === 0
      ? NO_CARDS_TITLE
      : comboTitleCards(cards)
          .map(({ card, quantity }) => (quantity > 1 ? `${quantity} ${card.name}` : card.name))
          .join(separator);

  return [title, comboSubtitle(cards, templates)].filter(Boolean).join(' ');
}
