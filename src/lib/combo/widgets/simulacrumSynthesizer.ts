import { numberInput } from './shared/inputs';
import { paybackCalculator } from './shared/payback';
import { defineWidget } from './shared/widget';
import { has, usesAny } from './parse/variant';

/* Urza copies Simulacrum Synthesizer for {6}, every other Synthesizer makes a Construct, and the
   altar turns each Construct into {C}{C} */
const URZA = { costs: ['{6}'], rate: 2, base: -1, made: 1, bonus: 0, colorRate: Infinity, stacks: false };

export const simulacrumSynthesizer = defineWidget('simulacrum-synthesizer', {
  detect: (variant) =>
    has(variant, 'Urza, Prince of Kroog', 'Simulacrum Synthesizer') &&
    usesAny(variant, ['Krark-Clan Ironworks', "Ashnod's Altar"]) &&
    {},
  calculator: () =>
    paybackCalculator(URZA, {
      category: 'board',
      title: 'How much mana until the Synthesizers pay for Urza?',
      summary:
        'Each copy Urza makes costs {6}, and every other Simulacrum Synthesizer you control answers it with a Construct worth {C}{C}, so the loop pays for itself from three Synthesizers on.',
      counted: numberInput('synthesizers', 'Simulacrum Synthesizers you control', 1, { min: 1 }),
    }),
});
