import type { Stat } from './calculator';
import { formatNumber, plural } from './format';

/* Hits of `each` damage that go to any target: where they go is up to you, so the total is the answer. */
export function totalDamage(triggers: number, each: number): Stat {
  return {
    label: 'Total damage',
    value: formatNumber(triggers * each),
    caption: `${plural(triggers, 'trigger')} of ${formatNumber(each)}`,
  };
}
