import { expect, test } from 'vitest';
import { highestPassing, lowestPassing } from 'lib/combo/widgets/shared/search';

test('finds the first passing integer', () => {
  expect(lowestPassing((n) => n * n >= 1_000_000_000, 0, 1_000_000_000)).toBe(31623);
  expect(lowestPassing(() => true, 5, 10)).toBe(5);
});

test('gives up when even the upper bound fails', () => {
  expect(lowestPassing(() => false, 0, 100)).toBe(Infinity);
});

test('finds the last passing integer', () => {
  expect(highestPassing((n) => n <= 41, 0, 1000)).toBe(41);
  expect(highestPassing(() => true, 0, 1000)).toBe(1000);
  expect(highestPassing(() => false, 3, 1000)).toBe(2);
});
