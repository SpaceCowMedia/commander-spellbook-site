import { ManaCost, addMana, formatMana, isFree, manaValue, parseMana } from 'lib/symbols/mana';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { uses } from './parse/variant';
import { NO_MANA, STORMSPLITTERS, Start, buybackCost, payWith, stormsplitterCalculator } from './stormsplitter';

const MOST_CASTS = 64;

/* The copies enter untapped with haste and help pay for the next cast: tapped for mana with
   Sorcerer Class, where any creature makes the colors, or tapped to convoke Sprout Swarm, where only
   its green Saprolings pay the {G}. Stormsplitters double every cast, so this ends within a few. */
export function tappingStart(cost: ManaCost, stormsplitters: number, others: number, saprolings: boolean): Start {
  const total = manaValue(cost);
  let anyColor = saprolings ? 0 : stormsplitters + others;
  let genericOnly = saprolings ? stormsplitters + others : 0;
  let count = stormsplitters;
  let mana = NO_MANA;
  let casts = 0;
  for (let cast = 0; cast < MOST_CASTS; cast++) {
    const { own, anyUsed, genericUsed } = payWith(cost, anyColor, genericOnly);
    if (isFree(own) && count + (saprolings ? 1 : 0) >= total) {
      break;
    }
    mana = addMana(mana, own);
    casts += isFree(own) ? 0 : 1;
    anyColor += (saprolings ? 1 : count) - anyUsed;
    genericOnly += (saprolings ? count : 0) - genericUsed;
    count *= 2;
  }
  return { mana, casts };
}

/* With as many Stormsplitters as the cost's mana value, the first cast is paid for and the loop only
   waits on colors; the count the start settles at is found walking down from there. */
export function tappingSteadyFrom(cost: ManaCost, others: number, saprolings: boolean): number {
  const answer = (stormsplitters: number) => {
    const { mana, casts } = tappingStart(cost, stormsplitters, others, saprolings);
    return `${formatMana(mana)} ${casts}`;
  };
  const settled = Math.max(STORMSPLITTERS.min, manaValue(cost));
  const settledAnswer = answer(settled);
  let steady = settled;
  while (steady > STORMSPLITTERS.min && answer(steady - 1) === settledAnswer) {
    steady--;
  }
  return steady;
}

export const stormsplitterTapping = defineWidget('stormsplitter-tapping', {
  detect(variant) {
    const saprolings = uses(variant, 'Sprout Swarm');
    const cost = (saprolings || uses(variant, 'Sorcerer Class')) && buybackCost(variant);
    return cost && { cost, saprolings };
  },
  calculator({ cost, saprolings }) {
    const each = parseMana(cost)!;
    const others = numberInput(
      'others',
      saprolings ? 'Other untapped creatures' : 'Other untapped creatures without summoning sickness',
      0,
    );
    return stormsplitterCalculator({
      title: 'How much mana until the Stormsplitters pay for themselves?',
      summary: saprolings
        ? 'Each Sprout Swarm doubles your Stormsplitters, and their copies and the new Saproling enter untapped to convoke the next one, the Saprolings paying its {G}.'
        : 'Each cast of the buyback spell doubles your Stormsplitters, and with Sorcerer Class their copies, which have haste, tap for the next one.',
      inputs: [STORMSPLITTERS, others],
      cost,
      start: (numbers) => tappingStart(each, numbers.stormsplitters, numbers.others, saprolings),
      steadyFrom: (numbers) => tappingSteadyFrom(each, numbers.others, saprolings),
    });
  },
});
