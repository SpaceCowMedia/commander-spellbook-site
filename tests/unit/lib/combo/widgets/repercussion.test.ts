import { expect, test } from 'vitest';
import { repercussion } from 'lib/combo/widgets/repercussion';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

test('deals 13 to each player per creature they control, cheaper for every creature', () => {
  const calculator = calculatorFor(repercussion, '2484-4083');
  expect(calculator.inputs.map((input) => input.key)).toEqual(['creatures']);
  const result = run(calculator, {
    numbers: { creatures: 2 },
    opponents: [
      { life: 39, creatures: 3 },
      { life: 40, creatures: 3 },
    ],
  });
  expect(result.outcomes).toEqual([
    { tone: 'good', text: 'Dies' },
    { tone: 'bad', text: 'Survives at 1' },
  ]);
  expect(result.verdict).toEqual({ tone: 'warn', title: '1 of 2 opponents dies', detail: 'You take 26 damage.' });
  expect(result.stats).toEqual([
    { label: 'Damage you take', value: '26', caption: 'only if an opponent survives' },
    { label: 'Blasphemous Act costs', value: '{0}{R}', mana: { generic: 0, pips: { R: 1 } } },
  ]);
  expectSaneAtExtremes(calculator);
});

test('ends the game before your own triggers when every opponent dies', () => {
  const calculator = calculatorFor(repercussion, '2484-4083');
  expect(run(calculator, { numbers: { creatures: 5 }, opponents: [{ life: 39, creatures: 3 }] }).verdict).toEqual({
    tone: 'good',
    title: 'Every opponent dies',
    detail: 'Before the triggers that would damage you resolve.',
  });
});
