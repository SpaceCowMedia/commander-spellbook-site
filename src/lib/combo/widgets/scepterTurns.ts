import type { Calculator, Input, Values } from './shared/calculator';
import { formatNumber } from './shared/format';
import { LIFE, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

/* Counters piled up somewhere, worth an extra turn for every few of them */
export function extraTurnsCalculator(summary: string, inputs: Input[], turns: (values: Values) => number): Calculator {
  return {
    category: 'finite',
    title: 'How many extra turns',
    summary,
    inputs,
    compute: (values) => ({ headline: { label: 'Extra turns', value: formatNumber(turns(values)) } }),
  };
}

export const scepterTurns = defineWidget('scepter-turns', {
  detect: (variant) => has(variant, 'Eternity Vessel', "Magistrate's Scepter") && {},
  calculator: () =>
    extraTurnsCalculator(
      "Eternity Vessel enters with charge counters equal to your life, they move to Magistrate's Scepter, and every three counters are an extra turn.",
      [LIFE, numberInput('counters', "Charge counters already on Magistrate's Scepter", 0)],
      (values) => Math.floor((values.numbers.life + values.numbers.counters) / 3),
    ),
});
