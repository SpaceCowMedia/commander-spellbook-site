import { expect, test } from 'vitest';
import type { DotChart, NumberInput } from 'lib/combo/widgets/shared/calculator';
import { krenko, stepByStep } from 'lib/combo/widgets/krenko';
import { calculatorFor, detects, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

const calculator = () => calculatorFor(krenko, '38-659-1288');
const withoutDiscount = () => krenko.calculator({ comboGoblins: 2, cheaperWith: undefined });
const verdictAt = (goblins: number, discounted = calculator()) =>
  run(discounted, { numbers: { goblins, casts: 1 } }).verdict;
const initialOf = (key: string, discounted = calculator()) =>
  (discounted.inputs.find((input) => input.key === key) as NumberInput).initial;

test('goes on forever from five Goblins above the tax, and dies out below', () => {
  expect(verdictAt(8, withoutDiscount())).toEqual({
    tone: 'good',
    title: 'The loop grows every time',
    detail: 'Arbitrarily many Goblins and red mana, faster each loop.',
  });
  expect(verdictAt(7, withoutDiscount())).toEqual({
    tone: 'good',
    title: 'The loop grows every time',
    detail: 'Arbitrarily many Goblins, two more each loop, as the tax grows by {2}.',
  });
  expect(verdictAt(6, withoutDiscount())).toEqual({ tone: 'bad', title: 'The loop stops in loop 4' });
  expect(verdictAt(4, withoutDiscount())?.title).toBe('The loop stops in loop 2');
  expect(run(withoutDiscount()).headline).toMatchObject({ value: '7', caption: 'with {2} commander tax' });
});

test('needs a Goblin less when Goblin Warchief makes Krenko cost {1} less', () => {
  expect(specFor(krenko, '38-659-1288')).toEqual({ widget: 'krenko', comboGoblins: 3, cheaperWith: 'Goblin Warchief' });
  expect(verdictAt(7)?.detail).toBe('Arbitrarily many Goblins and red mana, faster each loop.');
  expect(verdictAt(6)).toMatchObject({ tone: 'good', title: 'The loop grows every time' });
  expect(verdictAt(5)).toEqual({ tone: 'bad', title: 'The loop stops in loop 4' });
  expect(verdictAt(4)?.title).toBe('The loop stops in loop 3');
  expect(calculator().summary).toContain('for {1} less with Goblin Warchief');
  expect(withoutDiscount().summary).not.toContain('{1} less');
});

test('keeps up with the tax on two more Goblins a loop, never short of the next recast', () => {
  const { dots, after, failedAt } = stepByStep(6, 1, 1);
  expect(failedAt).toBeUndefined();
  expect(dots.map((dot) => dot.y)).toEqual([6, 12, 8, 16, 10, 20, 12, 24, 14, 28, 16, 32, 18, 36, 20, 40, 22]);
  expect(after).toEqual({ x: 17, y: 44 });
});

test('starts at the fewest Goblins that keep the loop going after one cast of Krenko', () => {
  expect(initialOf('casts')).toBe(1);
  expect(initialOf('goblins')).toBe(6);
  expect(initialOf('goblins', withoutDiscount())).toBe(7);
  expect(run(calculator()).headline).toMatchObject({ value: '6', caption: 'with {2} commander tax' });
  expect(run(calculator()).meter).toEqual({ have: 6, need: 6, unit: 'Goblins' });
  expect(run(calculator()).verdict?.tone).toBe('good');
  expect(run(withoutDiscount()).verdict?.tone).toBe('good');
});

test('takes the discount from The Fire Crystal too', () => {
  const crystal = {
    uses: ['Krenko, Mob Boss', 'Skirk Prospector', 'The Fire Crystal'],
    description: 'plus commander tax',
  };
  expect(detects(krenko, crystal)).toBe(true);
  expect(krenko.calculator({ comboGoblins: 2, cheaperWith: 'The Fire Crystal' }).summary).toContain(
    'for {1} less with The Fire Crystal',
  );
});

test('charts the Goblins step by step: up when Krenko taps, down to recast it', () => {
  const chart = run(calculator(), { numbers: { goblins: 8, casts: 1 } }).charts![0] as DotChart;
  expect(chart).toMatchObject({ kind: 'dots', title: 'Goblins, step by step', xLabel: 'Step' });
  expect(chart.dots).toHaveLength(17);
  expect(chart.dots.slice(0, 5)).toEqual([
    { x: 0, y: 8, label: 'To start: 8 Goblins' },
    { x: 1, y: 16, label: 'Krenko taps: 16 Goblins' },
    { x: 2, y: 12, label: 'Sacrifice 5, Krenko included, to recast it for {3}{R}{R}: 12 Goblins' },
    { x: 3, y: 24, label: 'Krenko taps: 24 Goblins' },
    { x: 4, y: 18, label: 'Sacrifice 7, Krenko included, to recast it for {5}{R}{R}: 18 Goblins' },
  ]);
});

test('points past the last step to the next tap while the loop goes on', () => {
  const chart = run(calculator(), { numbers: { goblins: 8, casts: 1 } }).charts![0] as DotChart;
  expect(chart.dots.at(-1)).toMatchObject({ x: 16, y: 534 });
  expect(chart.after).toEqual({ x: 17, y: 1068 });
  const steady = run(calculator(), { numbers: { goblins: 6, casts: 1 } }).charts![0] as DotChart;
  expect(steady.after).toEqual({ x: 17, y: 2 * steady.dots.at(-1)!.y });
  expect(chart.before).toBeUndefined();
});

test('charges {2}{R}{R} plus tax without a discount', () => {
  expect(stepByStep(8, 1, 0).dots.slice(1, 3)).toEqual([
    { x: 1, y: 16, label: 'Krenko taps: 16 Goblins' },
    { x: 2, y: 11, label: 'Sacrifice 6, Krenko included, to recast it for {4}{R}{R}: 11 Goblins' },
  ]);
});

test('ends the chart on the tap that leaves too few Goblins to recast Krenko', () => {
  const { dots, after, failedAt } = stepByStep(4, 1, 1);
  expect(failedAt).toBe(3);
  expect(after).toBeUndefined();
  expect(dots.map((dot) => dot.y)).toEqual([4, 8, 4, 8, 2, 4]);
  expect(dots.at(-1)).toEqual({
    x: 5,
    y: 4,
    label: 'Krenko taps: 4 Goblins, too few to recast it for {7}{R}{R}',
    tone: 'bad',
  });
});

test("starts the Goblins at the combo's own: Krenko, Skirk Prospector and Goblin Warchief", () => {
  const goblins = calculator().inputs.find((input) => input.key === 'goblins') as NumberInput;
  expect(goblins.min).toBe(3);
  const fewer = withoutDiscount().inputs.find((input) => input.key === 'goblins') as NumberInput;
  expect(fewer.min).toBe(2);
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculator());
  expectSaneAtExtremes(withoutDiscount());
});
