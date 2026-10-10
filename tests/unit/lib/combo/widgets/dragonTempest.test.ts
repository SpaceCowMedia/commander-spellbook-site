import { expect, test } from 'vitest';
import { dragonTempest } from 'lib/combo/widgets/dragonTempest';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('gives the damage of every d20 roll and their average', () => {
  const calculator = calculatorFor(dragonTempest, '2855-5982');
  expect(calculator.opponents).toBeUndefined();
  const result = run(calculator, { numbers: { dragons: 1 } });
  expect(result.headline).toEqual({ label: 'Average damage', value: '154', caption: 'from 2 on a 1 to 420 on a 20' });
  const chart = result.charts?.[0];
  expect(chart?.kind === 'dots' && chart.dots).toHaveLength(20);
  expect(chart?.kind === 'dots' && chart.dots[11]).toEqual({ x: 12, y: 156, label: 'Roll 12: 156 damage' });
  expectSaneAtExtremes(calculator);
});
