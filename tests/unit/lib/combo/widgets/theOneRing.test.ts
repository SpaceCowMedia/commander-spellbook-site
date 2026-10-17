import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { activationsFor, theOneRing } from 'lib/combo/widgets/theOneRing';
import { calculatorFor, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

test('draws the library in the fewest activations, like one by one', () => {
  for (let burden = 0; burden < 6; burden++) {
    for (let library = 0; library < 120; library++) {
      let drawn = 0;
      let n = 0;
      while (drawn < library) {
        n++;
        drawn += burden + n;
      }
      expect(activationsFor(burden, library), `${burden} counters, ${library} cards`).toBe(n);
    }
  }
});

test('reads how The One Ring untaps and who holds its burden counters', () => {
  expect(specFor(theOneRing, '3363-4067')).toMatchObject({ discards: 1, holder: 'The One Ring', burden: 0 });
  expect(specFor(theOneRing, '1742-1978-3363-3488')).toMatchObject({ discards: 2, burden: 1 });
  expect(specFor(theOneRing, '132-1742-1978-3363')).toMatchObject({ holder: 'Myr Welder' });
});

test('counts the activations to draw your library and the life the burden counters cost', () => {
  const result = run(calculatorFor(theOneRing, '1742-1978-3363-3488'));
  expect(result.headline).toEqual({ label: 'Activations to draw your library', value: '10' });
  expect(result.stats?.[0]).toEqual({
    label: 'Burden counters by then',
    value: '11',
    caption: 'the life you lose each upkeep',
  });
  expect(run(calculatorFor(theOneRing, '132-1742-1978-3363')).stats?.[0].caption).toBeUndefined();
});

test('charts your hand step by step: up as the Ring draws, down as each untap discards', () => {
  const chart = run(calculatorFor(theOneRing, '1742-1978-3363-3488')).charts![0] as DotChart;
  expect(chart.dots.map((dot) => dot.y).slice(0, 7)).toEqual([0, 2, 0, 3, 1, 5, 3]);
  expect(chart.dots.slice(1, 5).map((dot) => dot.label)).toEqual([
    'Tap The One Ring with 2 burden counters, draw 2: +2 cards',
    'Discard 2 to untap it: 0 cards',
    'Tap The One Ring with 3 burden counters, draw 3: +3 cards',
    'Discard 2 to untap it: +1 card',
  ]);
  const short = run(calculatorFor(theOneRing, '3363-4067'), { numbers: { library: 5 } }).charts![0] as DotChart;
  expect(short.dots.map((dot) => dot.y)).toEqual([0, 1, 0, 2, 1, 3]);
  expect(short.after).toBeUndefined();
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(theOneRing, '3363-4067'));
  expectSaneAtExtremes(calculatorFor(theOneRing, '1742-1978-3363-3488'));
});
