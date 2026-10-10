import { expect, test } from 'vitest';
import { maddeningCacophony } from 'lib/combo/widgets/maddeningCacophony';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('mills half the library kicked, eight cards otherwise', () => {
  const calculator = calculatorFor(maddeningCacophony, '5069-5080');
  const opponents = [{ life: 20, library: 40 }];
  expect(run(calculator, { opponents }).outcomes).toEqual([{ tone: 'good', text: 'Dies' }]);
  expect(run(calculator, { opponents, choices: { kicked: 'no' } }).outcomes).toEqual([
    { tone: 'bad', text: 'Survives at 12' },
  ]);
  expectSaneAtExtremes(calculator);
});
