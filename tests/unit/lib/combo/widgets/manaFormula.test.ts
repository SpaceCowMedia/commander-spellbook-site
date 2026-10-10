import { expect, test } from 'vitest';
import { manaFormula, termAmount, termSteadyFrom } from 'lib/combo/widgets/manaFormula';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

const answer = (id: Parameters<typeof calculatorFor>[1], numbers: Record<string, number> = {}) =>
  run(calculatorFor(manaFormula, id), { numbers }).headline.value;

test('keeps a term between nothing and its most', () => {
  expect(termAmount({ slope: 2, offset: -1 }, 0)).toBe(0);
  expect(termAmount({ slope: 2, offset: -1 }, 3)).toBe(5);
  expect(termAmount({ slope: 1, offset: 0, max: 3 }, 5)).toBe(3);
  expect(termAmount({ slope: -1, offset: 10, max: 2 }, 7)).toBe(2);
});

test('knows where a term stays put, at its most or at nothing', () => {
  expect(termSteadyFrom({ slope: 1, offset: 0, max: 3 })).toBe(3);
  expect(termSteadyFrom({ slope: 2, offset: 1, max: 8 })).toBe(4);
  expect(termSteadyFrom({ slope: -1, offset: 10, max: 2 })).toBe(10);
  expect(termSteadyFrom({ slope: 1, offset: 0 })).toBe(Infinity);
  expect(termSteadyFrom({ slope: 0, offset: 5 })).toBe(-Infinity);
});

test('Mona Lisa pays less of the Witch the more power it has', () => {
  expect([0, 1, 2, 3, 9].map((power) => answer('2024-7308', { power }))).toEqual([
    '{2}{G/W}{G/W}',
    '{2}{G/W}',
    '{1}{G/W}',
    '{G/W}',
    '{G/W}',
  ]);
});

test('Ruthless Technomancer costs less with more artifacts', () => {
  expect([7, 8, 9, 10].map((artifacts) => answer('1966-3719-6981', { artifacts }))).toEqual([
    '{5}{B}{B}{B}',
    '{5}{B}',
    '{3}{B}',
    '{1}{B}',
  ]);
});

test('stops where every term on the swept number stays put', () => {
  expectSteadyFrom(calculatorFor(manaFormula, '2024-7308'), 'power', 3);
  expectSteadyFrom(calculatorFor(manaFormula, '1966-3719-6981'), 'artifacts', 10);
});

test('stays sane at the extremes', () => {
  (['2024-7308', '1966-3719-6981'] as const).forEach((id) => expectSaneAtExtremes(calculatorFor(manaFormula, id)));
});
