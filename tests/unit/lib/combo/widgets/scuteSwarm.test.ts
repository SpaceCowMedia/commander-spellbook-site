import { expect, test } from 'vitest';
import type { DotChart } from 'lib/combo/widgets/shared/calculator';
import { Board, lastLand, scuteSwarm } from 'lib/combo/widgets/scuteSwarm';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

/* Land by land, as the reference */
function byHand({ scutes, others, lands, library }: Board) {
  let s = scutes;
  let o = others;
  let loops = 0;
  for (let n = 0; n < library && s + o > 0; n++) {
    if (o > 0) {
      o--;
    } else {
      s--;
    }
    if (lands + n + 1 >= 6) {
      s *= 2;
    } else {
      o += s;
    }
    loops++;
  }
  return { scutes: s, others: o, loops };
}

test('fetches every land like one by one', () => {
  for (let scutes = 1; scutes <= 4; scutes++) {
    for (let others = 0; others <= 3; others++) {
      for (let lands = 0; lands <= 7; lands++) {
        for (let library = 0; library <= 30; library++) {
          const board = { scutes, others, lands, library };
          const last = lastLand(board);
          const reference = byHand(board);
          const name = JSON.stringify(board);
          expect(last.loops, name).toBe(reference.loops);
          expect(last.others, name).toBe(reference.others);
          expect(Number.isFinite(last.log10) ? Math.round(10 ** last.log10) : 0, name).toBe(reference.scutes);
        }
      }
    }
  }
});

test('holds at two Scute Swarms with nothing else to sacrifice, and doubles with more', () => {
  const calculator = calculatorFor(scuteSwarm, '654-880-2907');
  expect(run(calculator).headline).toEqual({ label: 'Scute Swarms', value: '2', caption: 'after 15 lands' });
  expect(run(calculator, { numbers: { scutes: 3 } }).headline.value).toBe('65,538');
  expect(run(calculator, { numbers: { others: 4 } }).headline.value).toBe('28,674');
});

test('charts the creatures step by step: one sacrificed for each land, more as the land comes in', () => {
  const chart = run(calculatorFor(scuteSwarm, '654-880-2907'), { numbers: { lands: 3 } }).charts![0] as DotChart;
  expect(chart.dots.map((dot) => dot.y).slice(0, 9)).toEqual([2, 1, 2, 1, 2, 1, 2, 1, 2]);
  expect(chart.dots.slice(1, 3).map((dot) => dot.label)).toEqual([
    'Sacrifice another creature for a land: 1 Scute Swarm and 0 other creatures',
    'Land 4: each Scute Swarm makes an Insect, 1 Scute Swarm and 1 other creature',
  ]);
  expect(chart.dots[6].label).toBe('Land 6: each Scute Swarm copies itself, 2 Scute Swarms and 0 other creatures');
});

test('fetches a billion lands in a blink', () => {
  const begin = performance.now();
  const result = run(calculatorFor(scuteSwarm, '654-880-2907'), {
    numbers: { scutes: 3, others: 1_000_000_000, library: 1_000_000_000 },
  });
  expect(performance.now() - begin).toBeLessThan(20);
  expect(result.headline.value).toMatch(/× 10\^301,029,99\d$/);
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(scuteSwarm, '654-880-2907'));
});
