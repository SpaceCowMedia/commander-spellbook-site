import { expect, test } from 'vitest';
import { simulacrumSynthesizer } from 'lib/combo/widgets/simulacrumSynthesizer';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

test('pays for copies until three Synthesizers break even', () => {
  const calculator = calculatorFor(simulacrumSynthesizer, '2043-4659-5747');
  expect(run(calculator).headline.value).toBe('{12}');
  expect(run(calculator, { numbers: { synthesizers: 2 } }).headline.value).toBe('{8}');
  expect(run(calculator, { numbers: { synthesizers: 3 } }).headline.value).toBe('{6}');
  expectSteadyFrom(calculator, 'synthesizers', 3);
  expectSaneAtExtremes(calculator);
});
