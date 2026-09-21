const OMNISCIENCE_CARD_NAME = 'omniscience';

/**
 * Tells whether a submitted card name refers to Omniscience, which is not accepted in submissions
 * when used as an alternative to having infinite mana.
 */
export default function isOmniscience(cardName?: string): boolean {
  return cardName?.trim().toLowerCase() === OMNISCIENCE_CARD_NAME;
}
