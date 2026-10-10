import { addMana, formatMana, manaValue, parseMana } from 'lib/symbols/mana';
import { formatSwept, sweptDots } from './shared/charts';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { NUMBER, has, statedNumber } from './parse/variant';

interface Line {
  /* the cards besides Animar */
  cards: string[];
  /* what Animar never reduces: colored pips and noncreature spells */
  fixed: string;
  /* the generic part of each creature spell in the order you cast them, the last one again and again */
  casts: number[];
}

/* Airbent creatures come back for {2} */
const AIRBENT = 2;

/* A Lesson airbends a creature with flash that copies the Lesson as it enters, again and again */
const LESSONS = [
  { lesson: 'Airbending Lesson', cost: '{2}{W}' },
  { lesson: 'Whirlwind Technique', cost: '{4}{U}{U}' },
  { lesson: "Airbender's Reversal", cost: '{1}{W}' },
];
const COPIERS = [
  { copier: 'Naru Meha, Master Wizard', pips: '{U}{U}', generic: 2 },
  { copier: 'Lutri, the Spellchaser', pips: '{U/R}{U/R}', generic: 1 },
  { copier: 'Dualcaster Mage', pips: '{R}{R}', generic: 1 },
];

/* Spider-Man India puts a counter on Crystalline Crawler for every creature cast, which pays the {W}
   of the creature that returns itself to your hand */
const RETURNERS = [
  { returner: 'Stonecloaker', generic: 2 },
  { returner: 'Kor Skyfisher', generic: 1 },
  { returner: 'Whitemane Lion', generic: 1 },
];

/* Cards with their own line come first: Martyrdom is one more way to target with Monk Gyatso. */
const LINES: Line[] = [
  { cards: ['Ancestral Statue'], fixed: '{0}', casts: [4] },
  { cards: ['Acererak the Archlich', 'Relic of Legends'], fixed: '{B}', casts: [2] },
  { cards: ['Ebondeath, Dracolich', 'Geralf, the Fleshwright'], fixed: '{B}{B}', casts: [2] },
  { cards: ['Appa, Steadfast Guardian'], fixed: '{W}{W}', casts: [2, AIRBENT] },
  { cards: ['Aang, Airbending Master', 'Aang, the Last Airbender'], fixed: '{W}', casts: [4, AIRBENT] },
  ...RETURNERS.map(({ returner, generic }) => ({
    cards: [returner, 'Spider-Man India', 'Crystalline Crawler'],
    fixed: '{W}',
    casts: [generic],
  })),
  { cards: ['Monk Gyatso', 'Martyrdom'], fixed: '{1}{W}{W}', casts: [AIRBENT] },
  { cards: ['Monk Gyatso'], fixed: '{0}', casts: [AIRBENT] },
  ...LESSONS.flatMap(({ lesson, cost }) =>
    COPIERS.map(({ copier, pips, generic }) => ({
      cards: [lesson, copier],
      fixed: `${cost}${pips}`,
      casts: [generic, AIRBENT],
    })),
  ),
  { cards: ['Astral Dragon', 'Airbender Ascension'], fixed: '{U}{U}', casts: [6, AIRBENT] },
];

/* Each creature spell costs {1} less per counter and adds one, so the generic mana you pay is
   Σ max(0, cost − counters): the casts listed, then a triangle for the one that repeats. */
export function genericToPay(casts: number[], counters: number): number {
  const last = casts.length - 1;
  const listed = casts.slice(0, last).reduce((total, cost, i) => total + Math.max(0, cost - counters - i), 0);
  const repeat = casts[last] - counters - last;
  return listed + (repeat > 0 ? (repeat * (repeat + 1)) / 2 : 0);
}

/* The cast in position i is free from cost − i counters on */
export function freeFrom(casts: number[]): number {
  return Math.max(0, ...casts.map((cost, i) => cost - i));
}

const STATED_COUNTERS = new RegExp(`^Animar has at least ${NUMBER} \\+1/\\+1 counters? on it$`, 'i');

export const animar = defineWidget('animar', {
  detect(variant) {
    const line = LINES.find(({ cards }) => has(variant, 'Animar, Soul of Elements', ...cards));
    return line && { fixed: line.fixed, casts: line.casts, counters: statedNumber(variant, STATED_COUNTERS) ?? 0 };
  },
  calculator(spec) {
    const fixed = parseMana(spec.fixed)!;
    const counters = numberInput('counters', '+1/+1 counters on Animar', spec.counters);
    const manaFor = (count: number) => addMana(fixed, { generic: genericToPay(spec.casts, count), pips: {} });
    const steadyFrom = freeFrom(spec.casts);
    return {
      category: 'stats',
      title: 'How much mana with Animar?',
      summary:
        'Each creature spell costs {1} less for every +1/+1 counter on Animar, and casting it adds one more, so the loop soon casts its creatures for free.',
      inputs: [counters],
      compute(values) {
        const mana = manaFor(values.numbers.counters);
        return {
          headline: { label: 'Mana to start', value: formatMana(mana), mana },
          charts: [
            {
              kind: 'dots',
              title: 'Mana to start',
              xLabel: counters.label,
              yLabel: 'Mana value',
              selects: counters.key,
              steadyFrom,
              ...sweptDots(
                counters,
                values.numbers.counters,
                (count) => ({
                  y: manaValue(manaFor(count)),
                  label: `${formatSwept(count, steadyFrom)}: ${formatMana(manaFor(count))}`,
                }),
                steadyFrom,
              ),
            },
          ],
        };
      },
    };
  },
});
