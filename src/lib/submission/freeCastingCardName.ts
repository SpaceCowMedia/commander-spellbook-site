const FREE_CASTING_CARD_NAMES = ['Omniscience', 'Omnipresence'];

/**
 * Returns the name of the card a submitted card name refers to, if it lets you cast spells without paying
 * their mana costs like Omniscience does. Such cards are not accepted in submissions when used as an
 * alternative to having infinite mana.
 */
export default function freeCastingCardName(cardName?: string): string | undefined {
  const normalized = cardName?.trim().toLowerCase();
  return FREE_CASTING_CARD_NAMES.find((name) => name.toLowerCase() === normalized);
}
