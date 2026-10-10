import type { Dot, Point } from './shared/calculator';
import { formatNumber, plural } from './shared/format';
import { castsInput, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { creaturesSharing } from './parse/creatureTypes';
import { has, says, usesAny } from './parse/variant';

const CASTS = { ...castsInput('Krenko'), initial: 1 };
const LOOPS = 8;
/* cards that make Krenko cost {1} less: Goblin spells for one, red spells for the other */
const DISCOUNTS = ['Goblin Warchief', 'The Fire Crystal'];

/* Krenko doubles your Goblins, then the outlet sacrifices it with enough Goblins to recast it:
   {2}{R}{R} plus tax, less any discount, one Goblin per mana, and the recast Krenko is a Goblin
   again. Each of the two is a step, and a loop that is still going after the last one shown has the
   next tap to head for. */
export function stepByStep(
  goblins: number,
  casts: number,
  discount: number,
): { dots: Dot[]; after?: Point; failedAt?: number } {
  const dots: Dot[] = [{ x: 0, y: goblins, label: `To start: ${plural(goblins, 'Goblin')}` }];
  let count = goblins;
  let tax = 2 * casts;
  for (let loop = 1; loop <= LOOPS; loop++) {
    const doubled = 2 * count;
    const cost = 4 + tax - discount;
    const recast = `{${2 + tax - discount}}{R}{R}`;
    const tapped = `Krenko taps: ${plural(doubled, 'Goblin')}`;
    if (doubled < cost) {
      dots.push({ x: dots.length, y: doubled, label: `${tapped}, too few to recast it for ${recast}`, tone: 'bad' });
      return { dots, failedAt: loop };
    }
    count = doubled - cost + 1;
    dots.push({ x: dots.length, y: doubled, label: tapped });
    dots.push({
      x: dots.length,
      y: count,
      label: `Sacrifice ${formatNumber(cost)}, Krenko included, to recast it for ${recast}: ${plural(count, 'Goblin')}`,
    });
    tax += 2;
  }
  return { dots, after: { x: dots.length, y: 2 * count } };
}

export const krenko = defineWidget('krenko', {
  detect: (variant) =>
    has(variant, 'Krenko, Mob Boss') &&
    says(variant, /commander tax/i) && {
      comboGoblins: creaturesSharing(variant, ['Goblin']),
      cheaperWith: usesAny(variant, DISCOUNTS),
    },
  calculator({ comboGoblins, cheaperWith }) {
    const discount = cheaperWith ? 1 : 0;
    /* each loop adds {2} of tax: this many Goblins above it make two more a loop and keep up forever,
       any more pull ahead */
    const keepsUpFrom = 5 - discount;
    const needed = (casts: number) => keepsUpFrom + 2 * casts;
    return {
      category: 'commander-tax',
      title: 'Does the Krenko loop grow?',
      summary: `Krenko doubles your Goblins, then Skirk Prospector sacrifices Krenko and enough Goblins to recast it, tax included${cheaperWith ? `, for {1} less with ${cheaperWith}` : ''}. With Goblins minus tax at ${keepsUpFrom} the loop makes two more Goblins each time, as fast as the tax grows; above that it grows faster and faster, below it dies out.`,
      inputs: [
        numberInput('goblins', 'Goblins you control, Krenko included', Math.max(comboGoblins, needed(CASTS.initial)), {
          min: comboGoblins,
        }),
        CASTS,
      ],
      compute(values) {
        const { goblins, casts } = values.numbers;
        const tax = 2 * casts;
        const spare = goblins - needed(casts);
        const run = stepByStep(goblins, casts, discount);
        return {
          headline: {
            label: 'Goblins needed',
            value: formatNumber(needed(casts)),
            caption: `with {${tax}} commander tax`,
          },
          verdict:
            spare > 0
              ? {
                  tone: 'good',
                  title: 'The loop grows every time',
                  detail: 'Arbitrarily many Goblins and red mana, faster each loop.',
                }
              : spare === 0
                ? {
                    tone: 'good',
                    title: 'The loop grows every time',
                    detail: 'Arbitrarily many Goblins, two more each loop, as the tax grows by {2}.',
                  }
                : {
                    tone: 'bad',
                    title: run.failedAt ? `The loop stops in loop ${run.failedAt}` : 'The loop shrinks every time',
                  },
          meter: { have: goblins, need: needed(casts), unit: 'Goblins' },
          charts: [
            {
              kind: 'dots',
              title: 'Goblins, step by step',
              xLabel: 'Step',
              yLabel: 'Goblins',
              dots: run.dots,
              after: run.after,
            },
          ],
        };
      },
    };
  },
});
