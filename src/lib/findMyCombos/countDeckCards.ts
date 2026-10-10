import { CardInVariant, Deck } from '@space-cow-media/spellbook-client';

// How many copies of each card the deck holds, by lowercase card name.
export default function countDeckCards(deck?: Deck): Map<string, number> | undefined {
  return deck?.main.concat(deck.commanders).reduce((acc, card) => {
    const name = card.card.toLowerCase();
    acc.set(name, (acc.get(name) ?? 0) + card.quantity);
    return acc;
  }, new Map<string, number>());
}

export const isMissingFromDeck = ({ card, quantity }: CardInVariant, deckCardCounts?: Map<string, number>) =>
  quantity - (deckCardCounts?.get(card.name.toLowerCase()) ?? 0) > 0;
