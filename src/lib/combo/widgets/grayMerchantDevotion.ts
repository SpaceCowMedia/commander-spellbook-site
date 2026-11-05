import type { Dot } from './shared/calculator';
import { stepDots, stepPage } from './shared/charts';
import { formatNumber } from './shared/format';
import { LIFE, OPPONENTS, numberInput } from './shared/inputs';
import { compare } from './shared/outcomes';
import { defineWidget } from './shared/widget';
import { NUMBER, allText, toNumber } from './parse/variant';

/* steps on a page of the chart: a drain and a payment for each turn */
const PAGE = 24;

/* Your life after each drain and each payment for the first `steps` steps, for as long as you can pay */
export function lifeByStep(life: number, drained: number, paid: number, steps = 1 + PAGE): Dot[] {
  const { dots, add } = stepDots();
  let now = life;
  add(now, `To start: ${formatNumber(now)} life`);
  for (let turn = 1; dots.length < steps && now + drained - paid >= 1; turn++) {
    now += drained;
    add(now, `Turn ${formatNumber(turn)}, Gray Merchant drains ${formatNumber(drained)}: ${formatNumber(now)} life`);
    now -= paid;
    add(now, `Turn ${formatNumber(turn)}, pay ${formatNumber(paid)} life: ${formatNumber(now)} life`);
  }
  return dots.slice(0, steps);
}

export const grayMerchantDevotion = defineWidget('gray-merchant-devotion', {
  detect(variant) {
    const target = allText(variant).match(
      new RegExp(`devotion to black times the number of opponents you have is greater than or equal to ${NUMBER}`, 'i'),
    );
    return target && { target: toNumber(target[1]) };
  },
  calculator: ({ target }) => ({
    category: 'table',
    title: 'Does each drain pay for the next turn?',
    summary: `Gray Merchant drains your devotion to black from each opponent, and the loop needs ${target} life from it each time.`,
    inputs: [numberInput('devotion', 'Your devotion to black', 7), OPPONENTS, LIFE],
    compute(values) {
      const drained = values.numbers.devotion * values.numbers.opponents;
      const life = values.numbers.life;
      const steps = stepPage((count) => lifeByStep(life, drained, target, count), values.page ?? 0, PAGE);
      return {
        headline: { label: 'Life drained per loop', value: formatNumber(drained), caption: `${target} needed` },
        ...compare(drained, target, {
          unit: 'life',
          enough: 'The loop pays for itself',
          short: (missing) => `${formatNumber(missing)} life short each time`,
        }),
        charts:
          steps.dots.length > 1
            ? [
                {
                  title: `Your life, starting from ${formatNumber(life)}`,
                  xLabel: 'Step',
                  marks: [{ y: 1, label: 'Lowest you can go', tone: 'bad' }],
                  ...steps,
                },
              ]
            : undefined,
      };
    },
  }),
});
