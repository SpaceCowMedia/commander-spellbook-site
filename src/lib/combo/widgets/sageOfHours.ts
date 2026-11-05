import { LIBRARY, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';
import { extraTurnsCalculator } from './scepterTurns';

export const sageOfHours = defineWidget('sage-of-hours', {
  detect: (variant) => has(variant, 'Sin, Unending Cataclysm', 'Body of Research', 'Sage of Hours') && {},
  calculator: () =>
    extraTurnsCalculator(
      'Body of Research puts a counter on the Fractal for each card in your library. Sin takes every counter on your artifacts, creatures and enchantments and enters with twice as many, which go to Sage of Hours when it dies: every five are an extra turn.',
      [LIBRARY, numberInput('counters', 'Counters on your other artifacts, creatures and enchantments', 0)],
      (values) => Math.floor((2 * (values.numbers.library + values.numbers.counters)) / 5),
    ),
});
