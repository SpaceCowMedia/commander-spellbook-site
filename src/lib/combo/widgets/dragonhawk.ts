import { formatNumber } from './shared/format';
import { LIBRARY, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, usesAny } from './parse/variant';

const COPIES = 5;
/* Dragonhawk and its five copies have 5 power */
const DRAGONHAWKS = COPIES + 1;
/* the combo's other pieces with 4 power or more */
const STRONG_PIECES = ['Cadric, Soul Kindler', 'The Master, Multiplied'];

const OTHERS = numberInput('others', 'Other creatures you control with power 4 or more', 0);
const PLAYED = numberInput('played', 'Exiled cards you play', 0);

/* Each copy exiles a card per creature with power 4 or more, as many as your library holds, and each
   card still exiled at your end step is 2 damage to each opponent. */
export function dragonhawkDamage(strong: number, library: number, played: number): { exiled: number; damage: number } {
  const exiled = Math.min(COPIES * strong, library);
  return { exiled, damage: 2 * Math.max(0, exiled - played) };
}

export const dragonhawk = defineWidget('dragonhawk', {
  detect: (variant) =>
    has(variant, "Dragonhawk, Fate's Tempest") &&
    usesAny(variant, ['Rite of Replication', 'Orthion, Hero of Lavabrink']) && {
      strong: DRAGONHAWKS + STRONG_PIECES.filter((name) => has(variant, name)).length,
    },
  calculator: ({ strong }) => ({
    category: 'finite',
    title: 'How much damage the Dragonhawks deal',
    summary: `Five copies of Dragonhawk each exile a card for every creature you control with power 4 or more, ${strong} with the combo's own. At your end step, each card still exiled deals 2 damage to each opponent.`,
    inputs: [OTHERS, PLAYED, LIBRARY],
    compute(values) {
      const { others, library, played } = values.numbers;
      const { exiled, damage } = dragonhawkDamage(strong + others, library, played);
      return {
        headline: { label: 'Damage to each opponent', value: formatNumber(damage) },
        stats: [{ label: 'Cards exiled', value: formatNumber(exiled) }],
      };
    },
  }),
});
