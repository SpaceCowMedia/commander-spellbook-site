import { expect, test } from 'vitest';
import { chanceTone, dots, formatSwept, stepPage, sweep, sweptDots } from 'lib/combo/widgets/shared/charts';
import { numberInput } from 'lib/combo/widgets/shared/inputs';

const storm = numberInput('storm', 'Spells', 0);
const iterations = numberInput('iterations', 'Iterations', 5, { min: 1 });
const mana = numberInput('mana', 'Mana', 11, { min: 3 });
const page = (first: number, step = 1) => Array.from({ length: 10 }, (_, i) => first + i * step);
/* a loop that counts its steps, for `steps` of them */
const counting =
  (steps = Infinity) =>
  (count: number) =>
    Array.from({ length: Math.min(count, steps) }, (_, x) => ({ x, y: x, label: `${x}` }));

test('sweeps the page the current value is on, inside the range', () => {
  expect(sweep(storm, 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(sweep(storm, 9)).toEqual(page(0));
  expect(sweep(storm, 10)).toEqual(page(10));
  expect(sweep(storm, 25)).toEqual(page(20));
  expect(sweep(iterations, 10)).toEqual(page(1));
  expect(sweep(iterations, 11)).toEqual(page(11));
  expect(sweep(numberInput('x', 'X', 0, { max: 3 }), 2)).toEqual([0, 1, 2, 3]);
  expect(sweep(storm, 1_000_000_000)).toEqual(page(999_999_991));
});

test('sweeps in steps, through the current value', () => {
  expect(sweep(mana, 11, mana.max, 2)).toEqual(page(3, 2));
  expect(sweep(mana, 21, mana.max, 2)).toEqual(page(3, 2));
  expect(sweep(mana, 23, mana.max, 2)).toEqual(page(23, 2));
  expect(sweep(mana, 12, mana.max, 2)).toEqual(page(4, 2));
  expect(sweep(mana, 1_000_000_000, mana.max, 2)).toEqual(page(999_999_982, 2));
  expect(sweptDots(mana, 23, (x) => ({ y: x, label: `${x}` }), mana.max, 2)).toMatchObject({
    before: { x: 21 },
    after: { x: 43 },
  });
});

test('builds dots and tones chances', () => {
  expect(dots([1, 2], (x) => ({ y: x * 2, label: `${x}` }))).toEqual({
    dots: [
      { x: 1, y: 2, label: '1' },
      { x: 2, y: 4, label: '2' },
    ],
  });
  expect([0.95, 0.6, 0.1].map(chanceTone)).toEqual(['good', 'warn', 'bad']);
});

test('gives the answers one step past both ends, where the range goes on', () => {
  const square = (x: number) => ({ y: x * x, label: `${x}` });
  expect(dots([3, 5, 7], square, { min: 0, max: 100 })).toMatchObject({
    before: { x: 1, y: 1 },
    after: { x: 9, y: 81 },
  });
  expect(dots([3, 5, 7], square, { min: 3, max: 8 })).not.toHaveProperty('before');
  expect(dots([3, 5, 7], square, { min: 3, max: 8 })).not.toHaveProperty('after');
  expect(sweptDots(storm, 20, square)).toMatchObject({ before: { x: 19 }, after: { x: 30 } });
  expect(sweptDots(storm, 0, square)).not.toHaveProperty('before');
  expect(sweptDots(storm, 30, square, 20)).not.toHaveProperty('after');
  expect(sweptDots(storm, 0, square, 20)).toMatchObject({ after: { x: 10, y: 100 } });
});

test('stops where the answer stops changing, the last dot standing for the rest', () => {
  expect(sweep(storm, 0, 4)).toEqual([0, 1, 2, 3, 4]);
  expect(sweep(storm, 30, 20)).toEqual(page(11));
  expect(sweep(storm, 1, 0)).toEqual([0]);
  expect([3, 4].map((x) => formatSwept(x, 4))).toEqual(['3', '4 or more']);
  expect(formatSwept(1000)).toBe('1,000');
});

test('pages a loop step by step, the first page with where it starts', () => {
  expect(stepPage(counting(), 0, 4)).toEqual({ dots: counting()(5), after: { x: 5, y: 5 }, page: 0 });
  const second = stepPage(counting(), 1, 4);
  expect(second.dots.map((dot) => dot.x)).toEqual([5, 6, 7, 8]);
  expect(second).toMatchObject({ before: { x: 4, y: 4 }, after: { x: 9, y: 9 }, page: 1 });
  expect(stepPage(counting(), 2, 4, 3).dots.map((dot) => dot.x)).toEqual([11, 12, 13, 14]);
});

test('stops turning pages where the loop ends or its numbers grow past what one can hold', () => {
  const last = stepPage(counting(7), 1, 4);
  expect(last.dots.map((dot) => dot.x)).toEqual([5, 6]);
  expect(last).not.toHaveProperty('after');
  expect(stepPage(counting(7), 9, 4)).toMatchObject({ page: 1, before: { x: 4 } });
  expect(stepPage(counting(1), 3, 4)).toEqual({ dots: counting()(1), page: 0 });
  const growing = (count: number) => Array.from({ length: count }, (_, x) => ({ x, y: 10 ** (100 * x), label: '' }));
  expect(stepPage(growing, 5, 2)).toEqual({ dots: [growing(4)[3]], before: { x: 2, y: 1e200 }, page: 1 });
});
