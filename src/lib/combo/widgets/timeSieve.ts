import { formatSwept, sweptDots } from './shared/charts';
import { formatNumber, plural } from './shared/format';
import { OPPONENTS, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, says } from './parse/variant';

const ARTIFACTS = 5;
/* the copies attack the other opponents, so there has to be one */
const TABLE = { ...OPPONENTS, min: 2 };
/* with this many opponents one attacker already makes five artifacts */
const ONE_IS_ENOUGH = ARTIFACTS + 1;

const attackersFor = (opponents: number) => Math.ceil(ARTIFACTS / (opponents - 1));

export const timeSieve = defineWidget('time-sieve', {
  detect: (variant) =>
    has(variant, 'Time Sieve') && says(variant, /divided by the number of opponents you have minus one/i) && {},
  calculator: () => ({
    category: 'table',
    title: 'Enough attackers for an extra turn?',
    summary:
      'Each attacking artifact creature makes a copy for each other opponent, and Time Sieve needs five artifacts to sacrifice: ⌈5 ÷ (opponents − 1)⌉ attackers.',
    inputs: [TABLE, numberInput('attackers', 'Artifact creatures that can attack', 3)],
    compute(values) {
      const { opponents, attackers } = values.numbers;
      const needed = attackersFor(opponents);
      return {
        headline: { label: 'Attackers needed', value: formatNumber(needed) },
        verdict:
          attackers >= needed
            ? { tone: 'good', title: 'Enough for an extra turn every turn' }
            : { tone: 'bad', title: `${plural(needed - attackers, 'attacker')} short` },
        meter: { have: attackers, need: needed, unit: 'attackers' },
        charts: [
          {
            kind: 'dots',
            title: 'Attackers needed',
            xLabel: TABLE.label,
            yLabel: 'Attackers',
            selects: TABLE.key,
            steadyFrom: ONE_IS_ENOUGH,
            ...sweptDots(
              TABLE,
              opponents,
              (table) => ({
                y: attackersFor(table),
                label: `${formatSwept(table, ONE_IS_ENOUGH)} opponents: ${plural(attackersFor(table), 'attacker')}`,
                tone: attackers >= attackersFor(table) ? 'good' : 'bad',
              }),
              ONE_IS_ENOUGH,
            ),
          },
        ],
      };
    },
  }),
});
