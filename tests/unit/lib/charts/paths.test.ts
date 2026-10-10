import { expect, test } from 'vitest';
import { areaPath, linePath } from 'lib/charts/paths';

const POINTS = [
  { x: 0.5, y: 17.5 },
  { x: 1.5, y: 35 },
  { x: 2.5, y: 50 },
];

test('draws a line through the points in order', () => {
  expect(linePath(POINTS)).toBe('M0.5 17.5 L1.5 35 L2.5 50');
  expect(linePath([{ x: 3, y: 4 }])).toBe('M3 4');
  expect(linePath([])).toBe('');
});

test('closes the line down to the baseline to shade under it', () => {
  expect(areaPath(POINTS, 100)).toBe('M0.5 17.5 L1.5 35 L2.5 50 L2.5 100 L0.5 100 Z');
  expect(areaPath([{ x: 3, y: 4 }], 100)).toBe('');
});

test('keeps the numbers short', () => {
  expect(linePath([{ x: 1 / 3, y: 200 / 3 }])).toBe('M0.33 66.67');
  expect(linePath([{ x: 0.1 + 0.2, y: -0.001 }])).toBe('M0.3 0');
});
