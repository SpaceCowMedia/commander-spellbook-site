import { OPPONENTS } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, says } from './parse/variant';
import { CURRENT_LIFE, START, endStep, lifeGained } from './angelOfDestiny';

export const angelOfDestinyMyriad = defineWidget('angel-of-destiny-myriad', {
  detect: (variant) =>
    has(variant, 'Angel of Destiny') &&
    says(variant, /starting life total|\d+ minus \d+ for each opponent/i) &&
    says(variant, /myriad/i) &&
    {},
  calculator: () => ({
    category: 'lethal',
    title: 'Enough life for Angel of Destiny?',
    summary:
      'Myriad gives one attacking Angel per opponent, and every Angel triggers on every hit: with N opponents you gain 4 × N² life. At your end step you need 15 more life than you started the game with.',
    inputs: [START, CURRENT_LIFE, OPPONENTS],
    compute(values) {
      const { start, life, opponents } = values.numbers;
      return endStep(start, life, lifeGained(opponents, opponents));
    },
  }),
});
