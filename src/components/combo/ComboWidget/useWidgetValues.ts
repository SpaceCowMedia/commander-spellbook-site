import { useDeferredValue, useMemo, useState } from 'react';
import type { Calculator, Values } from 'lib/combo/widgets/shared/calculator';
import { sameValues, valuesFor } from 'lib/combo/widgets/shared/values';

/* What the inputs say and what the calculator answers, for one calculator for the life of the
   component. The answer may trail the inputs by a render while typing outruns the math. */
export default function useWidgetValues(calculator: Calculator) {
  const initial = useMemo(() => valuesFor(calculator), [calculator]);
  const [values, setValues] = useState(initial);
  const [resets, setResets] = useState(0);
  const settled = useDeferredValue(values);
  const result = useMemo(() => calculator.compute(settled), [calculator, settled]);
  return {
    values,
    result,
    pristine: sameValues(values, initial),
    /* how many times the inputs went back to where they started: a key for what keeps a state of its
       own about them */
    resets,
    setNumber: (key: string, value: number) =>
      setValues((current) => ({ ...current, numbers: { ...current.numbers, [key]: value } })),
    setChoice: (key: string, value: string) =>
      setValues((current) => ({ ...current, choices: { ...current.choices, [key]: value } })),
    setOpponents: (opponents: Values['opponents']) => setValues((current) => ({ ...current, opponents })),
    reset: () => {
      setValues(initial);
      setResets((count) => count + 1);
    },
  };
}
