import { describe, expect, test } from 'vitest';
import { UniformWalk, approximateSurvival, walkSurvival } from 'lib/combo/widgets/shared/randomWalk';

/* Step by step over every height, as the reference. */
function naiveSurvival(walk: UniformWalk, start: number, steps: number): number[] {
  const size = walk.high - walk.low + 1;
  let heights = [1];
  let offset = start;
  const curve = [1];
  for (let step = 1; step <= steps; step++) {
    const next = new Array<number>(heights.length + size - 1).fill(0);
    heights.forEach((chance, i) => {
      for (let move = 0; move < size; move++) {
        next[i + move] += chance / size;
      }
    });
    offset += walk.low;
    heights = next.map((chance, i) => (offset + i >= 0 ? chance : 0));
    curve.push(heights.reduce((a, b) => a + b, 0));
  }
  return curve;
}

const d20MinusFive: UniformWalk = { low: -4, high: 15 };
const d6MinusFour: UniformWalk = { low: -3, high: 2 };
const d6MinusThree: UniformWalk = { low: -2, high: 3 };

describe('walkSurvival', () => {
  test.each([
    ['rising', d20MinusFive, 0],
    ['falling', d6MinusFour, 5],
    ['barely rising', d6MinusThree, 2],
  ])('matches step-by-step for a %s walk', (_, walk, start) => {
    const survival = walkSurvival(walk, start, 40);
    naiveSurvival(walk, start, 40).forEach((expected, steps) => {
      expect(survival.at(steps)).toBeCloseTo(expected, 10);
    });
  });

  test('settles on the chance of never stopping when the walk rises', () => {
    const survival = walkSurvival(d6MinusThree, 2, 10);
    expect(survival.forever).toBeCloseTo(naiveSurvival(d6MinusThree, 2, 3000)[3000], 6);
    expect(survival.at(1_000_000_000)).toBeCloseTo(survival.forever, 12);
  });

  test('says how far it is exact', () => {
    expect(walkSurvival(d20MinusFive, 0, 10).exactFor).toBe(Infinity);
    expect(walkSurvival(d20MinusFive, 1_000_000_000, 10).exactFor).toBe(Infinity);
    expect(walkSurvival(d6MinusFour, 5, 10_000).exactFor).toBe(Infinity);
    expect(walkSurvival(d6MinusFour, 100_000, 60_000).exactFor).toBeLessThan(60_000);
    expect(walkSurvival(d6MinusFour, 900_000_000, 1_000_000_000).exactFor).toBe(300_000_000);
    expect(approximateSurvival(d6MinusFour, 5).exactFor).toBe(0);
  });

  test('never stops when the walk falls on average', () => {
    expect(walkSurvival(d6MinusFour, 5, 10).forever).toBe(0);
  });

  test('is certain when the start is too high to fall from in time', () => {
    const survival = walkSurvival(d6MinusFour, 1_000_000_000, 30);
    expect(survival.at(30)).toBe(1);
  });

  test('is certain far enough up a rising walk', () => {
    const survival = walkSurvival(d20MinusFive, 1_000_000_000, 1_000_000_000);
    expect(survival.at(1_000_000_000)).toBe(1);
    expect(survival.forever).toBe(1);
  });

  test('answers absurd starts and horizons fast', () => {
    const begin = performance.now();
    const survival = walkSurvival(d6MinusFour, 900_000_000, 1_000_000_000);
    const chance = survival.at(1_000_000_000);
    expect(chance).toBeGreaterThanOrEqual(0);
    expect(chance).toBeLessThanOrEqual(1);
    expect(performance.now() - begin).toBeLessThan(500);
  });
});

describe('approximateSurvival', () => {
  test('stays within a percentage point of the exact walk where both can run', () => {
    for (const [walk, start, steps] of [
      [d6MinusFour, 200, 600],
      [d6MinusFour, 60, 300],
      [{ low: -10, high: 9 }, 300, 2000],
    ] as const) {
      const exact = naiveSurvival(walk, start, steps)[steps];
      expect(Math.abs(approximateSurvival(walk, start).at(steps) - exact)).toBeLessThan(0.01);
    }
  });
});
