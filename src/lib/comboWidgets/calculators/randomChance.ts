import { RandomChanceSpec } from '../spec';
import { manaValue, parseMana } from '../mana';
import { BarChart, Calculator, Result, formatNumber, formatPercent, numberInput, plural } from '../calculator';

/* Resources past this never run out in practice, so they're counted as safe. */
const SAFE = 400;
const FOREVER = 200;

/* ---------- A die roll pays for the next iteration ---------- */

/* The chance of paying for at least k more iterations, for k = 0 … steps: each roll adds 1 to `die`
   resources, each iteration costs `cost`, and what's left carries over. */
function diceSurvival(die: number, cost: number, start: number, steps: number): number[] {
  let distribution = new Map<number, number>([[Math.min(start, SAFE), 1]]);
  const survival = [1];
  for (let step = 1; step <= steps; step++) {
    const next = new Map<number, number>();
    for (const [resources, probability] of distribution) {
      for (let roll = 1; roll <= die; roll++) {
        const after = resources + roll;
        if (after >= cost) {
          const kept = Math.min(after - cost, SAFE);
          next.set(kept, (next.get(kept) ?? 0) + probability / die);
        }
      }
    }
    distribution = next;
    survival.push([...next.values()].reduce((a, b) => a + b, 0));
  }
  return survival;
}

/* ---------- Free coin flips ---------- */

const logFactorials = [0];
function logFactorial(n: number): number {
  for (let i = logFactorials.length; i <= n; i++) {
    logFactorials.push(logFactorials[i - 1] + Math.log(i));
  }
  return logFactorials[n];
}

/* The chance of winning at least `wins` of `flips` fair coin flips. */
export function atLeastWins(flips: number, wins: number): number {
  if (wins <= 0) {
    return 1;
  }
  if (wins > flips) {
    return 0;
  }
  let total = 0;
  for (let i = wins; i <= flips; i++) {
    total += Math.exp(logFactorial(flips) - logFactorial(i) - logFactorial(flips - i) - flips * Math.LN2);
  }
  return Math.min(1, total);
}

function flipsFor(wins: number, chance: number): number {
  let flips = Math.max(wins, 1);
  while (atLeastWins(flips, wins) < chance) {
    flips++;
  }
  return flips;
}

/* ---------- Krark ---------- */

interface KrarkRun {
  /* chance of at least n casts, n = 0 … */
  casts: number[];
  averageCasts: number;
  averageCopies: number;
  averageMana: number;
}

/* Each cast pays `cost` and flips a coin per Krark. Every win copies the spell, every copy and a
   spell that resolves add `adds` mana. Any loss returns the spell to hand to be cast again; if every
   flip wins, the spell resolves and the loop is over. */
function krarkRun(krarks: number, cost: number, adds: number, start: number, steps: number): KrarkRun {
  const outcomes = Array.from({ length: krarks + 1 }, (_, wins) => ({
    wins,
    probability: Math.exp(logFactorial(krarks) - logFactorial(wins) - logFactorial(krarks - wins) - krarks * Math.LN2),
  }));
  let going = new Map<number, number>([[Math.min(start, SAFE), 1]]);
  const casts = [1];
  let averageCasts = 0;
  let averageCopies = 0;
  let averageMana = 0;
  for (let cast = 1; cast <= steps; cast++) {
    const next = new Map<number, number>();
    let castNow = 0;
    for (const [mana, probability] of going) {
      if (mana < cost) {
        averageMana += probability * mana;
        continue;
      }
      castNow += probability;
      for (const { wins, probability: chance } of outcomes) {
        const p = probability * chance;
        averageCopies += p * wins;
        const after = Math.min(mana - cost + wins * adds, SAFE);
        if (wins === krarks) {
          averageMana += p * Math.min(after + adds, SAFE);
        } else {
          next.set(after, (next.get(after) ?? 0) + p);
        }
      }
    }
    averageCasts += castNow;
    casts.push(castNow);
    going = next;
  }
  for (const [mana, probability] of going) {
    averageMana += probability * mana;
  }
  return { casts, averageCasts, averageCopies, averageMana };
}

function chanceBars(
  title: string,
  xLabel: string,
  chances: number[],
  from: number,
  to: number,
  selected: number,
  selects: string,
): BarChart {
  return {
    kind: 'bars',
    title,
    xLabel,
    yLabel: 'Chance',
    percent: true,
    selects,
    bars: Array.from({ length: to - from + 1 }, (_, i) => from + i).map((n) => ({
      x: String(n),
      y: chances[n] * 100,
      label: `${n}: ${formatPercent(chances[n])}`,
      tone: chances[n] >= 0.9 ? 'good' : chances[n] >= 0.5 ? 'warn' : 'bad',
      selected: n === selected,
    })),
  };
}

export function randomChanceCalculator(spec: RandomChanceSpec): Calculator {
  switch (spec.model) {
    case 'dice-resource': {
      const cost = manaValue(parseMana(spec.cost) ?? { generic: 5, symbols: [] });
      return {
        title: `Will the ${spec.resource}s keep ${spec.spender} going?`,
        summary: `Each iteration rolls a d${spec.die} for that many ${spec.resource}s, and ${spec.spender} costs ${spec.cost}. ${spec.resource}s you don't spend carry over, so one bad roll only ends the loop if the leftovers can't cover it.`,
        inputs: [
          numberInput('start', `${spec.resource}s or mana you have before the first roll`, 0, 99, 0),
          numberInput('target', 'Extra iterations you need', 1, 30, 5),
        ],
        compute(values): Result {
          const survival = diceSurvival(spec.die, cost, values.numbers.start, FOREVER);
          const target = values.numbers.target;
          return {
            headline: {
              label: `Chance of ${plural(target, 'extra iteration')}`,
              value: formatPercent(survival[target]),
            },
            stats: [
              { label: 'Chance it never stops', value: formatPercent(survival[FOREVER]) },
              { label: 'Each iteration', value: `${(spec.die + 1) / 2} on average`, caption: `against ${spec.cost}` },
            ],
            charts: [
              chanceBars(
                `Chance of at least this many extra iterations`,
                'Extra iterations',
                survival,
                1,
                15,
                target,
                'target',
              ),
            ],
          };
        },
      };
    }
    case 'coin-flips':
      return {
        title: 'How many flips to be safe?',
        summary: `${spec.source} flips as many coins as you activate it, for free. On each win, ${spec.onWin.charAt(0).toLowerCase()}${spec.onWin.slice(1)}.`,
        inputs: [numberInput('wins', 'Wins you need', 1, 500, 10), numberInput('flips', 'Activations', 1, 2000, 40)],
        compute(values): Result {
          const { wins, flips } = values.numbers;
          const chance = atLeastWins(flips, wins);
          const sure = flipsFor(wins, 0.99);
          const surer = flipsFor(wins, 0.999);
          const last = Math.max(flips, surer) + 10;
          const step = Math.max(1, Math.round(last / 60));
          const points = [];
          for (let n = 0; n <= last; n += step) {
            points.push({ x: n, y: atLeastWins(n, wins) * 100 });
          }
          return {
            headline: {
              label: `Chance of ${plural(wins, 'win')}`,
              value: formatPercent(chance),
              caption: `in ${plural(flips, 'flip')}`,
            },
            stats: [
              { label: 'Activations for 99%', value: formatNumber(sure) },
              { label: 'Activations for 99.9%', value: formatNumber(surer) },
            ],
            charts: [
              {
                kind: 'line',
                title: `Chance of at least ${plural(wins, 'win')}`,
                xLabel: 'Activations',
                yLabel: 'Chance (%)',
                points,
                marks: [{ y: 99, label: '99%', tone: 'good' }],
                summary: `The chance passes 99% at ${formatNumber(sure)} activations and 99.9% at ${formatNumber(surer)}.`,
              },
            ],
          };
        },
      };
    case 'krark':
      return {
        title: 'How long does the spell keep coming back?',
        summary:
          'Each instant or sorcery flips a coin per Krark. Any lost flip returns it to your hand to cast again, every won flip copies it, and if every flip is won the spell resolves and the loop ends.',
        inputs: [
          numberInput('krarks', 'Krarks (Sakashima copying Krark counts)', 1, 6, spec.krarks),
          numberInput('cost', "The spell's mana value", 0, 16, 1),
          numberInput('adds', 'Mana each copy or resolution adds', 0, 16, 2),
          numberInput('start', 'Mana you start with', 0, 99, 1),
          numberInput('target', 'Casts you need', 1, 40, 10),
        ],
        compute(values): Result {
          const { krarks, cost, adds, start, target } = values.numbers;
          const steps = Math.max(target, 40);
          const run = krarkRun(krarks, cost, adds, start, steps);
          return {
            headline: { label: `Chance of ${plural(target, 'cast')}`, value: formatPercent(run.casts[target] ?? 0) },
            stats: [
              { label: 'Comes back each cast', value: formatPercent(1 - 0.5 ** krarks) },
              { label: 'Average casts', value: run.averageCasts.toFixed(1) },
              { label: 'Average copies', value: run.averageCopies.toFixed(1) },
              { label: 'Average mana left', value: run.averageMana.toFixed(1) },
            ],
            charts: [
              chanceBars(
                'Chance of at least this many casts',
                'Casts',
                run.casts,
                1,
                Math.min(steps, 15),
                target,
                'target',
              ),
            ],
          };
        },
      };
  }
}
