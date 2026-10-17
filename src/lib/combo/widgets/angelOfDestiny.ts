import type { Result, Stat } from './shared/calculator';
import { formatNumber } from './shared/format';
import { LIFE, STARTING_LIFE, numberInput } from './shared/inputs';

/* Angel of Destiny wins at your end step with 15 more life than you started the game with. */
const ABOVE_STARTING_LIFE = 15;

export const START = numberInput('start', 'Your starting life total', STARTING_LIFE, { min: 1 });
export const CURRENT_LIFE = { ...LIFE, label: 'Your current life total' };

export const lifeGoal = (start: number) => start + ABOVE_STARTING_LIFE;

/* Every Angel of Destiny you control triggers on every hit, and double strike hits twice: a combat
   where `attackers` of them connect gains you 2 × angels × the damage they deal at once. One of the
   attackers may have `extraPower` on top of its 2. */
export function lifeGained(angels: number, attackers: number, extraPower = 0): number {
  return attackers > 0 ? 2 * angels * (2 * attackers + extraPower) : 0;
}

/* The life you end the turn at, against the life Angel of Destiny asks for. */
export function endStep(start: number, life: number, gained: number): Result & { stats: Stat[] } {
  const total = life + gained;
  const goal = lifeGoal(start);
  const missing = goal - total;
  return {
    headline: {
      label: 'Life at your end step',
      value: formatNumber(total),
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
    meter: { have: total, need: goal, unit: 'life' },
    stats: [{ label: 'Life you gain', value: formatNumber(gained) }],
  };
}
