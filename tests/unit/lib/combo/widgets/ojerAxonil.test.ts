import { expect, test } from 'vitest';
import { ojerAxonil } from 'lib/combo/widgets/ojerAxonil';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

const calculator = () => calculatorFor(ojerAxonil, '2868-4629');

test('says how much life the activations cost you, without asking for yours', () => {
  expect(calculator().inputs.map((input) => input.key)).toEqual(['power', 'toughness', 'highestLife']);
  const result = run(calculator(), { numbers: { power: 4, highestLife: 40 } });
  expect(result.verdict).toBeUndefined();
  expect(result.meter).toBeUndefined();
  expect(result.stats?.[0]).toEqual({
    label: 'You lose',
    value: '10 life',
    caption: 'with exactly that much life the game is a draw',
  });
});

test('counts the activations the highest life total takes', () => {
  expect(calculator().opponents).toBeUndefined();
  expect(run(calculator(), { numbers: { power: 4, highestLife: 41 } }).headline).toEqual({
    label: 'Activations',
    value: '11',
  });
});

test('says whether Ojer Axonil lives until the last activation', () => {
  const taken = (toughness: number) =>
    run(calculator(), { numbers: { power: 4, toughness, highestLife: 41 } }).stats?.find(
      (stat) => stat.label === 'Ojer Axonil takes',
    );
  expect(taken(4)).toEqual({
    label: 'Ojer Axonil takes',
    value: '11 damage',
    caption: 'it would die on activation 4: give it indestructible or protection',
  });
  expect(taken(10)?.caption).toBe('it would die on activation 10: give it indestructible or protection');
  expect(taken(11)?.caption).toBe('it dies on the last activation, together with the opponents');
  expect(taken(12)?.caption).toBe('it survives');
});

test('charts the activations against the power, marking where Ojer Axonil outlives them', () => {
  const chart = run(calculator(), { numbers: { power: 4, toughness: 8, highestLife: 40 } }).charts![0] as DotChart;
  expect(chart).toMatchObject({ title: "Activations by Ojer Axonil's power", selects: 'power', steadyFrom: 40 });
  expect(chart.dots.map((dot) => dot.y)).toEqual([40, 20, 14, 10, 8, 7, 6, 5, 5, 4]);
  expect(chart.dots[3]).toEqual({
    x: 4,
    y: 10,
    label: 'Power 4: 10 activations, more than its toughness',
    tone: 'warn',
  });
  expect(chart.dots[4]).toEqual({ x: 5, y: 8, label: 'Power 5: 8 activations', tone: 'good' });
  expectSteadyFrom(calculator(), 'power', 40);
});

test('starts from the power and toughness printed on Ojer Axonil', () => {
  const initial = Object.fromEntries(calculator().inputs.map((input) => [input.key, input.initial]));
  expect(initial).toMatchObject({ power: 4, toughness: 4 });
});

test('counts the mana for a billion life without writing a billion symbols', () => {
  const result = run(calculator(), { numbers: { power: 1, highestLife: 1_000_000_000 } });
  const mana = result.stats?.find((stat) => stat.label === 'Mana');
  expect(mana?.value.length).toBeLessThan(40);
  expectSaneAtExtremes(calculator());
});
