import { numberInput } from './shared/inputs';
import { paybackCalculator } from './shared/payback';
import { defineWidget } from './shared/widget';
import { has, shortName, usesAny } from './parse/variant';

/* What each copy of Bag End Banquet costs */
const COPIERS: Record<string, string> = { 'Urza, Prince of Kroog': '{6}', 'Cogwork Assembler': '{7}' };

/* Each copy of Bag End Banquet makes three Foods, then taps for {C} for every Food you control. */
export const bagEndBanquet = defineWidget('bag-end-banquet', {
  detect(variant) {
    const copier = has(variant, 'Bag End Banquet') ? usesAny(variant, Object.keys(COPIERS)) : undefined;
    return copier && { copier: shortName(copier), cost: COPIERS[copier] };
  },
  calculator: ({ copier, cost }) =>
    paybackCalculator(
      { costs: [cost], rate: 1, base: 0, made: 3, refunds: 1, bonus: 0, colorRate: Infinity, stacks: false },
      {
        category: 'board',
        title: 'How much mana until the Foods pay for the copies?',
        summary: `${copier} copies Bag End Banquet for ${cost}. The copy makes three Foods and taps for {C} for each Food you control, so each copy makes three more mana than the one before.`,
        counted: numberInput('foods', 'Foods you control', 0),
        refunded: 'The copy taps for',
      },
    ),
});
