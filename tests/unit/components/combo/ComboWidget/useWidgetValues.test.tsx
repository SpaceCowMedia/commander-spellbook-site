import { act, renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { Calculator } from 'lib/combo/widgets/shared/calculator';
import { OPPONENT_LIFE, numberInput } from 'lib/combo/widgets/shared/inputs';
import useWidgetValues from 'components/combo/ComboWidget/useWidgetValues';

const calculator: Calculator = {
  category: 'lethal',
  title: 'Is it lethal?',
  summary: 'Twice your life, against the total of theirs.',
  inputs: [
    numberInput('life', 'Life', 40),
    { kind: 'choice', key: 'mode', label: 'Mode', options: [{ value: 'a', label: 'A' }], initial: 'a' },
  ],
  opponents: { fields: [OPPONENT_LIFE] },
  compute: (values) => ({
    headline: {
      label: 'Damage',
      value: String(values.numbers.life * 2 - values.opponents.reduce((total, row) => total + row.life, 0)),
    },
  }),
};

test('starts from every input’s initial value', () => {
  const { result } = renderHook(() => useWidgetValues(calculator));
  expect(result.current.values).toEqual({
    numbers: { life: 40 },
    choices: { mode: 'a' },
    opponents: [{ life: 40 }, { life: 40 }, { life: 40 }],
  });
  expect(result.current.result.headline.value).toBe('-40');
});

test('answers again when an input changes', () => {
  const { result } = renderHook(() => useWidgetValues(calculator));
  act(() => result.current.setNumber('life', 100));
  expect(result.current.result.headline.value).toBe('80');
  act(() => result.current.setOpponents([{ life: 10 }]));
  expect(result.current.result.headline.value).toBe('190');
  act(() => result.current.setChoice('mode', 'b'));
  expect(result.current.values.choices.mode).toBe('b');
});

test('goes back to the initial values, and knows when it is there', () => {
  const { result } = renderHook(() => useWidgetValues(calculator));
  expect(result.current.pristine).toBe(true);
  act(() => result.current.setNumber('life', 100));
  expect(result.current.pristine).toBe(false);
  act(() => result.current.setNumber('life', 40));
  expect(result.current.pristine).toBe(true);

  act(() => result.current.setOpponents([{ life: 10 }]));
  act(() => result.current.setChoice('mode', 'b'));
  const before = result.current.resets;
  act(() => result.current.reset());
  expect(result.current.pristine).toBe(true);
  expect(result.current.values.opponents).toEqual([{ life: 40 }, { life: 40 }, { life: 40 }]);
  expect(result.current.values.choices.mode).toBe('a');
  expect(result.current.result.headline.value).toBe('-40');
  expect(result.current.resets).toBe(before + 1);
});
