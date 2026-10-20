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

test('charts your life drain by drain and payment by payment', () => {
  const calculator = calculatorFor(grayMerchantDevotion, '328-791-1494-2334');
  const lifeAt = (numbers: Record<string, number>) =>
    run(calculator, { numbers }).charts?.[0].dots.map((dot) => [dot.x, dot.y]);
  expect(lifeAt({ devotion: 4, opponents: 3, life: 10 })).toEqual([
    [0, 10],
    [1, 22],
    [2, 7],
    [3, 19],
    [4, 4],
    [5, 16],
    [6, 1],
  ]);
  expect(lifeAt({ devotion: 7, opponents: 3, life: 40 })?.slice(-2)).toEqual([
    [23, 127],
    [24, 112],
  ]);
  expect(lifeAt({ devotion: 4, opponents: 3, life: 3 })).toBeUndefined();
  expect(
    run(calculator, { numbers: { devotion: 4, opponents: 3, life: 10 } })
      .charts![0].dots.slice(1, 3)
      .map((dot) => dot.label),
  ).toEqual(['Turn 1, Gray Merchant drains 12: 22 life', 'Turn 1, pay 15 life: 7 life']);
});

test('heads for the next turn while the loop goes on past the page', () => {
  const calculator = calculatorFor(grayMerchantDevotion, '328-791-1494-2334');
  const afterOf = (numbers: Record<string, number>) => run(calculator, { numbers }).charts?.[0].after;
  expect(afterOf({ devotion: 5, opponents: 3, life: 40 })).toEqual({ x: 25, y: 55 });
  expect(afterOf({ devotion: 7, opponents: 3, life: 40 })).toEqual({ x: 25, y: 133 });
  expect(afterOf({ devotion: 4, opponents: 3, life: 100 })).toEqual({ x: 25, y: 76 });
  expect(afterOf({ devotion: 4, opponents: 3, life: 10 })).toBeUndefined();
});

test('turns the page to the next turns', () => {
  const calculator = calculatorFor(grayMerchantDevotion, '328-791-1494-2334');
  const chart = run(calculator, { numbers: { devotion: 4, opponents: 3, life: 100 }, page: 1 }).charts![0];
  expect(chart.page).toBe(1);
  expect(chart.before).toEqual({ x: 24, y: 64 });
  expect(chart.dots[0]).toMatchObject({ x: 25, y: 76 });
  expect(chart.dots).toHaveLength(24);
});
