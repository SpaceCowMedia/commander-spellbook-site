import { describe, expect, test } from 'vitest';
import {
  LifeLoop,
  LifeStep,
  LoopInputs,
  NO_LOOP_INPUTS,
  drainMinimumLife,
  drainRun,
  firstRisingLoop,
  lifeAtLoop,
  lifeTrace,
  loopsUntilAbove,
  manaToGoOff,
  stormMinimumLife,
} from 'lib/combo/widgets/shared/lifeLoop';

/* The rules played one step and one extort trigger at a time, as the reference. */
function reference(loop: LifeLoop, inputs: LoopInputs, start: number, maxLoops: number, lives: number[] = []) {
  let life = start;
  let storm = inputs.storm;
  let choiceMade = false;
  let manaUsed = 0;
  const opponents = [...lives];
  const deaths: (number | null)[] = lives.map(() => null);
  const ends: number[] = [];
  const tracking = lives.length > 0;
  const living = () => opponents.filter((remaining) => remaining > 0).length;
  const drain = (amount: number, n: number) => {
    const alive = living();
    opponents.forEach((remaining, i) => {
      if (remaining > 0) {
        opponents[i] -= amount;
        if (opponents[i] <= 0) {
          deaths[i] = n;
        }
      }
    });
    life += amount * alive;
  };
  const step = (s: LifeStep, n: number): boolean => {
    const pay = (amount: number) => {
      life -= amount;
      return life >= 1;
    };
    switch (s.kind) {
      case 'pay':
        return pay(s.life);
      case 'pay-x':
        return pay(inputs.x);
      case 'pay-half':
        return pay(Math.ceil(life / 2));
      case 'pay-choice': {
        const most = Math.max(...s.options.map((o) => o.life));
        const chosen = choiceMade ? most : s.options[inputs.choice].life;
        choiceMade = true;
        return pay(chosen);
      }
      case 'pay-or-mana':
        if (life - s.life >= 1) {
          life -= s.life;
          return true;
        }
        manaUsed += s.mana;
        return manaUsed <= inputs.mana;
      case 'gain':
        life += s.life;
        return true;
      case 'cast':
        storm++;
        return true;
      case 'storm-gain':
        life += storm;
        return true;
      case 'drain':
        drain(s.perOpponent === 'devotion' ? inputs.devotion : s.perOpponent, n);
        return true;
      case 'extort':
        for (let i = 0; i < inputs.extorters; i++) {
          if (!pay(s.life)) {
            return false;
          }
          drain(1, n);
        }
        return true;
    }
  };
  const playAll = (steps: LifeStep[], n: number) => {
    for (const s of steps) {
      if (!step(s, n)) {
        return 'stuck' as const;
      }
      if (tracking && living() === 0) {
        return 'table-dead' as const;
      }
    }
    return undefined;
  };
  const setupEnd = playAll(loop.setup, 0);
  if (setupEnd) {
    return { end: setupEnd, loops: 0, deaths, opponents, ends, manaUsed };
  }
  ends.push(life);
  for (let n = 1; n <= maxLoops; n++) {
    const end = playAll(loop.loop, n);
    if (end) {
      return { end, loops: end === 'table-dead' ? n : n - 1, deaths, opponents, ends, manaUsed };
    }
    ends.push(life);
  }
  return { end: 'loops' as const, loops: maxLoops, deaths, opponents, ends, manaUsed };
}

function referenceMinimumLife(loop: LifeLoop, inputs: LoopInputs, maxLoops: number, lives: number[] = []): number {
  const works = (life: number) => {
    const end = reference(loop, inputs, life, maxLoops, lives).end;
    return lives.length > 0 ? end === 'table-dead' : end !== 'stuck';
  };
  for (let life = 1; life <= 100_000; life = life < 64 ? life + 1 : Math.ceil(life * 1.01)) {
    if (works(life)) {
      let low = Math.max(1, Math.floor(life / 1.01) - 1);
      while (!works(low)) {
        low++;
      }
      return low;
    }
  }
  return Infinity;
}

function random(seed: number) {
  let state = seed;
  return (n: number) => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
}

const storm = (spells: number): LoopInputs => ({ ...NO_LOOP_INPUTS, storm: spells });
const loopOf = (...loop: LifeStep[]): LifeLoop => ({ setup: [], loop });

const krrikSigil = loopOf({ kind: 'pay', life: 4 }, { kind: 'cast' }, { kind: 'storm-gain' }, { kind: 'pay', life: 4 });
const mortuary = loopOf({ kind: 'pay-x' }, { kind: 'cast' }, { kind: 'storm-gain' });
const timelineCuller = loopOf(
  {
    kind: 'pay-choice',
    options: [
      { label: 'From your hand', life: 0 },
      { label: 'With warp', life: 2 },
    ],
  },
  { kind: 'cast' },
  { kind: 'storm-gain' },
  { kind: 'pay', life: 1 },
);

describe('stormMinimumLife', () => {
  test('matches the candidates table for Leshrac’s Sigil and K’rrik', () => {
    expect([0, 1, 2, 3, 4, 5].map((s) => stormMinimumLife(krrikSigil, storm(s)))).toEqual([33, 26, 20, 15, 11, 8]);
  });

  test('matches the candidates table for Mortuary, by mana value', () => {
    const rows = [1, 2, 3, 4, 5, 6].map((x) =>
      [0, 1, 2, 3, 4, 5].map((s) => stormMinimumLife(mortuary, { ...storm(s), x })),
    );
    expect(rows).toEqual([
      [2, 2, 2, 2, 2, 2],
      [4, 3, 3, 3, 3, 3],
      [7, 5, 4, 4, 4, 4],
      [11, 8, 6, 5, 5, 5],
      [16, 12, 9, 7, 6, 6],
      [22, 17, 13, 10, 8, 7],
    ]);
  });

  test('pays the chosen way only the first time', () => {
    const hand = [0, 1, 2].map((s) => stormMinimumLife(timelineCuller, { ...storm(s), choice: 0 }));
    const warp = [0, 1, 2].map((s) => stormMinimumLife(timelineCuller, { ...storm(s), choice: 1 }));
    expect(hand).toEqual([4, 2, 1]);
    expect(warp).toEqual([6, 4, 3]);
  });

  test('agrees with playing the loop step by step on random loops', () => {
    const roll = random(7);
    for (let i = 0; i < 150; i++) {
      const kinds: LifeStep[] = [
        { kind: 'pay', life: 1 + roll(6) },
        { kind: 'gain', life: roll(4) },
        { kind: 'cast' },
        { kind: 'storm-gain' },
        { kind: 'pay-x' },
      ];
      const loop: LifeLoop = {
        setup: Array.from({ length: roll(2) }, () => kinds[roll(4)]),
        loop: [kinds[2], kinds[3], ...Array.from({ length: 1 + roll(3) }, () => kinds[roll(kinds.length)])],
      };
      const inputs = { ...storm(roll(4)), x: 1 + roll(5) };
      expect(stormMinimumLife(loop, inputs)).toBe(referenceMinimumLife(loop, inputs, 200));
    }
  });

  test('is out of reach when no spell is cast to make the loop grow', () => {
    expect(stormMinimumLife(loopOf({ kind: 'pay', life: 2 }, { kind: 'gain', life: 1 }), storm(0))).toBe(Infinity);
  });

  test('answers in a blink for a mana value of a billion', () => {
    const begin = performance.now();
    const needed = stormMinimumLife(mortuary, { ...storm(0), x: 1_000_000_000 });
    expect(needed).toBeGreaterThan(4.99e17);
    expect(needed).toBeLessThan(5.01e17);
    expect(performance.now() - begin).toBeLessThan(5);
  });

  test('searches when payments depend on your life', () => {
    const top = loopOf({ kind: 'pay-or-mana', life: 3, mana: 1 }, { kind: 'cast' }, { kind: 'storm-gain' });
    expect(stormMinimumLife(top, { ...storm(0), mana: 0 })).toBe(
      referenceMinimumLife(top, { ...storm(0), mana: 0 }, 60),
    );
    expect(manaToGoOff(top, storm(0), 1)).toBe(2);
    expect(manaToGoOff(top, storm(0), 7)).toBe(0);
  });
});

describe('storm loop curves', () => {
  test('find the loops until Aetherflux can fire', () => {
    for (const life of [33, 40, 51, 60, 1000]) {
      const ends = reference(krrikSigil, storm(0), life, 400).ends;
      const expected = ends.findIndex((end) => end > 50);
      expect(loopsUntilAbove(krrikSigil, storm(0), life, 50)).toBe(expected);
    }
  });

  test('find the first loop that gains life', () => {
    expect(firstRisingLoop(krrikSigil, storm(0), 33)).toBe(9);
    expect(firstRisingLoop(krrikSigil, storm(10), 33)).toBe(1);
  });

  test('trace life after every step', () => {
    const points = lifeTrace(krrikSigil, storm(0), 33, 1);
    expect(points.map((p) => p.y)).toEqual([33, 29, 29, 30, 26]);
    expect(points[points.length - 1].x).toBe(1);
  });
});

describe('drain loops', () => {
  const grayMerchant = loopOf(
    { kind: 'pay', life: 2 },
    { kind: 'pay', life: 4 },
    { kind: 'drain', perOpponent: 'devotion' },
  );
  const extortLoop = loopOf({ kind: 'pay', life: 3 }, { kind: 'extort', life: 1 });

  test('agree with the reference on random tables', () => {
    const roll = random(11);
    for (let i = 0; i < 300; i++) {
      const loop = roll(2) === 0 ? grayMerchant : extortLoop;
      const inputs = { ...NO_LOOP_INPUTS, devotion: roll(8), extorters: roll(6) };
      const lives = Array.from({ length: 1 + roll(4) }, () => 1 + roll(60));
      const life = 1 + roll(80);
      const expected = reference(loop, inputs, life, 5000, lives);
      const run = drainRun(loop, inputs, lives, life);
      expect(run.end).toBe(expected.end === 'loops' ? 'stalled' : expected.end);
      if (run.end !== 'stalled') {
        expect(run.loops).toBe(expected.loops);
        expect(run.deaths).toEqual(expected.deaths);
        expect(run.remaining).toEqual(expected.opponents);
      }
      const drains = loop === grayMerchant ? inputs.devotion : inputs.extorters;
      expect(drainMinimumLife(loop, inputs, lives)).toBe(
        drains > 0 ? referenceMinimumLife(loop, inputs, 5000, lives) : Infinity,
      );
    }
  });

  test('know the life at every loop end', () => {
    const lives = [20, 30];
    const run = drainRun(grayMerchant, { ...NO_LOOP_INPUTS, devotion: 3 }, lives, 40);
    const ends = reference(grayMerchant, { ...NO_LOOP_INPUTS, devotion: 3 }, 40, 1000, lives).ends;
    ends.forEach((life, n) => expect(lifeAtLoop(run, n)).toBe(life));
  });

  test('skip the quiet loops against a billion life', () => {
    const begin = performance.now();
    const lives = Array.from({ length: 7 }, (_, i) => 1_000_000_000 - i);
    const run = drainRun(grayMerchant, { ...NO_LOOP_INPUTS, devotion: 1 }, lives, 1_000_000_000);
    expect(run.end).toBe('table-dead');
    expect(run.loops).toBe(1_000_000_000);
    expect(drainMinimumLife(grayMerchant, { ...NO_LOOP_INPUTS, devotion: 1 }, lives)).toBe(7);
    expect(performance.now() - begin).toBeLessThan(20);
  });

  test('never kill anyone without drains', () => {
    const run = drainRun(grayMerchant, NO_LOOP_INPUTS, [10], 50);
    expect(run.end).toBe('stuck');
    expect(drainMinimumLife(grayMerchant, NO_LOOP_INPUTS, [10])).toBe(Infinity);
  });
});
