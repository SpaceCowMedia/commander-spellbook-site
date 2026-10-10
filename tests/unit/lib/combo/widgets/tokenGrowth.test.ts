import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { tokenGrowth } from 'lib/combo/widgets/tokenGrowth';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

const calculator = () => calculatorFor(tokenGrowth, '851-4365-7858');

test('grows the tokens by a factor every upkeep', () => {
  const result = run(calculator(), { numbers: { start: 2, upkeeps: 3 } });
  expect(result.headline).toMatchObject({ label: 'Wolves', value: '250', caption: 'after 3 upkeeps' });
});

test('charts the growth upkeep by upkeep, each dot picking that many upkeeps', () => {
  const chart = run(calculator(), { numbers: { start: 2, upkeeps: 3 } }).charts![0] as DotChart;
  expect(chart).toMatchObject({
    kind: 'dots',
    title: 'Wolves, upkeep by upkeep',
    xLabel: 'Upkeeps',
    selects: 'upkeeps',
  });
  expect(chart.dots).toHaveLength(10);
  expect(chart.dots.slice(0, 3)).toEqual([
    { x: 1, y: 10, label: '1 upkeep: 10 Wolves' },
    { x: 2, y: 50, label: '2 upkeeps: 50 Wolves' },
    { x: 3, y: 250, label: '3 upkeeps: 250 Wolves' },
  ]);
  expect(chart.before).toBeUndefined();
  expect(chart.after).toEqual({ x: 11, y: 2 * 5 ** 11 });
});

test('moves on to the upkeeps around the one chosen', () => {
  const chart = run(calculator(), { numbers: { start: 2, upkeeps: 14 } }).charts![0] as DotChart;
  expect(chart.dots.map((dot) => dot.x)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  expect(chart.before).toEqual({ x: 10, y: 2 * 5 ** 10 });
});

test('counts far past what a number can hold, where there is nothing left to draw', () => {
  const result = run(calculator(), { numbers: { start: 2, upkeeps: 1_000_000_000 } });
  expect(result.headline.value).toMatch(/^\d\.\d\d × 10\^698,970,004$/);
  expect(result.charts).toBeUndefined();
  expectSaneAtExtremes(calculator());
});
