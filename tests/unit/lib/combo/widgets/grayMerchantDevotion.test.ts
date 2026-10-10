import { expect, test } from 'vitest';
import { grayMerchantDevotion } from 'lib/combo/widgets/grayMerchantDevotion';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('drains devotion times opponents, against what the loop needs', () => {
  const calculator = calculatorFor(grayMerchantDevotion, '328-791-1494-2334');
  expect(run(calculator, { numbers: { devotion: 5, opponents: 3 } })).toMatchObject({
    headline: { value: '15', caption: '15 needed' },
    verdict: { tone: 'good', title: 'The loop pays for itself', detail: 'Exactly enough.' },
    meter: { have: 15, need: 15, unit: 'life' },
  });
  expect(run(calculator, { numbers: { devotion: 4, opponents: 3 } }).verdict?.title).toBe('3 life short each time');
  expectSaneAtExtremes(calculator);
});
