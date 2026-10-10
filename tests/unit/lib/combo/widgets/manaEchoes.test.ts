import { expect, test } from 'vitest';
import { manaEchoes } from 'lib/combo/widgets/manaEchoes';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

type Fixture = Parameters<typeof calculatorFor>[1];

const startOf = (id: Fixture, numbers: Record<string, number> = {}) =>
  run(calculatorFor(manaEchoes, id), { numbers }).headline.value;

test('starts Fire Nation Archers for {13}, one less than one activation at a time', () => {
  expect(startOf('2440-6873')).toBe('{13}');
  expect([1, 2, 3, 4, 9].map((others) => startOf('2440-6873', { others }))).toEqual([
    '{10}',
    '{8}',
    '{6}',
    '{5}',
    '{5}',
  ]);
});

test('reads how many creatures already count from the prerequisites', () => {
  expect(specFor(manaEchoes, '2440-8167')).toMatchObject({ base: 0, initial: 7 });
  expect(startOf('2440-8167')).toBe('{8}');
  expect(specFor(manaEchoes, '1283-2273-2440')).toMatchObject({ base: 1, initial: 2, castsSlivers: true });
  expect(startOf('1283-2273-2440')).toBe('{4}');
  expect(specFor(manaEchoes, '2440-5090-5663')).toMatchObject({ costs: ['{2}', '{8}'], base: 1, initial: 6 });
  expect(startOf('2440-5090-5663')).toBe('{2}');
});

test('counts the combo pieces that share a creature type with the new creatures', () => {
  expect(specFor(manaEchoes, '1537-1812-2440-4183')).toMatchObject({ base: 2, colorRate: 2 });
  expect(startOf('1537-1812-2440-4183')).toBe('{U}{R}{R}');
  expect(specFor(manaEchoes, '1283-1537-2440-4183')).toMatchObject({ colorRate: 1 });
  expect(startOf('1283-1537-2440-4183')).toBe('{2}');
  expect(specFor(manaEchoes, '252-2054-2440-7311')).toMatchObject({ base: 1 });
  expect(specFor(manaEchoes, '2440-4720-7546')).toMatchObject({ base: 2, stacks: false });
  expect(specFor(manaEchoes, '1170-1812-2440-7528')).toMatchObject({ made: 2, bonus: 1 });
  expect(startOf('1170-1812-2440-7528')).toBe('{5}{R}{R}');
});

test('stays sane at the extremes', () => {
  const ids: Fixture[] = [
    '2440-6873',
    '2440-2797',
    '2440-7282',
    '1283-2273-2440',
    '1765-2054-2440-7311',
    '2440-4720-7546',
  ];
  ids.forEach((id) => expectSaneAtExtremes(calculatorFor(manaEchoes, id)));
});

test('stops at the count from which the start no longer changes', () => {
  expectSteadyFrom(calculatorFor(manaEchoes, '2440-6873'), 'others', 4);
  expectSteadyFrom(calculatorFor(manaEchoes, '1283-2273-2440'), 'others', 2);
  expectSteadyFrom(calculatorFor(manaEchoes, '1283-2273-2440'), 'others', 6, { numbers: { sliver: 5 } });
  expectSteadyFrom(calculatorFor(manaEchoes, '1283-1537-2440-4183'), 'others', 0);
});
