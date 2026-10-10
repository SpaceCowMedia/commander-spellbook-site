import type { Variant } from '@space-cow-media/spellbook-client';
import { ManaCost, formatMana, manaValue, parseMana } from 'lib/symbols/mana';
import type { Calculator, NumberInput } from './shared/calculator';
import { formatSwept, sweptDots } from './shared/charts';
import { formatNumber } from './shared/format';
import { numberInput } from './shared/inputs';
import { MANA, findInSteps, has } from './parse/variant';

/* Every instant or sorcery you cast makes each Stormsplitter copy itself, so their number doubles. */

export const STORMSPLITTERS = numberInput('stormsplitters', 'Stormsplitters you control', 1, { min: 1 });

/* What the spell cast again and again with buyback costs, buyback included */
export function buybackCost(variant: Variant): string | undefined {
  const match = has(variant, 'Stormsplitter')
    ? findInSteps(variant, new RegExp(`^Cast .+? with buyback by paying ${MANA}`, 'i'))
    : undefined;
  return match && parseMana(match[1]) ? match[1] : undefined;
}

/* Paying a cost with `anyColor` sources that make any mana it needs and `genericOnly` ones that pay
   only generic mana, the pips first: how many of each it takes, and your own share of the rest */
export function payWith(cost: ManaCost, anyColor: number, genericOnly: number) {
  let left = anyColor;
  const own: ManaCost = { generic: 0, pips: {} };
  for (const [symbol, count] of Object.entries(cost.pips)) {
    const paid = Math.min(count, left);
    left -= paid;
    if (count > paid) {
      own.pips[symbol] = count - paid;
    }
  }
  const genericUsed = Math.min(cost.generic, genericOnly);
  const anyForGeneric = Math.min(cost.generic - genericUsed, left);
  own.generic = cost.generic - genericUsed - anyForGeneric;
  return { own, anyUsed: anyColor - left + anyForGeneric, genericUsed };
}

export interface Start {
  mana: ManaCost;
  /* casts you pay something for, before the copies pay for every cast */
  casts: number;
}

export function stormsplitterCalculator({
  title,
  summary,
  inputs,
  cost,
  start,
  steadyFrom,
}: {
  title: string;
  summary: string;
  inputs: NumberInput[];
  cost: string;
  start(numbers: Record<string, number>): Start;
  /* the fewest Stormsplitters from which the start no longer changes */
  steadyFrom(numbers: Record<string, number>): number;
}): Calculator {
  const each = parseMana(cost)!;
  return {
    category: 'board',
    title,
    summary,
    inputs,
    compute(values) {
      const { mana, casts } = start(values.numbers);
      const steady = steadyFrom(values.numbers);
      return {
        headline: { label: 'Mana to start', value: formatMana(mana), mana },
        stats: [
          { label: 'Each cast costs', value: formatMana(each), mana: each },
          { label: 'Casts you pay for', value: formatNumber(casts) },
        ],
        charts: [
          {
            kind: 'dots',
            title: 'Mana to start',
            xLabel: STORMSPLITTERS.label,
            yLabel: 'Mana value',
            selects: STORMSPLITTERS.key,
            steadyFrom: steady,
            ...sweptDots(
              STORMSPLITTERS,
              values.numbers.stormsplitters,
              (stormsplitters) => {
                const at = start({ ...values.numbers, stormsplitters }).mana;
                return { y: manaValue(at), label: `${formatSwept(stormsplitters, steady)}: ${formatMana(at)}` };
              },
              steady,
            ),
          },
        ],
      };
    },
  };
}

export const NO_MANA: ManaCost = { generic: 0, pips: {} };
