import { describe, expect, test } from 'vitest';
import { NO_LOOP_INPUTS, stormMinimumLife } from 'lib/combo/widgets/shared/lifeLoop';
import { stormLifeLoop } from 'lib/combo/widgets/stormLifeLoop';
import { calculatorFor, detects, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';
import fixtures from './testing/variants.json';

/* Minimum life by spells already cast (0 to 5), from combo-widget-candidates.md */
const CANDIDATES: [keyof typeof fixtures, number[][]][] = [
  ['4740-6613-6614--44', [[7, 5, 4, 4, 4, 4]]],
  ['1414-4417-4740-6613', [[14, 10, 7, 5, 4, 4]]],
  ['2903-3260-4740', [[33, 26, 20, 15, 11, 8]]],
  ['2734-4740', [[50, 49, 48, 47, 46, 45]]],
  ['2438-2577-3260-4740', [[4, 3, 3, 3, 3, 3]]],
  ['411-4740-5313', [[7, 5, 4, 4, 4, 4]]],
  [
    '4050-4740-6742',
    [
      [2, 1, 1, 1, 1, 1],
      [4, 3, 3, 3, 3, 3],
    ],
  ],
  [
    '4740-5670-6742',
    [
      [4, 2, 1, 1, 1, 1],
      [6, 4, 3, 3, 3, 3],
    ],
  ],
  ['1560-2232-4740', [[4, 3, 3, 3, 3, 3]]],
  ['2034-3705-4740-5313', [[22, 17, 13, 10, 8, 7]]],
  ['1164-2173-4740-6123', [[16, 12, 9, 7, 6, 6]]],
  ['884-2232-3260-4740', [[8, 6, 5, 4, 3, 3]]],
  ['1594-3260-3540-4740', [[9, 6, 4, 3, 3, 3]]],
  ['3209-4740-7439', [[7, 4, 2, 1, 1, 1]]],
  ['4050-4740-7498-7541', [[7, 4, 2, 1, 1, 1]]],
  ['2173-4740-5078', [[2, 2, 2, 2, 2, 2]]],
];

describe('stormLifeLoop', () => {
  test.each(CANDIDATES)('reproduces the candidates table for %s', (id, rows) => {
    const spec = specFor(stormLifeLoop, id);
    rows.forEach((expected, choice) => {
      const needed = [0, 1, 2, 3, 4, 5].map((storm) => stormMinimumLife(spec, { ...NO_LOOP_INPUTS, storm, choice }));
      expect(needed).toEqual(expected);
    });
  });

  test('knows when Aetherflux Reservoir can fire', () => {
    const calculator = calculatorFor(stormLifeLoop, '2903-3260-4740');
    const enough = run(calculator, { numbers: { life: 40, storm: 0 } });
    expect(enough.headline).toMatchObject({ label: 'Minimum life to start', value: '33' });
    expect(enough.verdict).toMatchObject({ tone: 'good', title: 'You can go off' });
    expect(enough.verdict?.detail).toMatch(/^Aetherflux Reservoir can deal its first 50 damage after \d+ loops\.$/);
    expect(enough.meter).toEqual({ have: 40, need: 33, unit: 'life' });

    const short = run(calculator, { numbers: { life: 20, storm: 0 } });
    expect(short.verdict).toMatchObject({ tone: 'bad', title: 'You need 13 more life' });
  });

  test('charts the minimum life for the storm counts around yours', () => {
    const chart = run(calculatorFor(stormLifeLoop, '2903-3260-4740'), { numbers: { life: 25, storm: 2 } }).charts![0];
    expect(chart).toMatchObject({ kind: 'dots', selects: 'storm' });
    expect(chart.kind === 'dots' && chart.dots.slice(0, 4).map((dot) => [dot.x, dot.y, dot.tone])).toEqual([
      [0, 33, 'bad'],
      [1, 26, 'bad'],
      [2, 20, 'good'],
      [3, 15, 'good'],
    ]);
  });

  test('asks for the mana that pays when life cannot', () => {
    const calculator = calculatorFor(stormLifeLoop, '985-4740-5078-5313');
    expect(calculator.inputs.map((input) => input.key)).toContain('mana');
    expect(run(calculator, { numbers: { life: 3 } }).stats).toContainEqual(
      expect.objectContaining({ label: 'Mana needed at your life' }),
    );
  });

  test('answers a billion life and a million spells in a blink', () => {
    const calculator = calculatorFor(stormLifeLoop, '2903-3260-4740');
    const begin = performance.now();
    const result = run(calculator, { numbers: { life: 1_000_000_000, storm: 1_000_000 } });
    expect(performance.now() - begin).toBeLessThan(20);
    expect(result.verdict?.tone).toBe('good');
  });

  test('stays sane at the extremes, for every kind of loop', () => {
    for (const id of [
      '2903-3260-4740',
      '4050-4740-6742',
      '2292-4740-5220-6900',
      '985-4740-5078-5313',
      '1623-2125-4740',
    ] as const) {
      expectSaneAtExtremes(calculatorFor(stormLifeLoop, id));
    }
  });

  test('recognizes a loop whose life gain grows with the spells cast', () => {
    expect(
      detects(stormLifeLoop, {
        uses: ['Aetherflux Reservoir'],
        description: ['Pay 2 life.', 'Resolve the Aetherflux Reservoir trigger, gaining you 1 life.', 'Repeat.'],
      }),
    ).toBe(true);
  });
});
