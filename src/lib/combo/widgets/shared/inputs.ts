import type { ChoiceInput, NumberInput, Stat } from './calculator';

/* Every count, life total and amount of mana goes up to a billion: big enough for anything at a table,
   and every comparison with it stays exact. */
export const BIG = 1_000_000_000;
export const STARTING_LIFE = 40;

export function numberInput(
  key: string,
  label: string,
  initial: number,
  { min = 0, max = BIG, hint }: { min?: number; max?: number; hint?: string } = {},
): NumberInput {
  return { kind: 'number', key, label, min, max, initial, ...(hint && { hint }) };
}

export function choiceInput(key: string, label: string, options: [string, string][], initial?: string): ChoiceInput {
  return {
    kind: 'choice',
    key,
    label,
    options: options.map(([value, optionLabel]) => ({ value, label: optionLabel })),
    initial: initial ?? options[0][0],
  };
}

export const LIFE = numberInput('life', 'Your life total', STARTING_LIFE, { min: 1 });
export const OPPONENTS = numberInput('opponents', 'Opponents', 3, { min: 1 });
export const HIGHEST_LIFE = numberInput('highestLife', 'Highest life total among your opponents', STARTING_LIFE, {
  min: 1,
});
export const LIBRARY = numberInput('library', 'Cards in your library', 60);

export function castsInput(commander: string): NumberInput {
  return numberInput('casts', `Times ${commander} was cast from the command zone`, 0);
}

export const OPPONENT_LIFE = numberInput('life', 'Life', STARTING_LIFE, { min: 1 });
export const OPPONENT_LIBRARY = numberInput('library', 'Cards in library', 60);

export function commanderTaxStat(casts: number): Stat {
  const tax = 2 * casts;
  return { label: 'Commander tax', value: `{${tax}}`, mana: { generic: tax, pips: {} } };
}
