import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { empoweredAutogenerator, manaToStart } from 'lib/combo/widgets/empoweredAutogenerator';
import { calculatorFor, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

/* Tap by tap, as the reference: the most your mana falls short of paying each loop */
function byHand(cost: number, counters: number): number {
  let mana = 0;
  let lowest = 0;
  for (let k = counters + 1; k <= counters + cost + 2; k++) {
    mana += k - cost;
    lowest = Math.min(lowest, mana);
  }
  return 0 - lowest;
}

test('makes up for the taps that make less than a loop costs, one less each loop', () => {
  for (let cost = 1; cost < 10; cost++) {
    for (let counters = 0; counters < 12; counters++) {
      expect(manaToStart(cost, counters), `{${cost}} with ${counters} counters`).toBe(byHand(cost, counters));
    }
  }
});

test('adds up what the repeated steps pay to untap the card with the ability', () => {
  expect(specFor(empoweredAutogenerator, '198-4067-5801-6571')).toEqual({
    widget: 'empowered-autogenerator',
    cost: '{2}{B}{B}{B}',
    holder: 'Empowered Autogenerator',
  });
  expect(specFor(empoweredAutogenerator, '198-3750-3918')).toMatchObject({ cost: '{3}{R}{R}', holder: 'Trazyn' });
  expect(specFor(empoweredAutogenerator, '132-198-5090')).toMatchObject({ cost: '{6}', holder: 'Myr Welder' });
  expect(specFor(empoweredAutogenerator, '198-3911-4331')).toMatchObject({ cost: '{6}{U}' });
  expect(specFor(empoweredAutogenerator, '198-1978-3301')).toMatchObject({ cost: '{2}' });
});

test('starts the Mind Peel loop for {10} from no charge counters', () => {
  const result = run(calculatorFor(empoweredAutogenerator, '198-4067-5801-6571'));
  expect(result.headline).toEqual({ label: 'Mana to start', value: '{10}', mana: { generic: 10, pips: {} } });
  expect(result.stats?.[1]).toEqual({ label: 'Loops before it pays for itself', value: '4' });
  expectSteadyFrom(calculatorFor(empoweredAutogenerator, '198-4067-5801-6571'), 'counters', 4);
});

test('charts your mana step by step: up a little more with each tap, down for each untap', () => {
  const chart = run(calculatorFor(empoweredAutogenerator, '198-4067-5801-6571')).charts![1] as DotChart;
  expect(chart.dots.map((dot) => dot.y).slice(0, 9)).toEqual([10, 11, 6, 8, 3, 6, 1, 5, 0]);
  expect(chart.dots.slice(1, 3).map((dot) => dot.label)).toEqual([
    'Tap Empowered Autogenerator with 1 charge counter: {11}',
    'Pay {2}{B}{B}{B}: {6} left',
  ]);
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(empoweredAutogenerator, '198-4067-5801-6571'));
  expectSaneAtExtremes(calculatorFor(empoweredAutogenerator, '132-198-5090'));
});
