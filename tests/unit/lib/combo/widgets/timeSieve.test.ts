import { expect, test } from 'vitest';
import { timeSieve } from 'lib/combo/widgets/timeSieve';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

test('needs ⌈5 ÷ (opponents − 1)⌉ attackers', () => {
  const calculator = calculatorFor(timeSieve, '1558-4711');
  expect(run(calculator, { numbers: { opponents: 3, attackers: 3 } }).headline.value).toBe('3');
  expect(run(calculator, { numbers: { opponents: 6, attackers: 0 } }).verdict?.title).toBe('1 attacker short');
  expect(calculator.inputs.find((input) => input.key === 'opponents')).toMatchObject({ min: 2 });
  expectSaneAtExtremes(calculator);
});

test('charts the attackers against the opponents, down to one from six on', () => {
  const calculator = calculatorFor(timeSieve, '1558-4711');
  const chart = run(calculator, { numbers: { opponents: 3, attackers: 2 } }).charts![0] as DotChart;
  expect(chart.dots).toEqual([
    { x: 2, y: 5, label: '2 opponents: 5 attackers', tone: 'bad' },
    { x: 3, y: 3, label: '3 opponents: 3 attackers', tone: 'bad' },
    { x: 4, y: 2, label: '4 opponents: 2 attackers', tone: 'good' },
    { x: 5, y: 2, label: '5 opponents: 2 attackers', tone: 'good' },
    { x: 6, y: 1, label: '6 or more opponents: 1 attacker', tone: 'good' },
  ]);
  expectSteadyFrom(calculator, 'opponents', 6);
});
