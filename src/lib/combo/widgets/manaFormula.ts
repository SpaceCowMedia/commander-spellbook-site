import { ManaCost, addMana, formatMana, manaValue, parseMana, scaleMana, subtractMana } from 'lib/symbols/mana';
import type { Category, NumberInput, Result } from './shared/calculator';
import { formatSwept, sweptDots } from './shared/charts';
import { numberInput } from './shared/inputs';
import { lowestPassing } from './shared/search';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

/* amount(q) = slope × q + offset, kept between 0 and `max`, times `per`, added (sign 1) or removed (sign -1) */
export interface ManaTerm {
  input: NumberInput;
  per: string;
  sign: 1 | -1;
  slope: number;
  offset: number;
  max?: number;
}

export function termAmount(term: Pick<ManaTerm, 'slope' | 'offset' | 'max'>, quantity: number): number {
  return Math.min(term.max ?? Infinity, Math.max(0, term.slope * quantity + term.offset));
}

/* The quantity from which a term stays put, at its max or at 0: Infinity when it grows forever */
export function termSteadyFrom(term: Pick<ManaTerm, 'slope' | 'offset' | 'max'>): number {
  if (term.slope === 0) {
    return -Infinity;
  }
  if (term.slope < 0) {
    return Math.ceil(term.offset / -term.slope);
  }
  return term.max === undefined ? Infinity : Math.ceil((term.max - term.offset) / term.slope);
}

interface ManaFormula {
  category: Category;
  base: string;
  terms: ManaTerm[];
  /* how the formula is worked out from the cards */
  summary: string;
}

const MONA_LISA_POWER = numberInput('power', "Mona Lisa's power", 1);
const ARTIFACTS = numberInput('artifacts', 'Artifacts you control', 10, {
  min: 7,
  hint: 'At least 7: the loop sacrifices six Treasures to Ruthless Technomancer.',
});

/* Costs worked out by hand from the cards, where several effects add up to more than the combo's
   text says. A formula the text spells out is left to the reader. Each needs all of its cards. */
const FORMULAS: { cards: string[]; formula: ManaFormula }[] = [
  {
    cards: ['Mona Lisa, Science Geek', 'Seedcradle Witch'],
    formula: {
      category: 'stats',
      base: '{G/W}',
      terms: [
        { input: MONA_LISA_POWER, per: '{1}', sign: 1, slope: -1, offset: 3, max: 2 },
        { input: MONA_LISA_POWER, per: '{G/W}', sign: 1, slope: -1, offset: 1 },
      ],
      summary:
        "Seedcradle Witch's {2}{G}{W} untaps Mona Lisa and gives it +3/+3, so every tap pays for the next. The first time, Mona Lisa's mana, all of one color, covers what it can of that cost.",
    },
  },
  {
    cards: ['Ruthless Technomancer', 'Perigee Beckoner', 'Nim Shambler'],
    formula: {
      category: 'board',
      base: '{1}{B}',
      terms: [
        { input: ARTIFACTS, per: '{2}', sign: 1, slope: -1, offset: 10, max: 2 },
        { input: ARTIFACTS, per: '{B}{B}', sign: 1, slope: -1, offset: 8, max: 1 },
      ],
      summary:
        "With ten artifacts, Nim Shambler's Treasures pay for both Ruthless Technomancer activations. Each artifact short of that costs {2} of your own, and with seven you also pay the {B}{B}.",
    },
  },
];

/* Each input once, in the order the formula mentions it. */
function inputsOf(inputs: NumberInput[]): NumberInput[] {
  return inputs.filter((input, i) => inputs.findIndex((other) => other.key === input.key) === i);
}

export const manaFormula = defineWidget('mana-formula', {
  detect(variant) {
    return FORMULAS.find(({ cards }) => has(variant, ...cards))?.formula;
  },
  calculator(spec) {
    const base = parseMana(spec.base)!;
    const terms = spec.terms.map((term) => ({ ...term, per: parseMana(term.per)! }));
    const inputs = inputsOf(terms.map((term) => term.input));
    const swept = inputs.at(0);
    const manaFor = (numbers: Record<string, number>): ManaCost =>
      terms.reduce((cost, term) => {
        const delta = scaleMana(term.per, termAmount(term, numbers[term.input.key]));
        return term.sign > 0 ? addMana(cost, delta) : subtractMana(cost, delta);
      }, base);
    const sweptTerms = terms.filter((term) => term.input.key === swept?.key);
    const oneWay =
      new Set(sweptTerms.filter((term) => term.slope !== 0).map((term) => term.sign * term.slope > 0)).size <= 1;
    /* The cost stays put once every term on the swept number does: at its max, at 0, or taking away
       more than the cost could ever hold. Below that, terms that all push the same way move it one
       way only, so where it settles is found by bisection; terms pushing both ways get no bar for
       "or more". */
    const steadyFrom = (numbers: Record<string, number>) => {
      if (!swept || !oneWay) {
        return undefined;
      }
      const largest = (term: (typeof terms)[number]) =>
        term.input.key !== swept.key
          ? termAmount(term, numbers[term.input.key])
          : term.slope > 0
            ? (term.max ?? Infinity)
            : termAmount(term, swept.min);
      const most = terms
        .filter((term) => term.sign > 0)
        .reduce((total, term) => total + manaValue(term.per) * largest(term), manaValue(base));
      const settled = Math.max(
        swept.min,
        ...sweptTerms.map((term) =>
          term.sign < 0 && term.slope > 0
            ? Math.min(termSteadyFrom(term), Math.ceil((most - term.offset) / term.slope))
            : termSteadyFrom(term),
        ),
      );
      if (!(settled <= swept.max)) {
        return undefined;
      }
      const costAt = (n: number) => formatMana(manaFor({ ...numbers, [swept.key]: n }));
      const settledCost = costAt(settled);
      return lowestPassing((n) => costAt(n) === settledCost, swept.min, settled);
    };
    return {
      category: spec.category,
      title: 'How much mana you need',
      summary: spec.summary,
      inputs,
      compute(values): Result {
        const cost = manaFor(values.numbers);
        const steady = steadyFrom(values.numbers);
        return {
          headline: { label: 'Mana needed', value: formatMana(cost), mana: cost },
          charts: swept && [
            {
              kind: 'dots',
              title: 'Mana needed',
              xLabel: swept.label,
              yLabel: 'Mana value',
              selects: swept.key,
              steadyFrom: steady,
              ...sweptDots(
                swept,
                values.numbers[swept.key],
                (n) => {
                  const mana = manaFor({ ...values.numbers, [swept.key]: n });
                  return { y: manaValue(mana), label: `${formatSwept(n, steady)}: ${formatMana(mana)}` };
                },
                steady,
              ),
            },
          ],
        };
      },
    };
  },
});
