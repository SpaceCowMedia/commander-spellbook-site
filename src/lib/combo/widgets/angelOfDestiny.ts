import type { NumberInput, Values } from './shared/calculator';
import { formatNumber } from './shared/format';
import { LIFE, STARTING_LIFE, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, says } from './parse/variant';

const ABOVE_STARTING_LIFE = 15;

/* Angel of Destiny wins at your end step with 15 more life than you started the game with; what
   differs is how much life the Angels gain on the way there. */
export function angelOfDestinyWidget<Id extends string>(
  id: Id,
  angels: { summary: string; input: NumberInput; gained(values: Values): number; myriad: boolean },
) {
  return defineWidget(id, {
    detect: (variant) =>
      has(variant, 'Angel of Destiny') &&
      says(variant, /starting life total|\d+ minus \d+ for each opponent/i) &&
      says(variant, /myriad/i) === angels.myriad &&
      {},
    calculator: () => ({
      category: 'lethal',
      title: 'Enough life for Angel of Destiny?',
      summary: `${angels.summary} At your end step you need 15 more life than you started the game with.`,
      inputs: [
        numberInput('start', 'Your starting life total', STARTING_LIFE, { min: 1 }),
        { ...LIFE, label: 'Your current life total' },
        angels.input,
      ],
      compute(values) {
        const gained = angels.gained(values);
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
}
