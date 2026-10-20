import type { Calculator, NumberInput, Values } from './calculator';

export const DEFAULT_OPPONENTS = 3;

/* Values for every input of a calculator, each number picked from its input. */
export function valuesFor(
  calculator: Calculator,
  pick: (input: NumberInput) => number = (input) => input.initial,
  opponents = DEFAULT_OPPONENTS,
): Values {
  const numbers: Record<string, number> = {};
  const choices: Record<string, string> = {};
  for (const input of calculator.inputs) {
    if (input.kind === 'number') {
      numbers[input.key] = pick(input);
    } else {
      choices[input.key] = input.initial;
    }
  }
  const opponent = () =>
    Object.fromEntries((calculator.opponents?.fields ?? []).map((field) => [field.key, pick(field)]));
  return { numbers, choices, opponents: Array.from({ length: calculator.opponents ? opponents : 0 }, opponent) };
}

const sameEntries = <T>(a: Record<string, T>, b: Record<string, T>) =>
  Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((key) => a[key] === b[key]);

export function sameValues(a: Values, b: Values): boolean {
  return (
    sameEntries(a.numbers, b.numbers) &&
    sameEntries(a.choices, b.choices) &&
    a.opponents.length === b.opponents.length &&
    a.opponents.every((row, i) => sameEntries(row, b.opponents[i]))
  );
}
