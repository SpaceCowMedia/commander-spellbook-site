import { formatNumber } from './shared/format';
import { OPPONENTS, numberInput } from './shared/inputs';
import { compare } from './shared/outcomes';
import { defineWidget } from './shared/widget';
import { NUMBER, allText, toNumber } from './parse/variant';

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
    inputs: [numberInput('devotion', 'Your devotion to black', 7), OPPONENTS],
    compute(values) {
      const drained = values.numbers.devotion * values.numbers.opponents;
      return {
        headline: { label: 'Life drained per loop', value: formatNumber(drained), caption: `${target} needed` },
        ...compare(drained, target, {
          unit: 'life',
          enough: 'The loop pays for itself',
          short: (missing) => `${formatNumber(missing)} life short each time`,
        }),
      };
    },
  }),
});
