import { describe, expect, test } from 'vitest';
import {
  Dig,
  SAFE_LIFE,
  deathChances,
  lifeAtTheEnd,
  manaValueChances,
  survival,
} from 'lib/combo/widgets/shared/lifeDig';

/* Card by card with the lands counted exactly, from the last card back, playing lands for free while
   land drops are left: the slow way, as the reference. With `best`, each spell is cast or exiled,
   whichever gives the better chance of living through the library; otherwise every spell is cast
   when it can be. Gives the chance of living through it and the life left on average then. */
function exactly({ cards, lands, manaValue, life, storm, freeLands = 0 }: Dig, best: boolean) {
  const chances = manaValueChances(manaValue);
  const spells = cards - lands;
  const most = life + spells * storm + (spells * (spells + 1)) / 2;
  const at = (landsLeft: number, cast: number, drops: number, lifeLeft: number) =>
    ((landsLeft * (spells + 1) + cast) * (freeLands + 1) + drops) * (most + 1) + lifeLeft;
  const size = (lands + 1) * (spells + 1) * (freeLands + 1) * (most + 1);
  /* the chance of living through the rest, and the life at the end summed weighted by that chance */
  let alive = new Float64Array(size);
  let ending = new Float64Array(size);
  for (let cast = 0; cast <= spells; cast++) {
    for (let drops = 0; drops <= freeLands; drops++) {
      for (let lifeLeft = 1; lifeLeft <= most; lifeLeft++) {
        alive[at(0, cast, drops, lifeLeft)] = 1;
        ending[at(0, cast, drops, lifeLeft)] = lifeLeft;
      }
    }
  }
  for (let left = 1; left <= cards; left++) {
    const nextAlive = new Float64Array(size);
    const nextEnding = new Float64Array(size);
    for (let landsLeft = 0; landsLeft <= Math.min(lands, left); landsLeft++) {
      const spellsLeft = left - landsLeft;
      if (spellsLeft > spells) {
        continue;
      }
      for (let cast = 0; cast <= spells - spellsLeft; cast++) {
        for (let drops = 0; drops <= freeLands; drops++) {
          for (let h = 1; h <= most; h++) {
            let chance = 0;
            let sum = 0;
            const go = (share: number, to: number) => {
              chance += share * alive[to];
              sum += share * ending[to];
            };
            if (landsLeft > 0) {
              if (drops > 0) {
                go(landsLeft / left, at(landsLeft - 1, cast, drops - 1, h));
              } else if (h >= 2) {
                go(landsLeft / left, at(landsLeft - 1, cast, drops, h - 1));
              }
            }
            if (spellsLeft > 0) {
              const exile = h >= 2 ? at(landsLeft, cast, drops, h - 1) : -1;
              chances.forEach((valueChance, value) => {
                const castTo =
                  value < h ? at(landsLeft, cast + 1, drops, Math.min(most, h - value + storm + cast + 1)) : -1;
                const castBetter = castTo >= 0 && (!best || exile < 0 || alive[castTo] >= alive[exile]);
                const to = castBetter ? castTo : exile;
                if (to >= 0) {
                  go((spellsLeft / left) * valueChance, to);
                }
              });
            }
            nextAlive[at(landsLeft, cast, drops, h)] = chance;
            nextEnding[at(landsLeft, cast, drops, h)] = sum;
          }
        }
      }
    }
    alive = nextAlive;
    ending = nextEnding;
  }
  const start = at(lands, 0, freeLands, Math.min(life, most));
  return { alive: alive[start], life: ending[start] / alive[start] };
}

const died = (dig: Dig) => deathChances(dig).get(dig.life)!;

describe('lifeAtTheEnd', () => {
  test('is the life left on average once every spell is cast, when nothing can go wrong', () => {
    for (const dig of [
      { cards: 24, lands: 8, manaValue: 3, life: 90, storm: 0 },
      { cards: 20, lands: 6, manaValue: 2.4, life: 70, storm: 3, freeLands: 1 },
    ]) {
      expect(lifeAtTheEnd(dig)).toBeCloseTo(exactly(dig, false).life, 6);
    }
  });

  test('stays within a few percent of casting every spell when you live through it from low life', () => {
    for (const life of [5, 8]) {
      const dig = { cards: 24, lands: 8, manaValue: 3, life, storm: 0, freeLands: 1 };
      const exact = exactly(dig, false).life;
      expect(Math.abs(lifeAtTheEnd(dig) - exact) / exact).toBeLessThan(0.05);
    }
  });

  test('counts only the lands not played for free', () => {
    const dig = { cards: 60, lands: 22, manaValue: 3, life: 20, storm: 0 };
    expect(lifeAtTheEnd({ ...dig, freeLands: 2 })).toBe(lifeAtTheEnd(dig) + 2);
    expect(lifeAtTheEnd({ ...dig, freeLands: 100 })).toBe(lifeAtTheEnd(dig) + 22);
  });
});

describe('deathChances', () => {
  test('stays close to living through the library the best way with the lands counted exactly', () => {
    const gaps: number[] = [];
    for (const life of [3, 6, 12]) {
      for (const manaValue of [1.5, 3]) {
        for (const freeLands of [0, 1]) {
          const dig = { cards: 20, lands: 7, manaValue, life, storm: 0, freeLands };
          gaps.push(Math.abs(died(dig) - (1 - exactly(dig, true).alive)));
        }
      }
    }
    expect(Math.max(...gaps)).toBeLessThan(0.04);
    expect(gaps.reduce((a, b) => a + b) / gaps.length).toBeLessThan(0.02);
  }, 30_000);

  test('goes down with life and land drops, and up with lands', () => {
    const dig = { cards: 60, lands: 22, manaValue: 3, life: 8, storm: 0 };
    const lives = Array.from({ length: 30 }, (_, i) => i + 1);
    const byLife = deathChances(dig, lives);
    lives.slice(1).forEach((life) => expect(byLife.get(life)!).toBeLessThanOrEqual(byLife.get(life - 1)! + 1e-12));
    expect(died({ ...dig, freeLands: 1 })).toBeLessThan(died(dig));
    expect(died({ ...dig, lands: 30 })).toBeGreaterThan(died(dig));
  });

  test('is sure when the lands alone take more life than there is, and nil with life to spare', () => {
    const allLands = { cards: 10, lands: 10, manaValue: 3, storm: 0 };
    expect(died({ ...allLands, life: 10 })).toBe(1);
    expect(died({ ...allLands, life: 11 })).toBe(0);
    expect(died({ ...allLands, life: 10, freeLands: 1 })).toBe(0);
    expect(survival({ cards: 60, lands: 22, manaValue: 3, life: 20, storm: 0 })(SAFE_LIFE)).toBe(1);
  });

  test('estimates the dip from far up much like it works it out below', () => {
    const dig = { cards: 99, lands: 50, manaValue: 4, storm: 0 };
    expect(died({ ...dig, life: SAFE_LIFE - 1 })).toBeLessThan(1e-6);
    expect(died({ ...dig, life: SAFE_LIFE })).toBeLessThan(1e-6);
  });

  test('answers in a blink however big the numbers', () => {
    const begin = performance.now();
    for (const dig of [
      { cards: 1e9, lands: 3.7e8, manaValue: 16, life: 500, storm: 0 },
      { cards: 1e9, lands: 9.9e8, manaValue: 3, life: 1e9, storm: 0, freeLands: 1e9 },
      { cards: 1e9, lands: 3.7e8, manaValue: 3, life: 40, storm: 1e9, freeLands: 40 },
    ]) {
      const chance = died(dig);
      expect(chance).toBeGreaterThanOrEqual(0);
      expect(chance).toBeLessThanOrEqual(1);
    }
    expect(performance.now() - begin).toBeLessThan(50);
  });
});
