import { formatNumber } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, says } from './parse/variant';
import { CURRENT_LIFE, START, endStep, lifeGained, lifeGoal } from './angelOfDestiny';

const ANGELS = numberInput('angels', 'Angels of Destiny you control', 4, {
  min: 1,
  hint: 'The original and every copy of it.',
});
const IDLE = numberInput('idle', "Angels that are blocked or can't attack", 0, {
  hint: 'They still trigger for the ones that connect.',
});

/* The fewest Angels that gain at least `life` when they all connect: n at the positive root of
   2n × (2n + extraPower) = life, rounded up. */
export function angelsNeeded(life: number, extraPower = 0): number {
  return Math.max(1, Math.ceil((Math.sqrt(extraPower ** 2 + 4 * Math.max(0, life)) - extraPower) / 4));
}

/* Sakashima's Will, Mirrorweave and the like turn every creature you control into Angel of Destiny. */
export const angelOfDestinyCopies = defineWidget('angel-of-destiny-copies', {
  detect: (variant) =>
    has(variant, 'Angel of Destiny') &&
    says(variant, /each Angel of Destiny you control triggers/i) && {
      /* +1/+1 counters put on the Angel being copied, which its copies don't get */
      counters: says(variant, /\ba \+1\/\+1 counter on the targeted creature/i) ? 1 : 0,
    },
  calculator: ({ counters }) => ({
    category: 'lethal',
    title: 'Enough life for Angel of Destiny?',
    summary: `Every creature turned into a copy is one more Angel of Destiny, and every Angel triggers on every hit. With double strike you gain 4 life for each Angel you control, times the Angels that connect.${counters ? ' Each +1/+1 counter on the original adds 2 more for each Angel you control.' : ''} At your end step you need 15 more life than you started the game with.`,
    inputs: [START, CURRENT_LIFE, ANGELS, IDLE],
    compute(values) {
      const { start, life, angels, idle } = values.numbers;
      const result = endStep(start, life, lifeGained(angels, angels - idle, counters));
      return {
        ...result,
        stats: [
          ...result.stats,
          {
            label: 'Angels needed',
            value: formatNumber(angelsNeeded(lifeGoal(start) - life, counters)),
            caption: 'at your life total, if they all connect',
          },
        ],
      };
    },
  }),
});
