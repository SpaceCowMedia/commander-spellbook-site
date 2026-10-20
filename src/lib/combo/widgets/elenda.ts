import type { Dot } from './shared/calculator';
import { stepDots, stepPage } from './shared/charts';
import { formatNumber, plural } from './shared/format';
import { castsInput, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, says } from './parse/variant';

const CASTS = { ...castsInput('Elenda'), initial: 1 };
/* Elenda costs {2}{W}{B}, and Phyrexian Altar turns Elenda itself into the {W} */
const COST = 4;
const FROM_ELENDA = 1;
/* Ojer Taq triples the Vampires */
const TRIPLED = 3;
/* steps on a page of the chart: three for each loop */
const PAGE = 12;

/* Each loop takes Elenda's power p to 3p − 2 − 2 × casts, which triples its gap to casts + 1.5: from
   casts + 2 on the loop grows forever, below it dies out. */
export const powerNeeded = (casts: number) => casts + 2;

/* The Vampires one loop makes, those it sacrifices to recast Elenda, and Elenda's power after it */
function loop(power: number, casts: number) {
  const vampires = TRIPLED * power;
  const recast = COST + 2 * casts - FROM_ELENDA;
  return { vampires, recast, power: 1 + vampires - recast };
}

/* The loop whose Vampires can't pay for Elenda, or undefined when they always can. Below the power
   needed the gap triples the other way, so it comes within a few loops. */
export function stopsIn(power: number, casts: number): number | undefined {
  if (power >= powerNeeded(casts)) {
    return undefined;
  }
  let p = power;
  for (let n = 1; ; n++) {
    const next = loop(p, casts + n - 1);
    if (next.vampires < next.recast) {
      return n;
    }
    p = next.power;
  }
}

/* The Vampires for the first `steps` steps: up as Elenda dies, down to recast it, and down to none as
   the rest die one at a time and grow the new Elenda, to the loop that can't recast it. */
export function stepByStep(power: number, casts: number, steps = 1 + PAGE): Dot[] {
  const { dots, add } = stepDots();
  let p = power;
  add(0, `To start: Elenda has ${formatNumber(p)} power`);
  for (let n = 0; dots.length < steps; n++) {
    const next = loop(p, casts + n);
    if (next.vampires < next.recast) {
      add(next.vampires, `Sacrifice Elenda: ${plural(next.vampires, 'Vampire')}, too few to recast it`, 'bad');
      return dots;
    }
    add(next.vampires, `Sacrifice Elenda: ${plural(next.vampires, 'Vampire')}`);
    add(
      next.vampires - next.recast,
      `Sacrifice ${formatNumber(next.recast)} to recast Elenda for {${formatNumber(2 + 2 * (casts + n))}}{W}{B}: ${plural(next.vampires - next.recast, 'Vampire')}`,
    );
    add(0, `Sacrifice the rest, Elenda grows to ${formatNumber(next.power)} power`);
    p = next.power;
  }
  return dots.slice(0, steps);
}

export const elenda = defineWidget('elenda', {
  detect: (variant) =>
    has(
      variant,
      'Elenda, the Dusk Rose',
      'Ojer Taq, Deepest Foundation // Temple of Civilization',
      'Phyrexian Altar',
    ) &&
    says(variant, /commander tax/i) &&
    {},
  calculator: () => ({
    category: 'commander-tax',
    title: 'Does the Elenda loop grow?',
    summary: `Elenda dies into a Vampire for each point of power, three times as many with Ojer Taq. Phyrexian Altar turns Elenda and the Vampires into the {2}{W}{B} plus tax to recast it, and every Vampire sacrificed after that puts a +1/+1 counter on the new Elenda. From ${powerNeeded(0)} power plus one for each earlier cast, Elenda's power nearly triples every loop.`,
    inputs: [numberInput('power', "Elenda's power", powerNeeded(CASTS.initial), { min: 1 }), CASTS],
    compute(values) {
      const { power, casts } = values.numbers;
      const needed = powerNeeded(casts);
      const stops = stopsIn(power, casts);
      return {
        headline: {
          label: 'Power needed',
          value: formatNumber(needed),
          caption: `with {${formatNumber(2 * casts)}} commander tax`,
        },
        verdict:
          stops === undefined
            ? { tone: 'good', title: 'The loop grows every time', detail: "Elenda's power nearly triples each loop." }
            : { tone: 'bad', title: `The loop stops in loop ${formatNumber(stops)}` },
        meter: { have: power, need: needed, unit: 'power' },
        charts: [
          {
            title: 'Vampires, step by step',
            xLabel: 'Step',
            ...stepPage((steps) => stepByStep(power, casts, steps), values.page ?? 0, PAGE),
          },
        ],
      };
    },
  }),
});
