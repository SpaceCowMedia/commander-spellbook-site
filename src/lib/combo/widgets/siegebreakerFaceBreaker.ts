import { ManaCost, formatMana, manaValue, parseMana } from 'lib/symbols/mana';
import { formatSwept, sweptDots } from './shared/charts';
import { formatNumber } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const EXTRA_COMBAT = parseMana('{3}{R}{R}')!;
const OPPONENTS_HIT = numberInput('opponents', 'Opponents your creatures hit', 3, { min: 1 });

/* from this many opponents on, the first combat's Treasures already pay for the next */
const FREE_FROM = Math.ceil(Math.sqrt(manaValue(EXTRA_COMBAT)));

/* The copies stay all turn and each makes a Treasure for every player hit, so the nth combat makes
   n × opponents² Treasures. Your own mana covers the combats that make fewer than the next one
   costs: what they fall short of is a triangle. */
export function faceBreakerStart(opponents: number): { mana: ManaCost; combats: number } {
  const cost = manaValue(EXTRA_COMBAT);
  const each = opponents * opponents;
  const combats = Math.ceil(cost / each) - 1;
  return { mana: { generic: cost * combats - (each * combats * (combats + 1)) / 2, pips: {} }, combats };
}

export const siegebreakerFaceBreaker = defineWidget('siegebreaker-face-breaker', {
  detect: (variant) => has(variant, 'Mardu Siegebreaker', 'Professional Face-Breaker', 'Aggravated Assault') && {},
  calculator: () => ({
    category: 'table',
    title: "How much mana until the Treasures pay for Aggravated Assault's combats?",
    summary: `Each attack, Mardu Siegebreaker makes a copy of Professional Face-Breaker for each opponent, and the copies stay until your next end step. Every copy makes a Treasure for each player your creatures hit, and another combat costs ${formatMana(EXTRA_COMBAT)}, so the Treasures pay for every combat from ${FREE_FROM} opponents on.`,
    inputs: [OPPONENTS_HIT],
    compute(values) {
      const { mana, combats } = faceBreakerStart(values.numbers.opponents);
      return {
        headline: { label: 'Mana to start', value: formatMana(mana), mana },
        stats: [
          { label: 'Each extra combat costs', value: formatMana(EXTRA_COMBAT), mana: EXTRA_COMBAT },
          { label: 'Combats you pay for', value: formatNumber(combats) },
        ],
        charts: [
          {
            kind: 'dots',
            title: 'Mana to start',
            xLabel: OPPONENTS_HIT.label,
            yLabel: 'Mana value',
            selects: OPPONENTS_HIT.key,
            steadyFrom: FREE_FROM,
            ...sweptDots(
              OPPONENTS_HIT,
              values.numbers.opponents,
              (opponents) => {
                const at = faceBreakerStart(opponents).mana;
                return { y: manaValue(at), label: `${formatSwept(opponents, FREE_FROM)}: ${formatMana(at)}` };
              },
              FREE_FROM,
            ),
          },
        ],
      };
    },
  }),
});
