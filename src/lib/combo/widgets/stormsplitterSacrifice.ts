import { ManaCost, addMana, isFree, manaValue, parseMana } from 'lib/symbols/mana';
import { defineWidget } from './shared/widget';
import { usesAny } from './parse/variant';
import { NO_MANA, STORMSPLITTERS, Start, buybackCost, payWith, stormsplitterCalculator } from './stormsplitter';

/* Sacrificing copies pays for a cast but leaves fewer to double. With twice the cost in
   Stormsplitters the loop pays for itself; below that, the least of your own mana is found cast by
   cast, from the most Stormsplitters down, since each cast leaves more than it started with. The
   loop is free from the fewest Stormsplitters that keep it free all the way up. */
export function sacrificeStarts(cost: ManaCost) {
  const total = manaValue(cost);
  const best: Start[] = [];
  const from = (count: number): Start => (count >= 2 * total ? { mana: NO_MANA, casts: 0 } : best[count]);
  for (let count = 2 * total - 1; count >= 1; count--) {
    for (let sacrificed = 0; sacrificed <= total && 2 * (count - sacrificed) > count; sacrificed++) {
      const { own } = payWith(cost, sacrificed, 0);
      const rest = from(2 * (count - sacrificed));
      const mana = addMana(own, rest.mana);
      if (!best[count] || manaValue(mana) < manaValue(best[count].mana)) {
        best[count] = { mana, casts: rest.casts + (manaValue(own) > 0 ? 1 : 0) };
      }
    }
  }
  let steadyFrom = Math.max(STORMSPLITTERS.min, 2 * total);
  while (steadyFrom > STORMSPLITTERS.min && isFree(from(steadyFrom - 1).mana)) {
    steadyFrom--;
  }
  return { start: from, steadyFrom };
}

export const stormsplitterSacrifice = defineWidget('stormsplitter-sacrifice', {
  detect(variant) {
    const cost = usesAny(variant, ['Phyrexian Altar', 'Thermopod']) && buybackCost(variant);
    return cost && { cost };
  },
  calculator({ cost }) {
    const each = parseMana(cost)!;
    const { start, steadyFrom } = sacrificeStarts(each);
    return stormsplitterCalculator({
      title: 'How much mana until the Stormsplitters pay for themselves?',
      summary: `Each cast of the buyback spell doubles your Stormsplitters, and each copy you sacrifice makes one mana. From ${2 * manaValue(each)} Stormsplitters on, sacrificing enough for the next cast still leaves more than before.`,
      inputs: [STORMSPLITTERS],
      cost,
      start: (numbers) => start(numbers.stormsplitters),
      steadyFrom: () => steadyFrom,
    });
  },
});
