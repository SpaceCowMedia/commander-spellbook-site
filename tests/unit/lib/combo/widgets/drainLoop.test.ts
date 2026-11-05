import { describe, expect, test } from 'vitest';
import { drainLoop } from 'lib/combo/widgets/drainLoop';
import { calculatorFor, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

describe('drainLoop', () => {
  test('reads Gray Merchant loops with devotion and extort loops with their creatures', () => {
    expect(specFor(drainLoop, '328-3260-4078-6798').loop).toContainEqual({ kind: 'drain', perOpponent: 'devotion' });
    const extort = calculatorFor(drainLoop, '1698-3260-3540-7753');
    expect(extort.inputs.map((input) => input.key)).toEqual(['life', 'extorters']);
  });

  test('plays the table out, opponent by opponent', () => {
    const calculator = calculatorFor(drainLoop, '328-3260-4078-6798');
    const result = run(calculator, { numbers: { life: 40, devotion: 9 }, opponents: [20, 30, 40] });
    expect(result.verdict).toMatchObject({ tone: 'good', title: 'Every opponent dies in loop 5' });
    expect(result.outcomes?.map((outcome) => outcome.text)).toEqual([
      'Dies in loop 3',
      'Dies in loop 4',
      'Dies in loop 5',
    ]);
    expect(result.headline.label).toBe('Life needed to kill the table');
  });

  test('says when your life runs out first', () => {
    const result = run(calculatorFor(drainLoop, '328-3260-4078-6798'), {
      numbers: { life: 12, devotion: 1 },
      opponents: [40, 40, 40],
    });
    expect(result.verdict).toMatchObject({ tone: 'bad', title: 'You run out of life after 1 loop' });
  });

  test('drains a billion life from seven opponents in a blink', () => {
    const begin = performance.now();
    const result = run(calculatorFor(drainLoop, '328-3260-4078-6798'), {
      numbers: { life: 1_000_000_000, devotion: 2 },
      opponents: Array.from({ length: 7 }, () => 1_000_000_000),
    });
    expect(performance.now() - begin).toBeLessThan(20);
    expect(result.verdict?.title).toBe('Every opponent dies in loop 500,000,000');
  });

  test('reads drains worded as an amount of life equal to your devotion', () => {
    expect(specFor(drainLoop, '122-328-2732-8095').loop).toEqual([
      { kind: 'drain', perOpponent: 'devotion' },
      { kind: 'pay', life: 4 },
    ]);
  });

  test('charts your life step by step through the run, up for each drain and down for each payment', () => {
    const result = run(calculatorFor(drainLoop, '122-328-2732-8095'), {
      numbers: { life: 40, devotion: 5 },
      opponents: [40, 40, 40],
    });
    expect(result.verdict).toMatchObject({ title: 'Every opponent dies in loop 8' });
    const [chart, ...rest] = result.charts!;
    expect(chart).toMatchObject({ title: 'Your life, step by step', page: 0 });
    expect(chart.dots.slice(0, 4).map((dot) => dot.y)).toEqual([40, 55, 51, 66]);
    expect(chart.dots[1].label).toBe('Loop 1, drain 15 life: 55 life');
    expect(chart.dots.at(-1)).toMatchObject({ x: 16, y: 128 });
    expect(chart.after).toBeUndefined();
    expect(rest).toEqual([]);
  });

  test('turns the steps page by page, and adds a chart loop by loop when the run is longer than a page', () => {
    const calculator = calculatorFor(drainLoop, '328-3260-4078-6798');
    const overrides = { numbers: { life: 40, devotion: 3 }, opponents: [40, 40, 40] };
    const result = run(calculator, overrides);
    expect(result.verdict).toMatchObject({ title: 'Every opponent dies in loop 14' });
    expect(result.charts?.map((chart) => chart.title)).toEqual(['Your life, step by step', 'Your life, loop by loop']);
    expect(result.charts![0].after).toEqual({ x: 25, y: 31 });
    const next = run(calculator, { ...overrides, page: 1 }).charts![0];
    expect(next.dots.map((dot) => [dot.x, dot.y])).toEqual([
      [25, 31],
      [26, 40],
      [27, 31],
      [28, 40],
    ]);
    expect(next.before).toEqual({ x: 24, y: 40 });
    expect(next.after).toBeUndefined();
    expect(run(calculator, { ...overrides, page: 5 }).charts![0].page).toBe(1);
  });

  test('stops the steps at the payment you cannot make', () => {
    const result = run(calculatorFor(drainLoop, '328-3260-4078-6798'), {
      numbers: { life: 12, devotion: 1 },
      opponents: [40, 40, 40],
    });
    const chart = result.charts![0];
    expect(chart.dots.at(-1)).toMatchObject({ y: -3, tone: 'bad', label: 'Loop 2, pay 9 life: -3 life' });
    expect(chart.after).toBeUndefined();
  });

  test('stays sane at the extremes', () => {
    expectSaneAtExtremes(calculatorFor(drainLoop, '328-3260-4078-6798'));
    expectSaneAtExtremes(calculatorFor(drainLoop, '1698-3260-3540-7753'));
    expectSaneAtExtremes(calculatorFor(drainLoop, '122-328-2732-8095'));
  });
});
