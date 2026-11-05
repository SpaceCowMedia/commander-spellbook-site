import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { bagEndBanquet } from 'lib/combo/widgets/bagEndBanquet';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

test('copies Bag End Banquet with Urza for {6} or Cogwork Assembler for {7}', () => {
  expect(specFor(bagEndBanquet, '2043-6965-7826')).toEqual({ widget: 'bag-end-banquet', copier: 'Urza', cost: '{6}' });
  expect(specFor(bagEndBanquet, '152-7826')).toMatchObject({ copier: 'Cogwork Assembler', cost: '{7}' });
});

test('starts for the {9} and {12} the combos ask for, {1} less for each Food you have', () => {
  expect(run(calculatorFor(bagEndBanquet, '2043-6965-7826')).headline.value).toBe('{9}');
  expect(run(calculatorFor(bagEndBanquet, '152-7826')).headline.value).toBe('{12}');
  expect(run(calculatorFor(bagEndBanquet, '2043-6965-7826'), { numbers: { foods: 2 } }).headline.value).toBe('{7}');
  expectSteadyFrom(calculatorFor(bagEndBanquet, '2043-6965-7826'), 'foods', 3);
});

test('charts your mana step by step: down for each copy, up as it taps for the Foods', () => {
  const chart = run(calculatorFor(bagEndBanquet, '2043-6965-7826')).charts![1] as DotChart;
  expect(chart.dots.map((dot) => dot.y).slice(0, 7)).toEqual([9, 3, 6, 0, 6, 0, 9]);
  expect(chart.dots[2].label).toBe('The copy taps for 3: 6');
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(bagEndBanquet, '2043-6965-7826'));
});
