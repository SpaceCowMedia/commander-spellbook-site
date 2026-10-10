import type { Dot, Point } from './shared/calculator';
import { sweptDots } from './shared/charts';
import { formatNumber, plural } from './shared/format';
import { castsInput, commanderTaxStat, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const CASTS = { ...castsInput('Nadier'), initial: 1 };
const POWER = numberInput('power', "Nadier's power", 3);
/* Food Chain makes 1 more than Nadier's mana value 6 */
const FOOD_CHAIN_FOR_NADIER = 7;
const NADIER_COST = 6;
const NADIER_BASE_POWER = 3;
const CYCLES = 5;

/* Each cycle exiles Nadier for 7, recasts it for 6 plus tax, then exiles its Elves for 1 each, each
   one a counter on the new Nadier. Cycle by cycle the tax grows by 2 and the Elves by 3, so what you
   are short of peaks once and then shrinks: with a = 1 + 2 × casts − power the most you are short
   is 2 × casts − 1 + a(a + 1)/2, at the a-th cycle. */
export function nadierMana(casts: number, power: number): number {
  const a = 1 + 2 * casts - power;
  const peak = a > 0 ? (a * (a + 1)) / 2 : 0;
  return Math.max(0, 2 * casts - 1 + peak);
}

/* The mana you hold through the first cycles, starting with what the loop needs: up as Food Chain
   exiles Nadier, down to recast it, up again as its Elves are exiled. */
export function cycleByCycle(casts: number, power: number, cycles = CYCLES): { dots: Dot[]; after: Point } {
  let mana = nadierMana(casts, power);
  let elves = power;
  const dots: Dot[] = [{ x: 0, y: mana, label: `To start: {${formatNumber(mana)}}` }];
  const step = (label: string) => dots.push({ x: dots.length, y: mana, label });
  for (let cycle = 0; cycle < cycles; cycle++) {
    mana += FOOD_CHAIN_FOR_NADIER;
    step(`Exile Nadier with Food Chain: {${formatNumber(mana)}}`);
    const cost = NADIER_COST + 2 * (casts + cycle);
    mana -= cost;
    step(`Recast it for {${formatNumber(cost)}}: {${formatNumber(mana)}} left`);
    mana += elves;
    step(`Exile its ${plural(elves, 'Elf', 'Elves')}: {${formatNumber(mana)}}`);
    elves += NADIER_BASE_POWER;
  }
  return { dots, after: { x: dots.length, y: mana + FOOD_CHAIN_FOR_NADIER } };
}

export const nadier = defineWidget('nadier', {
  detect: (variant) => has(variant, 'Nadier, Agent of the Duskenel', 'Food Chain') && {},
  calculator: () => ({
    category: 'commander-tax',
    title: 'How much mana to start the Nadier loop?',
    summary: `Food Chain exiles Nadier for ${FOOD_CHAIN_FOR_NADIER} mana and Nadier leaves an Elf per point of power. Recasting it costs ${NADIER_COST} plus commander tax, and exiling the Elves afterwards makes 1 mana each and grows the new Nadier from ${NADIER_BASE_POWER} power. The tax grows by 2 a cycle and the Elves by 3, so after a few cycles the loop pays for itself.`,
    inputs: [CASTS, POWER],
    compute(values) {
      const { casts, power } = values.numbers;
      const mana = nadierMana(casts, power);
      return {
        headline: { label: 'Mana to start', value: `{${formatNumber(mana)}}`, mana: { generic: mana, pips: {} } },
        stats: [commanderTaxStat(casts)],
        charts: [
          {
            kind: 'dots',
            title: 'Mana to start',
            xLabel: CASTS.label,
            yLabel: 'Mana',
            selects: CASTS.key,
            ...sweptDots(CASTS, casts, (x) => ({
              y: nadierMana(x, power),
              label: `${formatNumber(x)}: {${formatNumber(nadierMana(x, power))}}`,
            })),
          },
          {
            kind: 'dots',
            title: 'Your mana, step by step',
            xLabel: 'Step',
            yLabel: 'Mana',
            ...cycleByCycle(casts, power),
          },
        ],
      };
    },
  }),
});
