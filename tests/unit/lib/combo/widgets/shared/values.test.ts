import { expect, test } from 'vitest';
import type { Calculator } from 'lib/combo/widgets/shared/calculator';
import { choiceInput, numberInput, OPPONENT_LIFE } from 'lib/combo/widgets/shared/inputs';
import { DEFAULT_OPPONENTS, sameValues, valuesFor } from 'lib/combo/widgets/shared/values';

const calculator: Calculator = {
  category: 'lethal',
  title: 'Title',
  summary: 'Summary',
  inputs: [
    numberInput('life', 'Life', 40, { min: 1 }),
    choiceInput('kicked', 'Kicked', [
      ['yes', 'Yes'],
      ['no', 'No'],
    ]),
  ],
  opponents: { fields: [OPPONENT_LIFE] },
  compute: () => ({ headline: { label: '', value: '' } }),
};

test('starts every input at its initial value, with three opponents', () => {
  expect(valuesFor(calculator)).toEqual({
    numbers: { life: 40 },
    choices: { kicked: 'yes' },
    opponents: Array.from({ length: DEFAULT_OPPONENTS }, () => ({ life: 40 })),
  });
});

test('can pick another value for every number, and another number of opponents', () => {
  expect(valuesFor(calculator, (input) => input.min, 1)).toEqual({
    numbers: { life: 1 },
    choices: { kicked: 'yes' },
    opponents: [{ life: 1 }],
  });
});

test('tells the same values from changed ones', () => {
  const values = valuesFor(calculator);
  expect(sameValues(values, valuesFor(calculator))).toBe(true);
  expect(sameValues(values, { ...values, numbers: { life: 39 } })).toBe(false);
  expect(sameValues(values, { ...values, choices: { kicked: 'no' } })).toBe(false);
  expect(sameValues(values, { ...values, opponents: values.opponents.slice(1) })).toBe(false);
  expect(sameValues(values, { ...values, opponents: [{ life: 1 }, ...values.opponents.slice(1)] })).toBe(false);
});
