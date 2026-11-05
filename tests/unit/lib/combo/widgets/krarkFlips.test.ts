import { describe, expect, test } from 'vitest';
import {
  type Copier,
  type Engine,
  type KrarkOdds,
  type Spot,
  krarkFlips,
  krarkOdds,
  outOfMana,
} from 'lib/combo/widgets/krarkFlips';
import { fakeVariant, fixtureVariant } from './testing/fakeVariant';
import { calculatorFor, detects, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

const RELIC = '1434-1704-4549--227';
const SHAKU = '1704-2466-4600--227';
const SAKASHIMA = '1704-2719-4549--227';
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
  thumbs?: number;
}

/* Far past where anything could still stop the loop: sooner with Krark's Thumb, which wins nearly every
   flip and loses one whenever that keeps the last spell, so that from 32 Krarks the chance of the spells
   running out is too small for a double to hold */
const PLENTY = 300;
const PLENTY_WITH_THUMBS = 32;

/* Where casting spell `i` and winning `wins` of its flips leaves you: each win puts a copy on the stack
   that resolves before the next flip, and winning every flip resolves the card too and uses it up. Every
   Storm-Kiln Artist makes a Treasure for the cast and for each copy. */
function after(board: Board, spot: Spot, i: number, wins: number): Spot {
  const { copiers, engine, others = 0 } = board;
  const copier = copiers[i];
  let { krarks, artists, mana, hand } = spot;
  const resolve = () => {
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
  mana -= copier.cost;
  if (engine === 'magecraft') {
    mana += artists;
  }
  for (let won = 0; won < wins; won++) {
    if (engine === 'magecraft') {
      mana += artists;
    }
    resolve();
  }
  if (wins === spot.krarks) {
    resolve();
    hand &= ~(1 << i);
  }
  return { krarks, artists, mana, hand };
}

/* With Krark's Thumb, whether to keep the win of a flip whose coins leave the choice, by the flip and the
   wins before it: the chance from where each number of wins leaves you, played back flip by flip, taking
   the win unless losing gives a better chance. */
function choices(board: Board, odds: KrarkOdds, spot: Spot, i: number) {
  const alike = 2 ** -(2 ** board.thumbs!);
  const flips = spot.krarks;
  const keeps = new Uint8Array(flips * (flips + 1));
  const worth = Float64Array.from({ length: flips + 1 }, (_, wins) => odds.at(after(board, spot, i, wins)).win);
  for (let flip = flips - 1; flip >= 0; flip--) {
    for (let wins = 0; wins <= flip; wins++) {
      const [lost, won] = [worth[wins], worth[wins + 1]];
      const keep = won >= lost - 1e-12;
      keeps[flip * (flips + 1) + wins] = keep ? 1 : 0;
      worth[wins] = alike * (lost + won) + (1 - 2 * alike) * (keep ? won : lost);
    }
  }
  return (flip: number, wins: number) => keeps[flip * (flips + 1) + wins] === 1;
}

/* The combo played trigger by trigger with real coin flips: every Krark on the battlefield as the spell
   is cast flips for it, and the first loss sends the card back to your hand. With Krark's Thumbs each
   flip is twice the coins for each, and you keep whichever coin `choices` says. Each spell cast is the
   one the odds pick, the cheapest you can pay for once they have none to pick. Ends with how the combo
   went. */
function play(board: Board, odds: KrarkOdds, start: Spot, random: () => number) {
  const { copiers, thumbs = 0 } = board;
  const coins = 2 ** thumbs;
  const plenty = thumbs ? PLENTY_WITH_THUMBS : PLENTY;
  let spot = start;
  for (;;) {
    const { krarks, mana, hand } = spot;
    if (hand === 0) {
      return 'used up';
    }
    if (krarks >= plenty) {
      return 'infinite';
    }
    const affordable = copiers.flatMap((copier, i) => (hand & (1 << i) && mana >= copier.cost ? [i] : []));
    if (affordable.length === 0) {
      return 'out of mana';
    }
    const picked = odds.at(spot).cast;
    const i = picked ?? affordable.reduce((a, b) => (copiers[b].cost < copiers[a].cost ? b : a));
    const keep = thumbs ? choices(board, odds, spot, i) : () => true;
    let wins = 0;
    for (let flip = 0; flip < krarks; flip++) {
      let won = 0;
      for (let coin = 0; coin < coins; coin++) {
        if (random() < 0.5) {
          won++;
        }
      }
      if (won === coins || (won > 0 && keep(flip, wins))) {
        wins++;
      }
    }
    spot = after(board, spot, i, wins);
  }
}

/* How often each ending comes up over many plays, against the odds worked out */
function expectPlayedOdds(board: Board, start: Spot, plays = 20_000) {
  const odds = krarkOdds(board.copiers, board.engine, board.others, board.thumbs);
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

  test("match the combo played with Krark's Thumbs, keeping the coin that gives the better chance", () => {
    expectPlayedOdds(
      { copiers: TEMPLATE, engine: 'legendary', thumbs: 1 },
      { krarks: 1, artists: 0, mana: 4, hand: 3 },
      10_000,
    );
    expectPlayedOdds(
      { copiers: TEMPLATE, engine: 'legendary', thumbs: 2 },
      { krarks: 1, artists: 0, mana: 3, hand: 3 },
      10_000,
    );
    expectPlayedOdds(
      { copiers: [INCURSION, DUPLICATION], engine: 'magecraft', thumbs: 1 },
      { krarks: 1, artists: 1, mana: 12, hand: 3 },
      10_000,
    );
    expectPlayedOdds(
      { copiers: [INCURSION, PRODUCTION], engine: 'creature', others: 2, thumbs: 1 },
      { krarks: 1, artists: 0, mana: 14, hand: 3 },
      10_000,
    );
  });

  test('a single Krark uses up its only spell with the first flip it wins', () => {
    const odds = krarkOdds(TEMPLATE, 'legendary');
    expect(odds.unlimited(1, 1)).toBe(0);
    /* short of losing every flip until the mana runs out */
    const lone = odds.at({ krarks: 1, artists: 0, mana: 100, hand: 1 });
    expect(lone.win).toBe(0);
    expect(lone.usedUp).toBeCloseTo(1 - 2 ** -50, 12);
    /* Krark's Thumb lets it lose on purpose, but that never makes a second Krark */
    expect(krarkOdds(TEMPLATE, 'legendary', 0, 1).unlimited(1, 1)).toBe(0);
  });

  test("with Krark's Thumb, losing a flip on purpose to cast again for free beats risking the spell", () => {
    /* Two Krarks and four Storm-Kiln Artists make back the last spell's cost in Treasures as it's cast.
       Losing the first flip whenever the coins let you, the spell is used up when both flips come up all
       wins, 1 in 16, and you are back where you were when the first is lost and the second comes up all
       losses, 3 in 16. Every other way, 12 in 16, you win one flip and have 8 Treasures. Only the casts
       that go anywhere count, so that's 12 of every 13. */
    const odds = krarkOdds([INCURSION, DUPLICATION], 'magecraft', 0, 1);
    const once = odds.at({ krarks: 3, artists: 4, mana: 8, hand: 2 }).win;
    expect(odds.at({ krarks: 2, artists: 4, mana: 4, hand: 2 }).win).toBeCloseTo((12 / 13) * once, 12);
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

  test("with Krark's Thumb and mana to spare, two spells go infinite about 49 times in 50", () => {
    /* A flip goes against your choice only when both coins come up alike, a win 1 time in 4 and a loss
       1 time in 4. Back from the last flip, each choice takes whichever of winning and losing gives the
       better chance, and losing every flip leaves you where you were, worth what the cast is: guessed
       again and again until it settles. */
    const alike = 1 / 4;
    const unlimited = new Map<string, number>();
    const chance = (krarks: number, spells: number): number => {
      if (spells === 0) {
        return 0;
      }
      if (krarks >= 200) {
        return 1;
      }
      const key = `${krarks} ${spells}`;
      if (!unlimited.has(key)) {
        const ends = Array.from({ length: krarks + 1 }, (_, wins) =>
          wins === krarks ? chance(2 * krarks + 1, spells - 1) : wins > 0 ? chance(krarks + wins, spells) : 0,
        );
        let self = 0;
        for (let guess = -1; Math.abs(self - guess) > 1e-15;) {
          guess = self;
          let worth = [guess, ...ends.slice(1)];
          for (let flip = krarks - 1; flip >= 0; flip--) {
            const next = worth;
            worth = next.slice(0, flip + 1).map((lost, wins) => {
              const won = next[wins + 1];
              return alike * (lost + won) + (1 - 2 * alike) * Math.max(lost, won);
            });
          }
          self = worth[0];
        }
        unlimited.set(key, self);
      }
      return unlimited.get(key)!;
    };
    const odds = krarkOdds(TEMPLATE, 'legendary', 0, 1);
    expect(odds.unlimited(1, 3)).toBeCloseTo(chance(1, 2), 12);
    expect(odds.unlimited(1, 3)).toBeCloseTo(0.9815, 4);
    /* the first win of a lone Krark still uses a spell up */
    expect(odds.unlimited(1, 3)).toBeCloseTo(odds.unlimited(3, 1), 12);
    expect(odds.at({ krarks: 1, artists: 0, mana: odds.most, hand: 3 }).win).toBeCloseTo(odds.unlimited(1, 3), 6);
  });

  test("never get worse with more mana, more Krarks or more Krark's Thumbs", () => {
    for (const [copiers, engine] of [
      [TEMPLATE, 'legendary'],
      [[INCURSION, DUPLICATION], 'magecraft'],
      [[INCURSION, PRODUCTION], 'creature'],
    ] as const) {
      const byThumbs = [0, 1, 2, 3].map((thumbs) => krarkOdds([...copiers], engine, 0, thumbs));
      byThumbs.forEach((odds, thumbs) => {
        for (const hand of [1, 2, 3]) {
          for (let krarks = 1; krarks < 12; krarks++) {
            for (let mana = 0; mana < 60; mana++) {
              const here = odds.at({ krarks, artists: 1, mana, hand }).win;
              expect(odds.at({ krarks, artists: 1, mana: mana + 1, hand }).win).toBeGreaterThanOrEqual(here - 1e-12);
              expect(odds.at({ krarks: krarks + 1, artists: 1, mana, hand }).win).toBeGreaterThanOrEqual(here - 1e-12);
              if (thumbs > 0) {
                const fewer = byThumbs[thumbs - 1].at({ krarks, artists: 1, mana, hand }).win;
                expect(here).toBeGreaterThanOrEqual(fewer - 1e-11);
              }
            }
          }
        }
      });
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

test('counts the clones that copy Krark before the combo starts, but not what only lifts the legend rule', () => {
  expect(specFor(krarkFlips, SAKASHIMA)).toEqual({
    widget: 'krark-flips',
    engine: 'Relic of Legends',
    spells: [{ everyNontoken: false }, { everyNontoken: false }],
    clones: [{ name: 'Sakashima of a Thousand Faces' }],
  });
  for (const id of [RELIC, SHAKU] as const) {
    expect(specFor(krarkFlips, id)).not.toHaveProperty('clones');
  }
});

const FLIPS = 'Resolve all Krark triggers, copying that spell for each flip you won.';
const KEEPS_LEGENDARY = 'Instant/Sorcery that Copies a Legendary Creature You Control without Bypassing Legend Rule';
const ANY_COPY = 'Instant or Sorcery that Creates One or More Copies of a Creature You Control';

test('takes a single copying spell, named or left to a template, alongside a clone', () => {
  const withDouble = (battlefieldCardState: string) =>
    krarkFlips.detect(
      fakeVariant({
        uses: [
          'Krark, the Thumbless',
          'Storm-Kiln Artist',
          { name: 'Spark Double', battlefieldCardState },
          "Irenicus's Vile Duplication",
        ],
        description: FLIPS,
      }),
    );
  expect(withDouble('as a copy of Krark')).toEqual({
    engine: 'Storm-Kiln Artist',
    spells: [{ name: "Irenicus's Vile Duplication", cost: 4, everyNontoken: false }],
    clones: [{ name: 'Spark Double' }],
  });
  /* a copy of the Artist is no Krark */
  expect(withDouble('as a copy of Storm-Kiln Artist')).not.toHaveProperty('clones');
  expect(
    krarkFlips.detect(
      fakeVariant({
        uses: ['Krark, the Thumbless', 'Relic of Legends'],
        requires: [KEEPS_LEGENDARY, "Clone — Can Copy Opponent's Creatures"],
        description: FLIPS,
      }),
    ),
  ).toEqual({ engine: 'Relic of Legends', spells: [{ everyNontoken: false }], clones: [{}] });
  /* a named spell and one left to a template */
  expect(
    krarkFlips.detect(
      fakeVariant({
        uses: ['Krark, the Thumbless', 'Earthcraft', 'Ember Island Production'],
        requires: [ANY_COPY],
        description: FLIPS,
      }),
    )?.spells,
  ).toEqual([{ name: 'Ember Island Production', cost: 5, everyNontoken: false }, { everyNontoken: false }]);
});

test('takes only copies that stay legendary where the mana comes from legends', () => {
  const relic = (requires: string[]) =>
    krarkFlips.detect(
      fakeVariant({ uses: ['Krark, the Thumbless', 'Relic of Legends'], requires, description: FLIPS }),
    );
  expect(relic([ANY_COPY])).toBeUndefined();
  expect(relic([KEEPS_LEGENDARY])?.spells).toHaveLength(1);
  /* no more than two copying spells */
  expect(
    krarkFlips.detect(
      fakeVariant({
        uses: ['Krark, the Thumbless', 'Storm-Kiln Artist', "Irenicus's Vile Duplication", 'Quantum Misalignment'],
        requires: [ANY_COPY],
        description: FLIPS,
      }),
    ),
  ).toBeUndefined();
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
  test('asks for the mana values of the spells the combo leaves to you, next to which ones you have', () => {
    expect(calculatorFor(krarkFlips, RELIC).inputs.map(({ key, label, initial }) => [key, label, initial])).toEqual([
      ['mana', 'Mana you have', 10],
      ['firstCost', 'Mana value of the first copying spell', 2],
      ['secondCost', 'Mana value of the second copying spell', 3],
      ['hand', 'Copying spells in your hand', '3'],
      ['krarks', 'Krarks you control', 1],
      ['thumbs', "Krark's Thumbs you control", 0],
    ]);
    expect(calculatorFor(krarkFlips, KILN).inputs.map(({ key, initial }) => [key, initial])).toEqual([
      ['mana', 18],
      ['hand', '3'],
      ['krarks', 1],
      ['thumbs', 0],
    ]);
    /* what the board holds besides Krarks comes after the Thumbs */
    expect(calculatorFor(krarkFlips, KILN_INCURSION).inputs.map(({ key }) => key)).toEqual([
      'mana',
      'hand',
      'krarks',
      'thumbs',
      'artists',
    ]);
    expect(calculatorFor(krarkFlips, EARTHCRAFT_INCURSION).inputs.map(({ key }) => key)).toEqual([
      'mana',
      'hand',
      'krarks',
      'thumbs',
      'others',
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

  test("counts Krark's Thumbs, keeping the coin you like", () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    expect(calculator.summary).toContain("with Krark's Thumb take every win unless losing the flip");
    const result = run(calculator, { numbers: { thumbs: 1 } });
    expect(result.headline).toEqual({ label: 'Chance of going infinite', value: '97.1%' });
    expect(result.stats).toEqual([
      { label: 'Runs out of mana', value: '0.8%', caption: 'with a copying spell still in hand' },
      { label: 'Uses up both spells', value: '2.1%', caption: 'each by winning every flip of a cast' },
      { label: 'With unlimited mana', value: '98.2%', caption: 'the best these spells can do' },
      { label: 'Cast first', value: 'The cheaper spell', caption: '96.3% the other way around' },
    ]);
    expect(run(calculatorFor(krarkFlips, EARTHCRAFT_INCURSION), { numbers: { thumbs: 1 } }).headline.value).toBe(
      '89.4%',
    );
    /* sixteen coins a flip with four: one coming up against you is too rare to show */
    expect(run(calculator, { numbers: { thumbs: 4, mana: 3 } }).headline.value).toBe('>99.9%');
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

  test('starts from a Krark for each clone the combo uses', () => {
    const krarks = (id: typeof RELIC | typeof SAKASHIMA) =>
      calculatorFor(krarkFlips, id).inputs.find((input) => input.key === 'krarks')!;
    expect(krarks(RELIC)).toMatchObject({ initial: 1, hint: expect.stringMatching(/^Krark and its copies: /) });
    expect(krarks(SAKASHIMA)).toMatchObject({
      initial: 2,
      hint: 'Krark and its copies, Sakashima of a Thousand Faces among them: change it as the combo goes to see where you stand.',
    });
    expect(run(calculatorFor(krarkFlips, SAKASHIMA)).headline.value).toBe('97.6%');
    const templated = krarkFlips.calculator({
      engine: 'Relic of Legends',
      spells: [{ everyNontoken: false }, { everyNontoken: false }],
      clones: [{ name: 'Spark Double' }, {}],
    });
    expect(templated.inputs.find((input) => input.key === 'krarks')).toMatchObject({
      initial: 3,
      hint: expect.stringMatching(/^Krark and its copies, Spark Double and a clone among them: /),
    });
  });

  test('plays a single copying spell to the end, with nothing to choose from in hand', () => {
    const calculator = krarkFlips.calculator({
      engine: 'Storm-Kiln Artist',
      spells: [{ name: "Irenicus's Vile Duplication", cost: 4, everyNontoken: false }],
      clones: [{ name: 'Spark Double' }],
    });
    expect(calculator.inputs.map(({ key, initial }) => [key, initial])).toEqual([
      ['mana', 8],
      ['krarks', 2],
      ['thumbs', 0],
    ]);
    expect(calculator.summary).toMatch(/^Each Krark flips a coin whenever you cast Irenicus's Vile Duplication\. /);
    expect(calculator.summary).toContain("The loop stops once it is, or once you can't pay for the next cast.");
    expect(calculator.summary).toContain("With Krark's Thumb the odds take every win");
    const result = run(calculator);
    expect(result.stats?.map((stat) => stat.label)).toEqual([
      'Runs out of mana',
      'Uses up the spell',
      'With unlimited mana',
    ]);
    /* a single Krark wins its only flip just by using its only spell up */
    expect(run(calculator, { numbers: { krarks: 1 } }).headline.value).toBe('0%');
    const left = krarkFlips.calculator({ engine: 'Relic of Legends', spells: [{ everyNontoken: false }] });
    expect(left.inputs.find((input) => input.key === 'firstCost')).toMatchObject({
      label: 'Mana value of the copying spell',
      initial: 2,
    });
    expectSaneAtExtremes(calculator);
    expectSaneAtExtremes(left);
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
    const withThumb = { numbers: { thumbs: 1 } };
    expectSteadyFrom(calculator, 'krarks', 2, withThumb);
    expectSteadyFrom(calculator, 'mana', 21, withThumb);
    const [, fromOne] = run(calculator, { numbers: { thumbs: 2 } }).charts!;
    expect(fromOne.dots.map((dot) => dot.label)).toEqual(['1 or more Krarks: >99.9%']);
  });

  test('stays quick and sane at every extreme', () => {
    for (const id of [RELIC, SHAKU, SAKASHIMA, KILN, KILN_INCURSION, EARTHCRAFT_INCURSION] as const) {
      expectSaneAtExtremes(calculatorFor(krarkFlips, id));
    }
  });
});
