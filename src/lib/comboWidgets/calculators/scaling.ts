import { ManaFormulaSpec, Quantity, ScalingSpec, ThresholdSpec } from '../spec';
import { ManaCost, addMana, formatMana, manaValue, parseMana, scaleMana, subtractMana } from '../mana';
import {
  BarChart,
  Calculator,
  Input,
  LIFE_INPUT,
  OPPONENT_LIFE,
  Outcome,
  Result,
  STARTING_LIFE,
  Stat,
  formatNumber,
  lifeOutcome,
  numberInput,
  plural,
} from '../calculator';

const asInput = (quantity: Quantity): Input => ({ kind: 'number', ...quantity });

function uniqueQuantities(quantities: Quantity[]): Quantity[] {
  return quantities.filter((quantity, i) => quantities.findIndex((other) => other.key === quantity.key) === i);
}

/* The quantity worth sweeping in a chart: command zone casts if any, the first one otherwise. */
function sweepQuantity(quantities: Quantity[]): Quantity | undefined {
  return quantities.find((quantity) => quantity.key === 'casts') ?? quantities[0];
}

function sweep(quantity: Quantity, current: number): number[] {
  const span = 9;
  const start = Math.max(quantity.min, Math.min(current - 4, quantity.max - span + 1));
  return Array.from({ length: Math.min(span, quantity.max - start + 1) }, (_, i) => start + i);
}

function taxStat(values: Record<string, number>, quantities: Quantity[]): Stat[] {
  return quantities.some((quantity) => quantity.key === 'casts')
    ? [{ label: 'Commander tax', value: `{${2 * values.casts}}`, mana: true }]
    : [];
}

/* ---------- Mana formulas ---------- */

function manaFor(spec: ManaFormulaSpec, values: Record<string, number>): ManaCost {
  return spec.terms.reduce((cost, term) => {
    const amount = Math.max(0, term.slope * values[term.quantity.key] + term.offset);
    const delta = scaleMana(parseMana(term.per)!, amount);
    return term.sign > 0 ? addMana(cost, delta) : subtractMana(cost, delta);
  }, parseMana(spec.base)!);
}

function manaFormulaCalculator(spec: ManaFormulaSpec): Calculator {
  const quantities = uniqueQuantities(spec.terms.map((term) => term.quantity));
  const swept = sweepQuantity(quantities);
  return {
    title: 'How much mana you need',
    summary: spec.source
      ? `From the combo's own formula: “${spec.source.replace(/\.$/, '')}”.`
      : `Starts from ${spec.base}.`,
    inputs: quantities.map(asInput),
    compute(values): Result {
      const cost = manaFor(spec, values.numbers);
      const result: Result = {
        headline: { label: 'Mana needed', value: formatMana(cost), mana: true, caption: spec.suffix },
        stats: taxStat(values.numbers, quantities),
      };
      if (swept) {
        result.charts = [
          {
            kind: 'bars',
            title: 'Mana needed',
            xLabel: swept.label,
            yLabel: 'Mana value',
            selects: swept.key,
            bars: sweep(swept, values.numbers[swept.key]).map((n) => {
              const mana = formatMana(manaFor(spec, { ...values.numbers, [swept.key]: n }));
              return {
                x: String(n),
                y: manaValue(parseMana(mana)!),
                label: `${n}: ${mana}`,
                selected: n === values.numbers[swept.key],
              };
            }),
          },
        ];
      }
      return result;
    },
  };
}

/* ---------- Thresholds ---------- */

function need(spec: ThresholdSpec, values: Record<string, number>): number {
  return spec.terms.reduce((total, term) => total + term.coefficient * values[term.quantity.key], spec.base);
}

/* What you need as one number: "more than 7" becomes 8 or more. */
function bound(spec: ThresholdSpec, values: Record<string, number>): number {
  const value = need(spec, values);
  return spec.compare === '>' ? value + 1 : value;
}

export function thresholdCalculator(spec: ThresholdSpec): Calculator {
  const termQuantities = uniqueQuantities(spec.terms.map((term) => term.quantity)).filter(
    (quantity) => quantity.key !== spec.have.key,
  );
  const swept = sweepQuantity(termQuantities);
  const atMost = spec.compare === '<=';
  return {
    title: 'Do you have enough?',
    summary: spec.source
      ? `From the combo's own requirement: “${spec.source.replace(/\.$/, '')}”.`
      : `${spec.have.label} against a requirement that moves with the numbers below.`,
    inputs: [asInput(spec.have), ...termQuantities.map(asInput)],
    compute(values): Result {
      const target = Math.max(0, bound(spec, values.numbers));
      const have = values.numbers[spec.have.key];
      const gap = atMost ? have - target : target - have;
      const result: Result = {
        headline: {
          label: `${spec.have.label} needed`,
          value: formatNumber(target),
          caption: atMost ? 'or fewer' : target > 0 ? 'or more' : undefined,
        },
        verdict:
          gap <= 0
            ? {
                tone: 'good',
                title: 'You have enough',
                detail: gap < 0 ? `${formatNumber(-gap)} to spare.` : 'Exactly enough.',
              }
            : { tone: 'bad', title: atMost ? `${formatNumber(gap)} too many` : `${formatNumber(gap)} short` },
        stats: taxStat(values.numbers, termQuantities),
      };
      if (swept) {
        const chart: BarChart = {
          kind: 'bars',
          title: `${spec.have.label} needed`,
          xLabel: swept.label,
          yLabel: spec.have.label,
          selects: swept.key,
          bars: sweep(swept, values.numbers[swept.key]).map((n) => {
            const required = Math.max(0, bound(spec, { ...values.numbers, [swept.key]: n }));
            const ok = atMost ? have <= required : have >= required;
            return {
              x: String(n),
              y: required,
              label: `${n}: ${formatNumber(required)}`,
              tone: ok ? 'good' : 'bad',
              selected: n === values.numbers[swept.key],
            };
          }),
        };
        result.charts = [chart];
      }
      return result;
    },
  };
}

/* ---------- Named mechanisms ---------- */

function krenkoLoops(goblins: number, casts: number) {
  const rows: string[][] = [];
  let count = goblins;
  let tax = 2 * casts;
  for (let loop = 1; loop <= 8; loop++) {
    const doubled = 2 * count;
    const cost = 4 + tax;
    if (doubled < cost) {
      return { rows, failedAt: loop };
    }
    const after = doubled - cost + 1;
    rows.push([String(loop), formatNumber(doubled), `{${2 + tax}}{R}{R}`, formatNumber(after)]);
    count = after;
    tax += 2;
  }
  return { rows, failedAt: undefined };
}

export function scalingCalculator(spec: ScalingSpec): Calculator {
  switch (spec.model) {
    case 'mana-formula':
      return manaFormulaCalculator(spec);
    case 'threshold':
      return thresholdCalculator(spec);
    case 'greven':
      return {
        title: 'How much life Greven needs',
        summary: `Greven gets +1/+0 for each life you lose this turn, and ${spec.outlet} pays ${plural(spec.lifePerActivation, 'life', 'life')} at a time. Commander damage needs 21 power, less if Greven already hit that opponent, and you have to stay at 1 life.`,
        inputs: [
          numberInput('power', "Greven's power right now", 0, 99, 5),
          LIFE_INPUT,
          numberInput('dealt', 'Commander damage Greven already dealt that opponent', 0, 20, 0),
          numberInput('target', "That opponent's life total", 1, 999, STARTING_LIFE),
        ],
        compute(values): Result {
          const { power, life, dealt, target } = values.numbers;
          const goal = Math.min(21 - dealt, target);
          const missing = Math.max(0, goal - power);
          const activations = Math.ceil(missing / spec.lifePerActivation);
          const paid = activations * spec.lifePerActivation;
          return {
            headline: {
              label: 'Life needed',
              value: formatNumber(paid + 1),
              caption: `to reach ${formatNumber(goal)} power`,
            },
            verdict:
              life > paid
                ? { tone: 'good', title: 'Greven is lethal', detail: `You end at ${formatNumber(life - paid)} life.` }
                : { tone: 'bad', title: `You need ${formatNumber(paid + 1 - life)} more life` },
            stats: [
              { label: `${spec.outlet} activations`, value: formatNumber(activations) },
              { label: "Greven's power after", value: formatNumber(power + paid) },
            ],
          };
        },
      };
    case 'power-doubling':
      return {
        title: `How much mana ${spec.creature} needs`,
        summary: `Each activation of ${spec.creature} doubles its power. Mayael's Aria puts a +1/+1 counter on it first, so ${spec.target} power is enough.`,
        inputs: [numberInput('power', `${spec.creature}'s power`, 1, 99, 4)],
        compute(values): Result {
          const activationsFor = (power: number) => {
            let n = 0;
            for (let p = power; p < spec.target; p *= 2) {
              n++;
            }
            return n;
          };
          const n = activationsFor(values.numbers.power);
          const cost = parseMana(spec.activation)!;
          return {
            headline: { label: 'Mana needed', value: formatMana(scaleMana(cost, n)), mana: true },
            stats: [
              { label: 'Activations', value: formatNumber(n) },
              { label: 'Power reached', value: formatNumber(values.numbers.power * 2 ** n) },
            ],
            charts: [
              {
                kind: 'bars',
                title: 'Activations by starting power',
                xLabel: 'Starting power',
                yLabel: 'Activations',
                selects: 'power',
                bars: [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, spec.target].map((power) => ({
                  x: String(power),
                  y: activationsFor(power),
                  label: `Power ${power}: ${formatMana(scaleMana(cost, activationsFor(power)))}`,
                  selected: power === values.numbers.power,
                })),
              },
            ],
          };
        },
      };
    case 'krenko':
      return {
        title: 'Does the Krenko loop grow?',
        summary:
          'Krenko doubles your Goblins, then Skirk Prospector sacrifices Krenko and enough Goblins to recast it, tax included. With Goblins minus tax at 6 or more the loop grows every time, at 5 it stays even, below that it dies out.',
        inputs: [
          numberInput('goblins', 'Goblins you control, Krenko included', 1, 200, 8),
          numberInput('casts', 'Times Krenko was cast from the command zone', 0, 20, 1),
        ],
        compute(values): Result {
          const { goblins, casts } = values.numbers;
          const tax = 2 * casts;
          const margin = goblins - tax;
          const run = krenkoLoops(goblins, casts);
          return {
            headline: { label: 'Goblins needed', value: formatNumber(6 + tax), caption: `with {${tax}} commander tax` },
            verdict:
              margin >= 6
                ? { tone: 'good', title: 'The loop grows every time', detail: 'Arbitrarily many Goblins and red mana.' }
                : margin === 5
                  ? { tone: 'warn', title: 'The loop holds steady', detail: 'It repeats forever but never grows.' }
                  : {
                      tone: 'bad',
                      title: run.failedAt ? `The loop stops in loop ${run.failedAt}` : 'The loop shrinks every time',
                    },
            table: {
              caption: 'Loop by loop',
              columns: ['Loop', 'Goblins after Krenko', 'Krenko costs', 'Goblins after recasting'],
              rows: run.rows,
            },
          };
        },
      };
    case 'mill-each':
      return {
        title: 'How much mana for the whole table?',
        summary: `${spec.base} once, plus ${spec.perOpponent} for each opponent. An opponent dies only if their library holds at least as many cards as their life.`,
        inputs: [],
        opponents: {
          fields: [OPPONENT_LIFE, { key: 'library', label: 'Cards in library', min: 0, max: 200, initial: 60 }],
        },
        compute(values): Result {
          const n = values.opponents.length;
          const cost = addMana(parseMana(spec.base)!, scaleMana(parseMana(spec.perOpponent)!, n));
          const outcomes: Outcome[] = values.opponents.map(({ life, library }) =>
            library >= life ? { tone: 'good', text: 'Dies' } : lifeOutcome(life - library),
          );
          const dead = outcomes.filter((outcome) => outcome.tone === 'good').length;
          return {
            headline: {
              label: 'Mana needed',
              value: formatMana(cost),
              mana: true,
              caption: `for ${plural(n, 'opponent')}`,
            },
            verdict:
              dead === n
                ? { tone: 'good', title: 'Every opponent dies' }
                : {
                    tone: dead ? 'warn' : 'bad',
                    title: `${dead} of ${plural(n, 'opponent')} ${dead === 1 ? 'dies' : 'die'}`,
                  },
            outcomes,
          };
        },
      };
    case 'time-sieve':
      return {
        title: 'Enough attackers for an extra turn?',
        summary:
          'Each attacking artifact creature makes a copy for each other opponent, and Time Sieve needs five artifacts to sacrifice: ⌈5 ÷ (opponents − 1)⌉ attackers.',
        inputs: [
          numberInput('opponents', 'Opponents', 1, 7, 3),
          numberInput('attackers', 'Artifact creatures that can attack', 0, 30, 3),
        ],
        compute(values): Result {
          const { opponents, attackers } = values.numbers;
          if (opponents < 2) {
            return {
              headline: { label: 'Attackers needed', value: '—' },
              verdict: { tone: 'bad', title: 'This needs at least two opponents' },
            };
          }
          const needed = Math.ceil(5 / (opponents - 1));
          return {
            headline: { label: 'Attackers needed', value: formatNumber(needed) },
            verdict:
              attackers >= needed
                ? { tone: 'good', title: 'Enough for an extra turn every turn' }
                : { tone: 'bad', title: `${plural(needed - attackers, 'attacker')} short` },
          };
        },
      };
    case 'devotion-times-opponents':
      return {
        title: 'Does each drain pay for the next turn?',
        summary: `Gray Merchant drains your devotion to black from each opponent, and the loop needs ${spec.target} life from it each time.`,
        inputs: [
          numberInput('devotion', 'Your devotion to black', 0, 60, 7),
          numberInput('opponents', 'Opponents', 1, 7, 3),
        ],
        compute(values): Result {
          const drained = values.numbers.devotion * values.numbers.opponents;
          return {
            headline: {
              label: 'Life drained per loop',
              value: formatNumber(drained),
              caption: `${spec.target} needed`,
            },
            verdict:
              drained >= spec.target
                ? {
                    tone: 'good',
                    title: 'The loop pays for itself',
                    detail:
                      drained > spec.target
                        ? `${formatNumber(drained - spec.target)} life to spare each time.`
                        : undefined,
                  }
                : { tone: 'bad', title: `${formatNumber(spec.target - drained)} life short each time` },
          };
        },
      };
  }
}
