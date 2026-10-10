import { expect, test } from 'vitest';
import { aatchikLoop } from 'lib/combo/widgets/aatchikLoop';
import { calculatorFor, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

test('costs eight a loop with Temur Sabertooth and six with Cloudstone Curio', () => {
  expect(specFor(aatchikLoop, '215-4050-6251')).toEqual({ widget: 'aatchik-loop', cost: 8 });
  expect(specFor(aatchikLoop, '2232-4050-6251')).toEqual({ widget: 'aatchik-loop', cost: 6 });
});

test('never stops with enough cards, and otherwise lasts as long as your mana', () => {
  const calculator = calculatorFor(aatchikLoop, '215-4050-6251');
  expect(run(calculator).headline.value).toBe('As many as you like');
  expect(run(calculator).verdict?.tone).toBe('good');
  const short = run(calculator, { numbers: { cards: 7, mana: 3 } });
  expect(short.headline).toEqual({ label: 'Loops', value: '4', caption: '28 life from each opponent' });
  expect(short.verdict).toEqual({ tone: 'warn', title: 'The loop stops when your mana runs out' });
  expect(calculator.opponents).toBeUndefined();
  expectSaneAtExtremes(calculator);
});
