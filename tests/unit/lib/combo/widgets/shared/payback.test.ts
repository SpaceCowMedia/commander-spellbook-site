import { describe, expect, test } from 'vitest';
import { formatMana, manaValue, parseMana } from 'lib/symbols/mana';
import { numberInput } from 'lib/combo/widgets/shared/inputs';
import { Payback, startFor, steadyFrom } from 'lib/combo/widgets/shared/payback';

const loop = (overrides: Partial<Payback>): Payback => ({
  costs: ['{5}'],
  rate: 1,
  base: 0,
  made: 1,
  bonus: 0,
  colorRate: 2,
  stacks: true,
  ...overrides,
});

/* Every order of activations and refunds, with mana of one kind, as the reference: the least mana
   from which some order reaches a pool that pays for the next activation, which pays for itself. */
function leastByEveryOrder({ costs, rate, base, made, bonus, stacks }: Payback, counted: number): number {
  const generic = costs.map((cost) => parseMana(cost)!.generic);
  const reaches = (start: number) => {
    const seen = new Set<string>();
    const search = (pool: number, activations: number, creatures: number, pending: number): boolean => {
      const key = `${pool},${activations},${creatures},${pending}`;
      if (seen.has(key) || activations > 40) {
        return false;
      }
      seen.add(key);
      const next = Math.min(activations, generic.length - 1);
      const dearest = Math.max(...generic.slice(next));
      if (bonus + made * rate * (base + counted + creatures + made) >= dearest && pool >= dearest) {
        return true;
      }
      const cost = generic[next];
      if (pool >= cost) {
        const after = creatures + made;
        const back = stacks ? bonus : bonus + made * rate * (base + counted + after);
        if (search(pool - cost + back, activations + 1, after, stacks ? pending + made : 0)) {
          return true;
        }
      }
      return pending > 0 && search(pool + rate * (base + counted + creatures), activations, creatures, pending - 1);
    };
    return search(start, 0, 0, 0);
  };
  let least = 0;
  while (!reaches(least)) {
    least++;
  }
  return least;
}

describe('the least mana to start a loop that pays back more and more', () => {
  test('matches every order of activations and refunds', () => {
    for (const costs of [['{2}'], ['{4}'], ['{5}'], ['{7}'], ['{2}', '{5}'], ['{2}', '{5}', '{6}']]) {
      for (const stacks of [true, false]) {
        for (const made of [1, 2]) {
          for (const counted of [0, 1, 3]) {
            const shape = loop({ costs, stacks, made, bonus: made === 2 ? 1 : 0 });
            expect(manaValue(startFor(shape, counted)!.mana), `${costs} ${stacks} ${made} ${counted}`).toBe(
              leastByEveryOrder(shape, counted),
            );
          }
        }
      }
    }
    const synthesizers = loop({ costs: ['{6}'], rate: 2, base: -1, stacks: false });
    for (const counted of [1, 2, 3]) {
      expect(manaValue(startFor(synthesizers, counted)!.mana)).toBe(leastByEveryOrder(synthesizers, counted));
    }
  });

  test('stacks Fire Nation Archers activations for one mana less than one at a time', () => {
    const archers = loop({ costs: ['{5}'] });
    expect([0, 1, 2, 3, 4].map((soldiers) => manaValue(startFor(archers, soldiers)!.mana))).toEqual([13, 10, 8, 6, 5]);
    expect(manaValue(startFor({ ...archers, stacks: false }, 0)!.mana)).toBe(15);
    expect(startFor(archers, 0)!.activations).toBe(4);
  });

  test('pays for Simulacrum Synthesizer copies until there are three', () => {
    const urza = loop({ costs: ['{6}'], rate: 2, base: -1, stacks: false, colorRate: Infinity });
    expect(manaValue(startFor(urza, 1)!.mana)).toBe(12);
    expect(manaValue(startFor(urza, 3)!.mana)).toBe(6);
  });

  test('turns refunds into colored mana two for one, unless any mana will do', () => {
    const saheeli = loop({ costs: ['{U}{R}'], base: 2 });
    expect(formatMana(startFor(saheeli, 0)!.mana)).toBe('{U}{R}{R}');
    expect(formatMana(startFor(saheeli, 1)!.mana)).toBe('{U}{R}');
    expect(formatMana(startFor({ ...saheeli, colorRate: 1 }, 0)!.mana)).toBe('{2}');
  });

  test('adds a cost every activation pays, and gives up when no refund ever covers one', () => {
    const slivers = loop({ costs: ['{3}'], base: 1, stacks: false, colorRate: 1 });
    expect(manaValue(startFor(slivers, 2, 1)!.mana)).toBe(4);
    expect(manaValue(startFor(slivers, 2, 2)!.mana)).toBeGreaterThan(5);
    expect(startFor(loop({ costs: ['{R}'], colorRate: Infinity }), 0)).toBeUndefined();
  });

  test('stays instant with a billion creatures', () => {
    expect(formatMana(startFor(loop({}), 1e9)!.mana)).toBe('{5}');
  });
});

test('settles at the count from which the start no longer changes', () => {
  const counted = numberInput('others', 'Others', 0);
  const answer = (shape: Payback, count: number, extra: number) => {
    const start = startFor(shape, count, extra);
    return start && `${formatMana(start.mana)} ${start.activations}`;
  };
  for (const costs of [['{2}'], ['{5}'], ['{2}', '{5}'], ['{U}{R}'], ['{2}', '{5}', '{6}']]) {
    for (const stacks of [true, false]) {
      for (const made of [1, 2]) {
        for (const extra of [0, 3]) {
          const shape = loop({ costs, stacks, made, bonus: made === 2 ? 1 : 0 });
          const steady = steadyFrom(shape, counted, extra)!;
          const settled = answer(shape, steady, extra);
          const name = `${costs} ${stacks} ${made} ${extra}`;
          for (let count = steady; count < steady + 30; count++) {
            expect(answer(shape, count, extra), name).toBe(settled);
          }
          if (steady > 0) {
            expect(answer(shape, steady - 1, extra), name).not.toBe(settled);
          }
        }
      }
    }
  }
  expect(steadyFrom(loop({ costs: ['{R}'], colorRate: Infinity }), counted)).toBeUndefined();
});
