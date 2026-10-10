import { expect, test } from 'vitest';
import { arcSloggerActivations, cosmogoyf } from 'lib/combo/widgets/cosmogoyf';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('Cosmogoyf needs one {R} per ten life, as far as the library goes', () => {
  expect(arcSloggerActivations(60, 0, 40)).toBe(4);
  expect(arcSloggerActivations(60, 5, 40)).toBe(4);
  expect(arcSloggerActivations(25, 0, 40)).toBe(2);
  expect(arcSloggerActivations(60, 50, 40)).toBe(0);
  const calculator = calculatorFor(cosmogoyf, '182-6907-6908');
  expect(calculator.opponents).toBeUndefined();
  const result = run(calculator);
  expect(result.headline.value).toBe('{1}{B}{G}{R}{R}{R}{R}');
  expect(result.verdict).toEqual({ tone: 'good', title: 'Every opponent dies' });
  expect(run(calculator, { numbers: { library: 25, highestLife: 31 } }).verdict).toEqual({
    tone: 'bad',
    title: '11 life short',
    detail: 'Your library runs out of cards to exile.',
  });
  expectSaneAtExtremes(calculator);
});
