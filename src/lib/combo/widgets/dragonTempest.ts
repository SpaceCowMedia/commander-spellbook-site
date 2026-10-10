import { formatNumber } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const ROLLS = Array.from({ length: 20 }, (_, i) => i + 1);

export const dragonTempest = defineWidget('dragon-tempest', {
  detect: (variant) => has(variant, 'Dragon Tempest', 'Ancient Gold Dragon') && {},
  calculator: () => ({
    category: 'finite',
    title: 'How much damage Dragon Tempest deals',
    summary:
      'Ancient Gold Dragon rolls a d20 and makes that many Faerie Dragons at once. Each one triggers Dragon Tempest for damage equal to the Dragons you control, aimed where you like.',
    inputs: [numberInput('dragons', 'Dragons you control, Ancient Gold Dragon included', 1, { min: 1 })],
    compute(values) {
      const dragons = values.numbers.dragons;
      const damage = (roll: number) => roll * (dragons + roll);
      const lowest = ROLLS[0];
      const highest = ROLLS[ROLLS.length - 1];
      return {
        headline: {
          label: 'Average damage',
          value: formatNumber(ROLLS.reduce((sum, roll) => sum + damage(roll), 0) / ROLLS.length),
          caption: `from ${formatNumber(damage(lowest))} on a ${lowest} to ${formatNumber(damage(highest))} on a ${highest}`,
        },
        charts: [
          {
            kind: 'dots',
            title: 'Damage by d20 roll',
            xLabel: 'Roll',
            yLabel: 'Damage',
            dots: ROLLS.map((roll) => ({
              x: roll,
              y: damage(roll),
              label: `Roll ${roll}: ${formatNumber(damage(roll))} damage`,
            })),
          },
        ],
      };
    },
  }),
});
