import { describe, expect, test } from 'vitest';
import { type Copier, type Engine, type Spot, krarkFlips, krarkOdds, outOfMana } from 'lib/combo/widgets/krarkFlips';
import { fixtureVariant } from './testing/fakeVariant';
import { calculatorFor, detects, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

const RELIC = '1434-1704-4549--227';
const SHAKU = '1704-2466-4600--227';
const KILN = '1704-4493-5195-7063';
const KILN_INCURSION = '1704-4493-5195-7694';
const EARTHCRAFT_INCURSION = '1704-2757-7063-7694';

const TEMPLATE: Copier[] = [
  { cost: 2, everyNontoken: false },
  { cost: 3, everyNontoken: false },
];
const DUPLICATION: Copier = { cost: 4, everyNontoken: false };
const PRODUCTION: Copier = { cost: 5, everyNontoken: false };
const INCURSION: Copier = { cost: 7, everyNontoken: true };

/* the same coin flips on every run */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Board {
  copiers: Copier[];
  engine: Engine;
  others?: number;
}

/* Far past where anything could still stop the loop */
const PLENTY = 300;

/* The combo played trigger by trigger with real coin flips: every Krark on the battlefield as the spell
   is cast flips for it, each win puts a copy on the stack that resolves before the next flip, and the
   first loss sends the card back to your hand. Every Storm-Kiln Artist makes a Treasure for the cast and
   for each copy. Each spell cast is the one the odds pick, the cheapest you can pay for once they have
   none to pick. Ends with how the combo went. */
function play(board: Board, odds: ReturnType<typeof krarkOdds>, start: Spot, random: () => number) {
  const { copiers, engine, others = 0 } = board;
  let { krarks, artists, mana, hand } = start;
  const resolve = (copier: Copier) => {
    krarks++;
    if (copier.everyNontoken) {
      /* every nontoken creature: Krark, the Artist and the rest */
      if (engine === 'magecraft') {
        artists++;
      }
      if (engine === 'creature') {
        mana += 1 + others;
      }
    } else if (engine !== 'magecraft') {
      mana++;
    }
  };
  for (;;) {
    if (hand === 0) {
      return 'used up';
    }
    if (krarks >= PLENTY) {
      return 'infinite';
    }
    const affordable = copiers.flatMap((copier, i) => (hand & (1 << i) && mana >= copier.cost ? [i] : []));
    if (affordable.length === 0) {
      return 'out of mana';
    }
    const picked = odds.at({ krarks, artists, mana, hand }).cast;
    const i = picked ?? affordable.reduce((a, b) => (copiers[b].cost < copiers[a].cost ? b : a));
    const copier = copiers[i];
    mana -= copier.cost;
    if (engine === 'magecraft') {
      mana += artists;
    }
    let returned = false;
    const flips = krarks;
    for (let flip = 0; flip < flips; flip++) {
      if (random() < 0.5) {
        if (engine === 'magecraft') {
          mana += artists;
        }
        resolve(copier);
      } else {
        returned = true;
      }
    }
    if (!returned) {
      resolve(copier);
      hand &= ~(1 << i);
    }
  }
}

/* How often each ending comes up over many plays, against the odds worked out */
function expectPlayedOdds(board: Board, start: Spot, plays = 20_000) {
  const odds = krarkOdds(board.copiers, board.engine, board.others);
  const random = seeded(1234);
  const counts: Record<string, number> = { infinite: 0, 'used up': 0, 'out of mana': 0 };
  for (let i = 0; i < plays; i++) {
    counts[play(board, odds, start, random)]++;
  }
  const expected = odds.at(start);
  const within = (seen: number, chance: number, what: string) => {
    /* four standard errors, and a hair for mana the table stops counting past */
    const error = 4 * Math.sqrt((chance * (1 - chance)) / plays) + 1e-3;
    expect(Math.abs(seen / plays - chance), `${what}: played ${seen / plays} against ${chance}`).toBeLessThan(error);
  };
  within(counts.infinite, expected.win, 'infinite');
  within(counts['used up'], expected.usedUp, 'used up');
  within(counts['out of mana'], outOfMana(expected), 'out of mana');
}

describe('the odds', () => {
  test('match the combo played flip by flip, whatever pays for the next cast', () => {
    expectPlayedOdds({ copiers: TEMPLATE, engine: 'legendary' }, { krarks: 1, artists: 0, mana: 10, hand: 3 });
    expectPlayedOdds({ copiers: TEMPLATE, engine: 'legendary' }, { krarks: 1, artists: 0, mana: 6, hand: 3 });
    expectPlayedOdds(
      { copiers: [DUPLICATION, PRODUCTION], engine: 'magecraft' },
      {
        krarks: 1,
        artists: 1,
        mana: 14,
        hand: 3,
      },
    );
    expectPlayedOdds(
      { copiers: [INCURSION, DUPLICATION], engine: 'magecraft' },
      {
        krarks: 1,
        artists: 1,
        mana: 12,
        hand: 3,
      },
    );
    expectPlayedOdds(
      { copiers: [INCURSION, PRODUCTION], engine: 'creature', others: 2 },
      {
        krarks: 1,
        artists: 0,
        mana: 20,
        hand: 3,
      },
    );
  });

  test('match the combo played from the middle, with Krarks made and a spell used up', () => {
    expectPlayedOdds({ copiers: TEMPLATE, engine: 'legendary' }, { krarks: 3, artists: 0, mana: 3, hand: 2 });
    expectPlayedOdds(
      { copiers: [INCURSION, DUPLICATION], engine: 'magecraft' },
      {
        krarks: 4,
        artists: 3,
        mana: 4,
        hand: 2,
      },
    );
  });

  test('a single Krark uses up its only spell with the first flip it wins', () => {
    const odds = krarkOdds(TEMPLATE, 'legendary');
    expect(odds.unlimited(1, 1)).toBe(0);
    /* short of losing every flip until the mana runs out */
    const lone = odds.at({ krarks: 1, artists: 0, mana: 100, hand: 1 });
    expect(lone.win).toBe(0);
    expect(lone.usedUp).toBeCloseTo(1 - 2 ** -50, 12);
  });

  test('with mana to spare, two spells go infinite about 4 times in 5', () => {
    /* the first win of a lone Krark uses a spell up, so it is the second spell from 3 Krarks */
    const unlimited = new Map<string, number>();
    const chance = (krarks: number): number => {
      if (krarks >= 200) {
        return 1;
      }
      const key = String(krarks);
      if (!unlimited.has(key)) {
        let win = 0;
        let ways = 1;
        for (let wins = 0; wins <= krarks; wins++) {
          const odds = ways / 2 ** krarks;
          if (wins > 0 && wins < krarks) {
            win += odds * chance(krarks + wins);
          }
          ways = (ways * (krarks - wins)) / (wins + 1);
        }
        unlimited.set(key, win / (1 - 2 ** -krarks));
      }
      return unlimited.get(key)!;
    };
    const odds = krarkOdds(TEMPLATE, 'legendary');
    expect(odds.unlimited(1, 3)).toBeCloseTo(chance(3), 12);
    expect(odds.unlimited(1, 3)).toBeCloseTo(0.8027, 4);
    expect(odds.at({ krarks: 1, artists: 0, mana: odds.most, hand: 3 }).win).toBeCloseTo(odds.unlimited(1, 3), 6);
  });

  test('never get worse with more mana or more Krarks', () => {
    for (const [copiers, engine] of [
      [TEMPLATE, 'legendary'],
      [[INCURSION, DUPLICATION], 'magecraft'],
      [[INCURSION, PRODUCTION], 'creature'],
    ] as const) {
      const odds = krarkOdds([...copiers], engine);
      for (const hand of [1, 2, 3]) {
        for (let krarks = 1; krarks < 12; krarks++) {
          for (let mana = 0; mana < 60; mana++) {
            const here = odds.at({ krarks, artists: 1, mana, hand }).win;
            expect(odds.at({ krarks, artists: 1, mana: mana + 1, hand }).win).toBeGreaterThanOrEqual(here - 1e-12);
            expect(odds.at({ krarks: krarks + 1, artists: 1, mana, hand }).win).toBeGreaterThanOrEqual(here - 1e-12);
          }
        }
      }
    }
  });

  test("can't start without the mana for a spell in hand", () => {
    const odds = krarkOdds(TEMPLATE, 'legendary');
    expect(odds.at({ krarks: 1, artists: 0, mana: 1, hand: 3 })).toEqual({ win: 0, usedUp: 0 });
    expect(odds.at({ krarks: 5, artists: 0, mana: 2, hand: 2 })).toEqual({ win: 0, usedUp: 0 });
    /* the cheaper one you can cast, but a single win leaves too little to cast it again */
    expect(odds.at({ krarks: 5, artists: 0, mana: 2, hand: 1 }).win).toBeCloseTo(0.7548, 4);
  });
});

test('recognizes the coin-flipping Krark combos by what makes the mana and which spells copy', () => {
  expect(specFor(krarkFlips, RELIC)).toEqual({
    widget: 'krark-flips',
    engine: 'Relic of Legends',
    spells: [{ everyNontoken: false }, { everyNontoken: false }],
  });
  expect(specFor(krarkFlips, SHAKU).engine).toBe('Honor-Worn Shaku');
  expect(specFor(krarkFlips, KILN)).toEqual({
    widget: 'krark-flips',
    engine: 'Storm-Kiln Artist',
    spells: [
      { name: "Irenicus's Vile Duplication", cost: 4, everyNontoken: false },
      { name: 'Ember Island Production', cost: 5, everyNontoken: false },
    ],
  });
  expect(specFor(krarkFlips, KILN_INCURSION).spells).toEqual([
    { name: 'Multiversal Incursion', cost: 7, everyNontoken: true },
    { name: "Irenicus's Vile Duplication", cost: 4, everyNontoken: false },
  ]);
  expect(specFor(krarkFlips, EARTHCRAFT_INCURSION).engine).toBe('Earthcraft');
});

test('leaves the Krark loops without coin flips alone', () => {
  expect(krarkFlips.detect(fixtureVariant('1704-2232-2421-2459-4050'))).toBeUndefined();
  expect(
    detects(krarkFlips, {
      uses: [
        'Krark, the Thumbless',
        'Relic of Legends',
        'Mirror Box',
        "Irenicus's Vile Duplication",
        'Ember Island Production',
      ],
      description: 'Resolve all Krark triggers, copying that spell for each flip you won.',
    }),
  ).toBe(false);
  expect(
    detects(krarkFlips, {
      uses: ['Krark, the Thumbless', 'Mirror Box'],
      description:
        'Resolve all Krark triggers, copying that spell for each flip you won.\nRepeat with the second creature-copying spell.',
    }),
  ).toBe(false);
});

describe('the calculator', () => {
  test('asks for the mana values of the spells the combo leaves to you', () => {
    expect(calculatorFor(krarkFlips, RELIC).inputs.map(({ key, label, initial }) => [key, label, initial])).toEqual([
      ['mana', 'Mana you have', 10],
      ['firstCost', 'Mana value of the first copying spell', 2],
      ['secondCost', 'Mana value of the second copying spell', 3],
      ['krarks', 'Krarks you control', 1],
      ['hand', 'Copying spells in your hand', '3'],
    ]);
    expect(calculatorFor(krarkFlips, KILN).inputs.map(({ key, initial }) => [key, initial])).toEqual([
      ['mana', 18],
      ['krarks', 1],
      ['hand', '3'],
    ]);
    expect(calculatorFor(krarkFlips, KILN_INCURSION).inputs.map(({ key }) => key)).toEqual([
      'mana',
      'krarks',
      'artists',
      'hand',
    ]);
    expect(calculatorFor(krarkFlips, EARTHCRAFT_INCURSION).inputs.map(({ key }) => key)).toEqual([
      'mana',
      'others',
      'krarks',
      'hand',
    ]);
  });

  test('says where the mana comes from', () => {
    expect(calculatorFor(krarkFlips, RELIC).summary).toContain('each new Krark taps for a mana with Relic of Legends');
    expect(calculatorFor(krarkFlips, SHAKU).summary).toContain('untaps Honor-Worn Shaku for {C}');
    expect(calculatorFor(krarkFlips, KILN).summary).toMatch(
      /^Each Krark flips a coin whenever you cast Irenicus's Vile Duplication or Ember Island Production\./,
    );
    expect(calculatorFor(krarkFlips, KILN_INCURSION).summary).toContain(
      'Multiversal Incursion copies Storm-Kiln Artist too',
    );
    expect(calculatorFor(krarkFlips, EARTHCRAFT_INCURSION).summary).toContain(
      'copies your other nontoken creatures too',
    );
  });

  test('gives the chance of going infinite and how it fails otherwise', () => {
    const result = run(calculatorFor(krarkFlips, RELIC));
    expect(result.headline).toEqual({ label: 'Chance of going infinite', value: '66.8%' });
    expect(result.stats).toEqual([
      { label: 'Runs out of mana', value: '16.1%', caption: 'with a copying spell still in hand' },
      { label: 'Uses up both spells', value: '17%', caption: 'each by winning every flip of a cast' },
      { label: 'With unlimited mana', value: '80.3%', caption: 'the best these spells can do' },
      { label: 'Cast first', value: 'The cheaper spell', caption: '66.6% the other way around' },
    ]);
  });

  test('saves the cheaper spell for later when mana is short', () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    expect(run(calculator, { numbers: { mana: 6 } }).stats?.[3]).toMatchObject({
      label: 'Cast first',
      value: 'The dearer spell',
    });
    expect(run(calculatorFor(krarkFlips, EARTHCRAFT_INCURSION)).stats?.[3]).toEqual({
      label: 'Cast first',
      value: 'Multiversal Incursion',
      caption: '21.5% the other way around',
    });
  });

  test('picks up mid-combo, from the Krarks and the spells you have left', () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    expect(run(calculator, { numbers: { krarks: 2 } }).headline.value).toBe('97.6%');
    const one = run(calculator, { numbers: { krarks: 3, mana: 3 }, choices: { hand: '2' } });
    expect(one.stats?.map((stat) => stat.label)).toEqual([
      'Runs out of mana',
      'Uses up the spell',
      'With unlimited mana',
    ]);
    const lone = run(calculator, { numbers: { krarks: 1, mana: 30 }, choices: { hand: '1' } });
    expect(lone.headline.value).toBe('0%');
    expect(lone.stats?.[1].value).toBe('>99.9%');
  });

  test('counts the Storm-Kiln Artists Multiversal Incursion copies, and the creatures it copies for Earthcraft', () => {
    const kiln = calculatorFor(krarkFlips, KILN_INCURSION);
    const withArtists = (artists: number) => run(kiln, { numbers: { mana: 9, artists } }).headline.value;
    expect(Number.parseFloat(withArtists(3))).toBeGreaterThan(Number.parseFloat(withArtists(1)));
    const earthcraft = calculatorFor(krarkFlips, EARTHCRAFT_INCURSION);
    const withOthers = (others: number) => run(earthcraft, { numbers: { others } }).headline.value;
    expect(Number.parseFloat(withOthers(2))).toBeGreaterThan(Number.parseFloat(withOthers(0)));
  });

  test('charts the chance by mana and by Krarks, steady where more stops showing', () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    const [byMana, byKrarks] = run(calculator).charts!;
    expect(byMana).toMatchObject({ title: 'Chance of going infinite by mana', selects: 'mana', percent: true });
    expect(byMana.dots[0]).toEqual({ x: 10, y: expect.closeTo(66.85, 2), label: '10 mana: 66.8%', tone: 'warn' });
    expect(byKrarks).toMatchObject({ title: 'Chance of going infinite by Krarks', selects: 'krarks', steadyFrom: 4 });
    expect(byKrarks.dots.map((dot) => dot.label)).toEqual([
      '1 Krark: 66.8%',
      '2 Krarks: 97.6%',
      '3 Krarks: 99.8%',
      '4 or more Krarks: >99.9%',
    ]);
    expectSteadyFrom(calculator, 'krarks', 4);
    expectSteadyFrom(calculator, 'mana', 31);
    expectSteadyFrom(calculatorFor(krarkFlips, KILN), 'mana', 49);
    expectSteadyFrom(calculatorFor(krarkFlips, KILN_INCURSION), 'krarks', 4);
  });

  test('stays quick and sane at every extreme', () => {
    for (const id of [RELIC, SHAKU, KILN, KILN_INCURSION, EARTHCRAFT_INCURSION] as const) {
      expectSaneAtExtremes(calculatorFor(krarkFlips, id));
    }
  });
});
