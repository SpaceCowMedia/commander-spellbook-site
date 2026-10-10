import pluralize from 'pluralize';
import { sweptDots } from './shared/charts';
import { formatLog10, plural } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { NUMBER, findInSteps, toNumber } from './parse/variant';

const UPKEEPS = numberInput('upkeeps', 'Upkeeps', 3, { min: 1 });

export const tokenGrowth = defineWidget('token-growth', {
  detect(variant) {
    const growth = findInSteps(
      variant,
      new RegExp(`triggers, creating ${NUMBER} \\d+/\\d+ (\\w+) creature tokens for each \\2\\b`, 'i'),
    );
    return growth && { creature: growth[2], perToken: toNumber(growth[1]) };
  },
  calculator({ creature, perToken }) {
    const factor = 1 + perToken;
    const creatures = pluralize(creature);
    /* the count after some upkeeps, as a logarithm, since it outgrows any number a computer holds */
    const count = (start: number, upkeeps: number) => formatLog10(Math.log10(start) + upkeeps * Math.log10(factor));
    return {
      category: 'finite',
      title: `How many ${creatures} you'll have`,
      summary: `Every upkeep each ${creature} makes ${perToken} more, so their number grows ${factor} times each turn, as long as they survive.`,
      inputs: [numberInput('start', `${creatures} you control now`, 2, { min: 1 }), UPKEEPS],
      compute(values) {
        const { start, upkeeps } = values.numbers;
        const growth = sweptDots(UPKEEPS, upkeeps, (n) => ({
          y: start * factor ** n,
          label: `${plural(n, 'upkeep')}: ${count(start, n)} ${creatures}`,
        }));
        /* past what a number holds there is nothing left to draw */
        const drawable = [...growth.dots, growth.before, growth.after].every(
          (point) => !point || Number.isFinite(point.y),
        );
        return {
          headline: { label: creatures, value: count(start, upkeeps), caption: `after ${plural(upkeeps, 'upkeep')}` },
          charts: drawable
            ? [
                {
                  kind: 'dots',
                  title: `${creatures}, upkeep by upkeep`,
                  xLabel: UPKEEPS.label,
                  yLabel: creatures,
                  selects: UPKEEPS.key,
                  ...growth,
                },
              ]
            : undefined,
        };
      },
    };
  },
});
