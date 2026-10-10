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

  test('stays sane at the extremes', () => {
    expectSaneAtExtremes(calculatorFor(drainLoop, '328-3260-4078-6798'));
    expectSaneAtExtremes(calculatorFor(drainLoop, '1698-3260-3540-7753'));
  });
});
