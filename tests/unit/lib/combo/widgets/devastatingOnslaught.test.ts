import { expect, test } from 'vitest';
import { copiesFor } from 'lib/combo/widgets/devastatingOnslaught';
import { devastatingOnslaughtScourge } from 'lib/combo/widgets/devastatingOnslaughtScourge';
import { devastatingOnslaughtTerror } from 'lib/combo/widgets/devastatingOnslaughtTerror';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('{X}{X}{R} makes X copies', () => {
  expect([3, 4, 11, 12].map(copiesFor)).toEqual([1, 1, 5, 5]);
});

test('Terror of the Peaks: every copy sees every other one enter', () => {
  const calculator = calculatorFor(devastatingOnslaughtTerror, '1110-6785');
  expect(calculator.opponents).toBeUndefined();
  const result = run(calculator, { numbers: { mana: 11 } });
  expect(result.headline).toEqual({ label: 'Total damage', value: '125', caption: '25 triggers of 5' });
  expect(result.stats).toEqual([{ label: 'X', value: '5', caption: '{5}{5}{R}' }]);
  const chart = result.charts?.[0];
  expect(chart?.kind === 'dots' && chart.dots.find((dot) => dot.x === 11)).toEqual({
    x: 11,
    y: 125,
    label: '{11}: 125 damage',
  });
  expectSaneAtExtremes(calculator);
});

test('Scourge of Valkas: each trigger deals the Dragons you control', () => {
  const calculator = calculatorFor(devastatingOnslaughtScourge, '2676-6785');
  expect(run(calculator, { numbers: { mana: 11, dragons: 0 } }).headline).toMatchObject({
    value: '180',
    caption: '30 triggers of 6',
  });
  expectSaneAtExtremes(calculator);
});
