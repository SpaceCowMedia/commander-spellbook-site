import { CardDetail } from '@space-cow-media/spellbook-client';

const COLORS = ['W', 'U', 'B', 'R', 'G'];

export const COMMANDER_COMBOS_PAGE_SIZE = 12;

const quote = (name: string) => `"${name.replaceAll('"', '\\"')}"`;

// The combos a deck can play with its commanders: they use at least one of them, fit their color identity and need
// no other card in the command zone. The filter query of the deck narrows them down too.
export default function commanderCombosQuery(
  commanders: Pick<CardDetail, 'name' | 'identity'>[],
  filter: string,
): string {
  const names = [...new Set(commanders.map(({ name }) => name))].map(quote);
  const identity = COLORS.filter((color) => commanders.some((card) => card.identity.includes(color))).join('') || 'C';
  const terms = [
    names.length > 1 ? `(${names.map((name) => `card=${name}`).join(' OR ')})` : `card=${names[0]}`,
    `ci:${identity.toLowerCase()}`,
    `(-is:commander OR ${names.map((name) => `commander=${name}`).join(' OR ')})`,
  ];
  // `AND` binds more tightly than `OR`, so the filter is grouped to apply as a whole.
  if (filter.trim()) {
    terms.push(`(${filter.trim()})`);
  }
  return terms.join(' ');
}
