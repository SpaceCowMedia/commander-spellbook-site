import { expect, test } from 'vitest';
import { niceScale, niceTicks } from 'lib/charts/ticks';

test('marks an axis with round steps', () => {
  expect(niceTicks(0, 100, 4)).toEqual([0, 50, 100]);
  expect(niceTicks(0, 42, 4)).toEqual([0, 20, 40]);
  expect(niceTicks(3, 17, 3)).toEqual([5, 10, 15]);
});

test('stays round for tiny and huge spans', () => {
  expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  expect(niceTicks(0, 1_000_000_000, 4)).toEqual([0, 500_000_000, 1_000_000_000]);
});

test('copes with spans that are no span at all', () => {
  expect(niceTicks(3, 3, 4)).toEqual([3]);
  expect(niceTicks(5, 1, 4)).toEqual([]);
  expect(niceTicks(0, Infinity, 4)).toEqual([]);
});

test('reaches past the span to the round step that wastes the least room', () => {
  expect(niceScale(0, 33, 4)).toEqual([0, 10, 20, 30, 40]);
  expect(niceScale(0, 100, 4)).toEqual([0, 50, 100]);
  expect(niceScale(0, 7, 4, 1)).toEqual([0, 2, 4, 6, 8]);
  expect(niceScale(0, 2, 4, 1)).toEqual([0, 1, 2]);
  expect(niceScale(-3, 7, 4, 1)).toEqual([-4, -2, 0, 2, 4, 6, 8]);
  expect(niceScale(0, 420, 4)).toEqual([0, 100, 200, 300, 400, 500]);
  expect(niceScale(0, 1_000_000_000, 4)).toEqual([0, 500_000_000, 1_000_000_000]);
});

test('gives even a flat scale a step', () => {
  expect(niceScale(0, 0, 4, 1)).toEqual([0, 1]);
  expect(niceScale(5, 5, 4, 1)).toEqual([5, 6]);
  expect(niceScale(0, Infinity, 4)).toEqual([]);
});
