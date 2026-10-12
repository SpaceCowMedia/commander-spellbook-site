import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
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

test('returns Trusty Boomerang for {2} more each loop, its token counting the others of its type', () => {
  expect(specFor(manaEchoes, '2440-3581-7109-7297')).toMatchObject({ costs: ['{1}'], after: 2, base: 0 });
  expect(startOf('2440-3581-7109-7297')).toBe('{4}');
  expect(startOf('1765-1849-2440-7109')).toBe('{4}');
  expect(specFor(manaEchoes, '2440-7108-7109-7296')).toMatchObject({ base: 1 });
  expect(startOf('2440-7108-7109-7296')).toBe('{2}');
  expect(startOf('2079-2440-6737-7109')).toBe('{2}');
  expect(run(calculatorFor(manaEchoes, '2440-3581-7109-7297')).stats?.[0]).toMatchObject({ value: '{3}' });
});

test("casts a suspended spell again for The Tenth Doctor's {7}, from the creatures the prerequisites count", () => {
  expect(specFor(manaEchoes, '1618-2440-6596-7377')).toMatchObject({ costs: ['{7}'], stacks: false, initial: 6 });
  expect(startOf('1618-2440-6596-7377')).toBe('{7}');
  expect(startOf('1618-2440-6596-7377', { others: 0 })).toBe('{28}');
  expect(specFor(manaEchoes, '796-1618-2440-2806').others).toBe('Other Zombies you control');
});

test('copies Myr Propagator on top of the Mana Echoes triggers', () => {
  expect(specFor(manaEchoes, '2440-2703-5295')).toMatchObject({ costs: ['{3}'], stacks: true, base: 1 });
  expect(startOf('2440-2703-5295')).toBe('{4}');
});

test('charts the mana step by step, down for each activation and up for each refund', () => {
  const chart = run(calculatorFor(manaEchoes, '2440-2703-5295')).charts![1] as DotChart;
  expect(chart.title).toBe('Your mana, step by step');
  expect(chart.dots.map((dot) => dot.y).slice(0, 6)).toEqual([4, 1, 3, 0, 3, 0]);
  expect(chart.dots[2].label).toBe('Mana Echoes adds 2: 3');
});

test('stays sane at the extremes', () => {
  const ids: Fixture[] = [
    '2440-6873',
    '2440-2797',
    '2440-7282',
    '1283-2273-2440',
    '1765-2054-2440-7311',
    '2440-4720-7546',
    '2440-3581-7109-7297',
    '1618-2440-6596-7377',
    '2440-2703-5295',
  ];
  ids.forEach((id) => expectSaneAtExtremes(calculatorFor(manaEchoes, id)));
});

test('stops at the count from which the start no longer changes', () => {
  expectSteadyFrom(calculatorFor(manaEchoes, '2440-6873'), 'others', 4);
  expectSteadyFrom(calculatorFor(manaEchoes, '1283-2273-2440'), 'others', 2);
  expectSteadyFrom(calculatorFor(manaEchoes, '1283-2273-2440'), 'others', 6, { numbers: { sliver: 5 } });
  expectSteadyFrom(calculatorFor(manaEchoes, '1283-1537-2440-4183'), 'others', 0);
});
