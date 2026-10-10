import { expect, test } from 'vitest';
import { sageOfHours } from 'lib/combo/widgets/sageOfHours';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('turns twice the counters into an extra turn per five, as the Notes say', () => {
  const calculator = calculatorFor(sageOfHours, '648-1494-6730');
  expect(run(calculator).headline).toEqual({ label: 'Extra turns', value: '24' });
  expect(run(calculator, { numbers: { library: 61, counters: 1 } }).headline.value).toBe('24');
  expect(run(calculator, { numbers: { library: 61, counters: 2 } }).headline.value).toBe('25');
  expectSaneAtExtremes(calculator);
});
