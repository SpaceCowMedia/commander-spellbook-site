import { formatNumber } from './shared/format';
import { LIFE, OPPONENTS, STARTING_LIFE, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, says } from './parse/variant';

const ABOVE_STARTING_LIFE = 15;

/* Angel of Destiny wins at your end step with 15 more life than you started the game with. */
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
    inputs: [
      numberInput('start', 'Your starting life total', STARTING_LIFE, { min: 1 }),
      { ...LIFE, label: 'Your current life total' },
      OPPONENTS,
    ],
    compute(values) {
      const gained = 4 * values.numbers.opponents ** 2;
      const life = values.numbers.life + gained;
      const goal = values.numbers.start + ABOVE_STARTING_LIFE;
      const missing = goal - life;
      return {
        headline: {
          label: 'Life at your end step',
          value: formatNumber(life),
          caption: `${formatNumber(goal)} needed`,
        },
        verdict:
          missing > 0
            ? { tone: 'bad', title: 'No attacked opponent dies', detail: `${formatNumber(missing)} life short.` }
            : {
                tone: 'good',
                title: 'Each attacked opponent dies',
                detail: missing < 0 ? `${formatNumber(-missing)} life to spare.` : 'Exactly enough life.',
              },
        meter: { have: life, need: goal, unit: 'life' },
        stats: [{ label: 'Life you gain', value: formatNumber(gained) }],
      };
    },
  }),
});
