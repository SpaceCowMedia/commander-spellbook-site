import { expect } from 'vitest';
import type { Calculator, DotChart, NumberInput, Result, Values } from 'lib/combo/widgets/shared/calculator';
import { valuesFor } from 'lib/combo/widgets/shared/values';
import type { SpecOf, Widget } from 'lib/combo/widgets/shared/widget';
import { FakeVariant, fakeVariant, fixtureVariant } from './fakeVariant';
import fixtures from './variants.json';

type FixtureId = keyof typeof fixtures;

/* The spec a widget reads from a real variant, failing the test when it doesn't recognize it. */
export function specFor<W extends Widget>(widget: W, id: FixtureId): SpecOf<W> {
  const params = widget.detect(fixtureVariant(id));
  expect(params, `${widget.id} should recognize ${id}`).toBeTruthy();
  return { ...params, widget: widget.id } as SpecOf<W>;
}

export function calculatorFor<W extends Widget>(widget: W, id: FixtureId): Calculator {
  return widget.calculator(specFor(widget, id));
}

export function detects(widget: Widget, variant: FakeVariant): boolean {
  return widget.detect(fakeVariant(variant)) !== undefined;
}

interface Overrides {
  numbers?: Record<string, number>;
  choices?: Record<string, string>;
  /* the opponents' life totals, or whole rows */
  opponents?: (number | Record<string, number>)[];
}

/* Computes with every input at its initial value except the ones given. */
export function run(calculator: Calculator, overrides: Overrides = {}): Result {
  const values = valuesFor(calculator);
  const blank = values.opponents[0] ?? {};
  const opponents = overrides.opponents?.map((row) =>
    typeof row === 'number' ? { ...blank, life: row } : { ...blank, ...row },
  );
  const merged: Values = {
    numbers: { ...values.numbers, ...overrides.numbers },
    choices: { ...values.choices, ...overrides.choices },
    opponents: opponents ?? values.opponents,
  };
  return calculator.compute(merged);
}

function expectSane(value: unknown, path: string): void {
  if (typeof value === 'number') {
    expect(Number.isFinite(value), `${path} is ${value}`).toBe(true);
  } else if (typeof value === 'string') {
    expect(value, path).not.toMatch(/NaN|undefined|∞/);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => expectSane(item, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => expectSane(item, `${path}.${key}`));
  }
}

/* Every input at its minimum, at its maximum (a billion for most) and at its default, and the
   answers stay numbers: no NaN, no ∞, nothing undefined, and no time to speak of. */
export function expectSaneAtExtremes(calculator: Calculator): void {
  const picks = {
    initial: (input: { initial: number }) => input.initial,
    min: (input: { min: number }) => input.min,
    max: (input: { max: number }) => input.max,
  };
  for (const [name, pick] of Object.entries(picks)) {
    const begin = performance.now();
    const result = calculator.compute(valuesFor(calculator, pick));
    expect(performance.now() - begin, `${name} took too long`).toBeLessThan(100);
    expectSane(result, name);
  }
}

/* The chart that picks `key` says the answer stops changing at `expected`, and it does: from there to a
   billion the answer is the same, just below it isn't, and with the input at its top the dots end on
   one that stands for every value from `expected` on. */
export function expectSteadyFrom(
  calculator: Calculator,
  key: string,
  expected: number | undefined,
  overrides: Overrides = {},
): void {
  const at = (x: number) => run(calculator, { ...overrides, numbers: { ...overrides.numbers, [key]: x } });
  const chartAt = (x: number) =>
    at(x).charts?.find((chart): chart is DotChart => chart.kind === 'dots' && chart.selects === key);
  const input = calculator.inputs.find((candidate) => candidate.key === key) as NumberInput;
  expect(chartAt(input.initial)?.steadyFrom).toBe(expected);
  if (expected === undefined) {
    return;
  }
  const answerAt = (x: number) => JSON.stringify({ ...at(x), charts: undefined });
  const settled = answerAt(expected);
  for (const x of [expected + 1, expected + 2, expected + 10, expected + 1000, input.max]) {
    expect(answerAt(Math.min(x, input.max)), `the answer at ${x}`).toBe(settled);
  }
  if (expected > input.min) {
    expect(answerAt(expected - 1), `the answer at ${expected - 1}`).not.toBe(settled);
  }
  const last = chartAt(input.max)!.dots.at(-1)!;
  expect(last.x).toBe(expected);
  expect(last.label).toContain('or more');
}
