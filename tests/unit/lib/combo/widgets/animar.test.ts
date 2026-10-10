import { expect, test } from 'vitest';
import { animar, freeFrom, genericToPay } from 'lib/combo/widgets/animar';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

/* One cast at a time, as the reference */
function reference(casts: number[], counters: number): number {
  let total = 0;
  for (let i = 0; i < casts.length + 20; i++) {
    total += Math.max(0, casts[Math.min(i, casts.length - 1)] - counters - i);
  }
  return total;
}

test('sums the generic mana cast by cast', () => {
  expect([0, 1, 2, 3, 4].map((counters) => genericToPay([4], counters))).toEqual([10, 6, 3, 1, 0]);
  for (const casts of [[4], [2], [2, 2], [4, 2], [6, 2], [1, 2]]) {
    for (let counters = 0; counters < 8; counters++) {
      expect(genericToPay(casts, counters)).toBe(reference(casts, counters));
    }
  }
});

test('starts from the counters the prerequisites ask for', () => {
  expect(specFor(animar, '3771-6869-6884')).toEqual({ widget: 'animar', fixed: '{W}', casts: [4, 2], counters: 2 });
  expect(run(calculatorFor(animar, '3771-6869-6884')).headline.value).toBe('{2}{W}');
  expect(run(calculatorFor(animar, '2060-3771-4518-6930')).headline.value).toBe('{W}');
});

test('adds the part of each line Animar never reduces', () => {
  expect(run(calculatorFor(animar, '2-3771')).headline.value).toBe('{10}');
  expect(run(calculatorFor(animar, '147-3771-7300')).headline.value).toBe('{3}{W}{R}{R}');
  expect(run(calculatorFor(animar, '3771-6867-7043')).headline.value).toBe('{3}{W}{W}');
  expectSaneAtExtremes(calculatorFor(animar, '2-3771'));
});

test('stops at the counters that make every cast free', () => {
  for (const casts of [[4], [2], [2, 2], [4, 2], [6, 2], [1, 2]]) {
    let counters = 0;
    while (genericToPay(casts, counters) > 0) {
      counters++;
    }
    expect(freeFrom(casts), `${casts}`).toBe(counters);
  }
  expectSteadyFrom(calculatorFor(animar, '2-3771'), 'counters', 4);
  expectSteadyFrom(calculatorFor(animar, '3771-6869-6884'), 'counters', 4);
});
