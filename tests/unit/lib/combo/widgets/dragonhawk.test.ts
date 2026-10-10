import { expect, test } from 'vitest';
import { dragonhawk, dragonhawkDamage } from 'lib/combo/widgets/dragonhawk';
import { calculatorFor, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

test('counts the creatures with power 4 or more among the combo pieces', () => {
  expect(specFor(dragonhawk, '1744-2719-6567')).toEqual({ widget: 'dragonhawk', strong: 6 });
  expect(specFor(dragonhawk, '2136-3604-6567')).toEqual({ widget: 'dragonhawk', strong: 7 });
  expect(specFor(dragonhawk, '2136-4836-6567')).toEqual({ widget: 'dragonhawk', strong: 7 });
});

test('deals 2 damage per card still exiled, as many cards as the library holds', () => {
  expect(dragonhawkDamage(6, 60, 0)).toEqual({ exiled: 30, damage: 60 });
  expect(dragonhawkDamage(7, 60, 5)).toEqual({ exiled: 35, damage: 60 });
  expect(dragonhawkDamage(7, 20, 0)).toEqual({ exiled: 20, damage: 40 });
  expect(dragonhawkDamage(6, 60, 99).damage).toBe(0);
});

test('answers with the damage each opponent takes', () => {
  const calculator = calculatorFor(dragonhawk, '1744-2719-6567');
  expect(calculator.opponents).toBeUndefined();
  expect(run(calculator, { numbers: { played: 5 } })).toEqual({
    headline: { label: 'Damage to each opponent', value: '50' },
    stats: [{ label: 'Cards exiled', value: '30' }],
  });
  expectSaneAtExtremes(calculator);
});
