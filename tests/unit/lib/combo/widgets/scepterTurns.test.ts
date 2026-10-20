import { expect, test } from 'vitest';
import { scepterTurns } from 'lib/combo/widgets/scepterTurns';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('takes an extra turn for every three charge counters', () => {
  const calculator = calculatorFor(scepterTurns, '1870-3609-4153');
  expect(run(calculator, { numbers: { life: 40, counters: 2 } }).headline).toEqual({
    label: 'Extra turns',
    value: '14',
  });
  expectSaneAtExtremes(calculator);
});
