import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { cycleByCycle, nadier, nadierMana } from 'lib/combo/widgets/nadier';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

/* Cycle by cycle, as the reference: exile Nadier for 7, recast it for 6 plus tax, exile its Elves */
function reference(casts: number, power: number): number {
  let pool = 0;
  let least = 0;
  let tax = 2 * casts;
  let elves = power;
  for (let cycle = 0; cycle < 200; cycle++) {
    pool += 7 - 6 - tax;
    least = Math.max(least, -pool);
    pool += elves;
    elves = 3 + elves;
    tax += 2;
  }
  return least;
}

test('peaks once and then pays for itself, like cycle by cycle', () => {
  expect(nadierMana(1, 3)).toBe(1);
  expect(nadierMana(2, 3)).toBe(6);
  for (let casts = 0; casts < 12; casts++) {
    for (let power = 0; power < 12; power++) {
      expect(nadierMana(casts, power), `${casts} casts, ${power} power`).toBe(reference(casts, power));
    }
  }
});

test('charts the mana step by step: up for Nadier, down to recast it, up for its Elves', () => {
  const { dots, after } = cycleByCycle(1, 3);
  expect(dots.map((dot) => dot.y)).toEqual([1, 8, 0, 3, 10, 0, 6, 13, 1, 10, 17, 3, 15, 22, 6, 21]);
  expect(dots.slice(0, 4).map((dot) => dot.label)).toEqual([
    'To start: {1}',
    'Exile Nadier with Food Chain: {8}',
    'Recast it for {8}: {0} left',
    'Exile its 3 Elves: {3}',
  ]);
  expect(after).toEqual({ x: 16, y: 28 });
  const chart = run(calculatorFor(nadier, '3035-3519')).charts![1] as DotChart;
  expect(chart).toMatchObject({ kind: 'dots', title: 'Your mana, step by step', xLabel: 'Step' });
  expect(chart.dots).toEqual(dots);
});

test('the mana to start is all spent at the worst step and never short', () => {
  for (let casts = 0; casts < 12; casts++) {
    for (let power = 0; power < 12; power++) {
      const lowest = Math.min(...cycleByCycle(casts, power, 40).dots.map((dot) => dot.y));
      expect(lowest, `${casts} casts, ${power} power`).toBeGreaterThanOrEqual(0);
      if (nadierMana(casts, power) > 0) {
        expect(lowest, `${casts} casts, ${power} power`).toBe(0);
      }
    }
  }
});

test('starts from the first recast', () => {
  const calculator = calculatorFor(nadier, '3035-3519');
  expect(run(calculator).headline.value).toBe('{1}');
  expect(run(calculator, { numbers: { casts: 3 } }).headline.value).toBe('{15}');
  expectSaneAtExtremes(calculator);
});
