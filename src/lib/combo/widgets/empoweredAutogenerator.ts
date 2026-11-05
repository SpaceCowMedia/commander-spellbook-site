import { ManaCost, addMana, formatMana, manaValue, parseMana } from 'lib/symbols/mana';
import type { Dot } from './shared/calculator';
import { formatSwept, stepDots, stepPage, sweptDots } from './shared/charts';
import { formatNumber, plural } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { loopBounds } from './parse/lifeLoop';
import { MANA, has, shortName, steps } from './parse/variant';

const TAP = new RegExp(
  `^Activate (.+?)(?: using Empowered Autogenerator's ability)? by tapping it, putting a charge counter on .+? and adding (?:${MANA}|one mana of any color|\\{\\w\\} or \\{\\w\\}) for each charge counter`,
  'i',
);
const PAYMENT = new RegExp(`\\bpay(?:s|ing)? ${MANA}`, 'gi');
/* steps on a page of the chart: a tap and an untap for each loop */
const PAGE = 16;

/* Before a tap makes as much as a loop costs, your own mana covers the difference: one less each loop,
   so the most it falls short is 1 + 2 + … + (cost − counters − 1). */
export function manaToStart(cost: number, counters: number): number {
  const short = Math.max(0, cost - counters - 1);
  return (short * (short + 1)) / 2;
}

/* Your mana for the first `count` steps, from what the loop needs: up by one more with each tap, down
   by the cost of each untap. */
export function stepByStep(cost: ManaCost, counters: number, holder: string, count = 1 + PAGE): Dot[] {
  const each = manaValue(cost);
  const { dots, add } = stepDots();
  let mana = manaToStart(each, counters);
  add(mana, `To start: {${formatNumber(mana)}}`);
  for (let k = counters + 1; dots.length < count; k++) {
    mana += k;
    add(mana, `Tap ${holder} with ${plural(k, 'charge counter')}: {${formatNumber(mana)}}`);
    mana -= each;
    add(mana, `Pay ${formatMana(cost)}: {${formatNumber(mana)}} left`);
  }
  return dots.slice(0, count);
}

export const empoweredAutogenerator = defineWidget('empowered-autogenerator', {
  detect(variant) {
    const lines = steps(variant);
    const bounds = has(variant, 'Empowered Autogenerator') ? loopBounds(lines) : undefined;
    const loop = bounds ? lines.slice(bounds.start, bounds.end) : [];
    const taps = loop.map((line) => line.match(TAP)).filter((match) => match !== null);
    const others = loop.filter((line) => !TAP.test(line));
    if (taps.length !== 1 || others.some((line) => /\badding\b/i.test(line))) {
      return undefined;
    }
    const cost = others
      .flatMap((line) => [...line.matchAll(PAYMENT)].map((payment) => parseMana(payment[1])))
      .reduce<ManaCost | undefined>((total, paid) => (total && paid ? addMana(total, paid) : undefined), {
        generic: 0,
        pips: {},
      });
    return cost && manaValue(cost) > 0 && { cost: formatMana(cost), holder: shortName(taps[0][1]) };
  },
  calculator({ cost, holder }) {
    const each = parseMana(cost)!;
    const total = manaValue(each);
    const counters = numberInput('counters', `Charge counters on ${holder}`, 0);
    /* from this many counters on the first tap pays for its loop */
    const steady = total - 1;
    return {
      category: 'stats',
      title: `How much mana to start the ${holder} loop?`,
      summary: `Each tap of ${holder} puts a charge counter on it and makes a mana for each one, and each loop costs ${cost}. Until a tap makes ${formatNumber(total)}, your own mana covers the difference, one less each loop.`,
      inputs: [counters],
      compute(values) {
        const now = values.numbers.counters;
        const mana = manaToStart(total, now);
        return {
          headline: { label: 'Mana to start', value: `{${formatNumber(mana)}}`, mana: { generic: mana, pips: {} } },
          stats: [
            { label: 'Each loop costs', value: cost, mana: each },
            { label: 'Loops before it pays for itself', value: formatNumber(Math.max(0, steady - now)) },
          ],
          charts: [
            {
              title: 'Mana to start',
              xLabel: counters.label,
              selects: counters.key,
              steadyFrom: steady,
              ...sweptDots(
                counters,
                now,
                (x) => ({
                  y: manaToStart(total, x),
                  label: `${formatSwept(x, steady)}: {${formatNumber(manaToStart(total, x))}}`,
                }),
                steady,
              ),
            },
            {
              title: 'Your mana, step by step',
              xLabel: 'Step',
              ...stepPage((count) => stepByStep(each, now, holder, count), values.page ?? 0, PAGE),
            },
          ],
        };
      },
    };
  },
});
