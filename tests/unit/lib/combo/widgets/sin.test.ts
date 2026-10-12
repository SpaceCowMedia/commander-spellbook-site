import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { countersNeeded, sin } from 'lib/combo/widgets/sin';
import { calculatorFor, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

/* Loop by loop, as the reference: whether your mana keeps paying for Sin, {5}{G}{U} plus tax, and
   for untapping Kami, with Kami and Phyrexian Altar making it back */
function lasts(counters: number, casts: number, untap: number): boolean {
  let c = counters;
  let mana = 7 + 2 * casts + untap;
  for (let n = 0; n < 40; n++) {
    const cost = 7 + 2 * (casts + n) + untap;
    if (mana < cost) {
      return false;
    }
    mana += 1 + 2 * c + 3 - cost;
    c = 2 * c + 2;
  }
  return true;
}

test('needs the counters that pay for the first recast, after which they double', () => {
  for (const untap of [0, 1]) {
    for (let casts = 0; casts < 8; casts++) {
      for (let counters = 0; counters < 20; counters++) {
        expect(lasts(counters, casts, untap), `${counters} counters, ${casts} casts, ${untap} to untap`).toBe(
          counters >= countersNeeded(casts, untap),
        );
      }
    }
  }
});

test('reads how Kami of Whispered Hopes is untapped and the counters the combo asks for', () => {
  expect(specFor(sin, '81-1636-4050-6730')).toEqual({ widget: 'sin', untap: 0, stated: 3 });
  expect(specFor(sin, '81-725-4050-6730')).toEqual({ widget: 'sin', untap: 1, stated: 4 });
  expect(run(calculatorFor(sin, '81-1636-4050-6730')).headline).toEqual({
    label: 'Counters needed',
    value: '3',
    caption: 'with {0} commander tax',
  });
  expect(run(calculatorFor(sin, '81-725-4050-6730'), { numbers: { counters: 2 } }).verdict).toMatchObject({
    tone: 'bad',
    title: 'The loop stops in loop 2',
  });
});

test('charts your mana step by step: down to cast Sin, up as it dies and Kami taps', () => {
  const chart = run(calculatorFor(sin, '81-725-4050-6730')).charts![0] as DotChart;
  expect(chart.dots.map((dot) => dot.y).slice(0, 9)).toEqual([8, 1, 0, 1, 12, 3, 2, 3, 26]);
  expect(chart.dots.slice(1, 5).map((dot) => dot.label)).toEqual([
    'Cast Sin for {5}{G}{U}, it enters with 9 counters: {1} left',
    'Untap Kami of Whispered Hopes for {1}: {0} left',
    'Sacrifice Sin to Phyrexian Altar: {1}',
    'Kami taps for 11: {12}',
  ]);
  const short = run(calculatorFor(sin, '81-725-4050-6730'), { numbers: { counters: 2 } }).charts![0] as DotChart;
  expect(short.dots.at(-1)).toMatchObject({ tone: 'bad' });
  expect(short.after).toBeUndefined();
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(sin, '81-1636-4050-6730'));
  expectSaneAtExtremes(calculatorFor(sin, '81-725-4050-6730'));
});
