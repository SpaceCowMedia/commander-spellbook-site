import { expect, test } from 'vitest';
import { formatMana } from 'lib/symbols/mana';
import { faceBreakerStart, siegebreakerFaceBreaker } from 'lib/combo/widgets/siegebreakerFaceBreaker';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

const EXTRA_COMBAT = 5;

/* combat by combat, paying whatever the Treasures at hand fall short of */
function manaCombatByCombat(opponents: number): { mana: number; combats: number } {
  let treasures = 0;
  let mana = 0;
  let combats = 0;
  for (let combat = 1; combat <= 20; combat++) {
    treasures += combat * opponents * opponents;
    const own = Math.max(0, EXTRA_COMBAT - treasures);
    mana += own;
    combats += own > 0 ? 1 : 0;
    treasures -= EXTRA_COMBAT - own;
  }
  return { mana, combats };
}

test("Mardu Siegebreaker's Face-Breaker copies pile up over the turn", () => {
  const calculator = calculatorFor(siegebreakerFaceBreaker, '2815-3750-6473');
  expect(run(calculator).headline.value).toBe('{0}');
  const alone = run(calculator, { numbers: { opponents: 1 } });
  expect(alone.headline.value).toBe('{10}');
  expect(alone.stats).toContainEqual({ label: 'Combats you pay for', value: '4' });
  expect(run(calculator, { numbers: { opponents: 2 } }).headline.value).toBe('{1}');
  expectSaneAtExtremes(calculator);
});

test('the mana to start matches paying combat by combat', () => {
  for (let opponents = 1; opponents <= 12; opponents++) {
    const { mana, combats } = faceBreakerStart(opponents);
    expect({ mana: formatMana(mana), combats }, `${opponents} opponents`).toEqual({
      mana: `{${manaCombatByCombat(opponents).mana}}`,
      combats: manaCombatByCombat(opponents).combats,
    });
  }
});

test('stops at the opponents from which the first combat pays for the next', () => {
  expectSteadyFrom(calculatorFor(siegebreakerFaceBreaker, '2815-3750-6473'), 'opponents', 3);
});
