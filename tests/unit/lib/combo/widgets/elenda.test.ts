import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { elenda, powerNeeded, stopsIn } from 'lib/combo/widgets/elenda';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

/* Loop by loop, as the reference: three Vampires per power, {2}{W}{B} plus tax less Elenda's {W} paid
   with Vampires, the rest growing the new Elenda; the loop that can't pay, if one comes */
function byHand(power: number, casts: number, loops: number): number | undefined {
  let p = power;
  for (let n = 1; n <= loops; n++) {
    const vampires = 3 * p;
    const recast = 3 + 2 * (casts + n - 1);
    if (vampires < recast) {
      return n;
    }
    p = 1 + vampires - recast;
  }
  return undefined;
}

test('grows forever from two power more than the casts so far, as the prerequisites say', () => {
  for (let casts = 0; casts < 10; casts++) {
    for (let power = 1; power < 25; power++) {
      expect(stopsIn(power, casts), `${power} power, ${casts} casts`).toBe(byHand(power, casts, 60));
      expect(stopsIn(power, casts) === undefined).toBe(power >= powerNeeded(casts));
    }
  }
});

test('says whether the loop grows, from the power needed after the casts so far', () => {
  const calculator = calculatorFor(elenda, '1270-2876-4050');
  expect(run(calculator).headline).toEqual({ label: 'Power needed', value: '3', caption: 'with {2} commander tax' });
  expect(run(calculator).verdict).toMatchObject({ tone: 'good', title: 'The loop grows every time' });
  expect(run(calculator, { numbers: { power: 2, casts: 1 } }).verdict).toEqual({
    tone: 'bad',
    title: 'The loop stops in loop 2',
  });
  expect(run(calculator).meter).toEqual({ have: 3, need: 3, unit: 'power' });
});

test('charts the Vampires step by step: up as Elenda dies, down to recast it and grow it', () => {
  const chart = run(calculatorFor(elenda, '1270-2876-4050')).charts![0] as DotChart;
  expect(chart.dots.map((dot) => dot.y)).toEqual([0, 9, 4, 0, 15, 8, 0, 27, 18, 0, 57, 46, 0]);
  expect(chart.dots.slice(1, 4).map((dot) => dot.label)).toEqual([
    'Sacrifice Elenda: 9 Vampires',
    'Sacrifice 5 to recast Elenda for {4}{W}{B}: 4 Vampires',
    'Sacrifice the rest, Elenda grows to 5 power',
  ]);
  expect(chart.after).toEqual({ x: 13, y: 141 });
  const short = run(calculatorFor(elenda, '1270-2876-4050'), { numbers: { power: 1, casts: 1 } })
    .charts![0] as DotChart;
  expect(short.dots.at(-1)).toMatchObject({
    y: 3,
    tone: 'bad',
    label: 'Sacrifice Elenda: 3 Vampires, too few to recast it',
  });
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(elenda, '1270-2876-4050'));
});
