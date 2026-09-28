import pluralize from 'pluralize';
import { useSyncExternalStore } from 'react';

const BONUS_RESULTS = [
  'Infinite table salt',
  '−1 friend',
  'Opponents check their phones',
  'Everyone suddenly remembers they have work tomorrow',
  'Infinite sighing from across the table',
  'A judge is called',
  'Fewer game night invitations',
  'The table asks you to explain it again',
];

let foolsDay: boolean | undefined;

function isFoolsDay(): boolean {
  if (foolsDay === undefined) {
    const today = new Date();
    foolsDay = today.getMonth() === 3 && today.getDate() === 1;
  }
  return foolsDay;
}

function subscribe() {
  return () => {};
}

/* Always false while rendering on the server and hydrating, so cached pages never carry the jokes into another day. */
export default function useFoolsDay(): boolean {
  return useSyncExternalStore(subscribe, isFoolsDay, () => false);
}

export function bonusResult(comboId: string): string {
  const hash = Array.from(comboId).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return BONUS_RESULTS[hash % BONUS_RESULTS.length];
}

export function explanationStep(stepCount: number): string {
  return `Explain the combo to the table for ${stepCount} ${pluralize('minute', stepCount)} while everyone reads every card`;
}
