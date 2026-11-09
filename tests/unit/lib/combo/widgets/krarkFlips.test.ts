import { describe, expect, test } from 'vitest';
import {
  type Copier,
  type Engine,
  type KrarkOdds,
  type Ritual,
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
/* a copying spell left to a template, with Sakashima of a Thousand Faces as a second Krark */
const SHAKU_SAKASHIMA = '1704-2466-2719--221';
const EARTHCRAFT_DOUBLE = '1704-2757-3908--221';
const KILN_CLONE_MASTER = '1704-5195-8341--221';
/* the mana from a mana ritual the Krarks copy, with one copying spell left to a template or two named */
const RITUAL_SAKASHIMA = '1704-2719--221--232';
const RITUAL_INCURSION = '1704-7063-7694--232';

const TEMPLATE: Copier[] = [
  { cost: 2, everyNontoken: false },
  { cost: 3, everyNontoken: false },
];
const DUPLICATION: Copier = { cost: 4, everyNontoken: false };
const PRODUCTION: Copier = { cost: 5, everyNontoken: false };
const INCURSION: Copier = { cost: 7, everyNontoken: true };
const MOLTEN: Copier = { cost: 2, everyNontoken: false };

const DARK_RITUAL: Ritual = { cost: 1, makes: 3, perKrark: false };
const MANAMORPHOSE: Ritual = { cost: 2, makes: 2, perKrark: false };
const PYRETIC_RITUAL: Ritual = { cost: 2, makes: 3, perKrark: false };
/* a mana for each Goblin, and every Krark is one */
const BRIGHTSTONE_RITUAL: Ritual = { cost: 1, makes: 1, perKrark: true };
/* a mana for each tapped land your opponents control, six here: dearer than Molten Duplication */
const MANA_GEYSER: Ritual = { cost: 5, makes: 6, perKrark: false };

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
  ritual?: Ritual;
}

/* Far past where anything could still stop the loop: sooner with Krark's Thumb, which wins nearly every
   flip and loses one whenever that keeps the last spell, so that from 32 Krarks the chance of the spells
   running out is too small for a double to hold */
const PLENTY = 300;
const PLENTY_WITH_THUMBS = 32;

/* Where casting spell `i` and winning `wins` of its flips leaves you: each win puts a copy on the stack
   that resolves before the next flip, and winning every flip resolves the card too and uses it up. Every
   Storm-Kiln Artist makes a Treasure for the cast and for each copy. The mana ritual comes after the
   copying spells, and it and each copy of it make its mana, for each Krark if it says so. */
function after(board: Board, spot: Spot, i: number, wins: number): Spot {
  const { copiers, engine, others = 0, ritual } = board;
  let { krarks, artists, mana, hand } = spot;
  if (i === copiers.length) {
    const made = ritual!.makes * (ritual!.perKrark ? krarks : 1);
    mana += made * wins - ritual!.cost;
    if (wins === krarks) {
      mana += made;
      hand &= ~(1 << i);
    }
    return { krarks, artists, mana, hand };
  }
  const copier = copiers[i];
  const resolve = () => {
    krarks++;
    if (engine === 'legendary') {
      mana++;
    } else if (engine === 'creature') {
      /* every nontoken creature: Krark and the rest */
      mana += copier.everyNontoken ? 1 + others : 1;
    } else if (engine === 'magecraft' && copier.everyNontoken) {
      /* the Artist too */
      artists++;
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
   the win unless losing gives a better chance, or neither way has any. */
function choices(board: Board, odds: KrarkOdds, spot: Spot, i: number) {
  const alike = 2 ** -(2 ** board.thumbs!);
  const flips = spot.krarks;
  const keeps = new Uint8Array(flips * (flips + 1));
  const worth = Float64Array.from({ length: flips + 1 }, (_, wins) => odds.at(after(board, spot, i, wins)).win);
  for (let flip = flips - 1; flip >= 0; flip--) {
    for (let wins = 0; wins <= flip; wins++) {
      const [lost, won] = [worth[wins], worth[wins + 1]];
      const keep = won > 0 && won >= lost - 1e-12;
      keeps[flip * (flips + 1) + wins] = keep ? 1 : 0;
      worth[wins] = alike * (lost + won) + (1 - 2 * alike) * (keep ? won : lost);
    }
  }
  return (flip: number, wins: number) => keeps[flip * (flips + 1) + wins] === 1;
}

/* The combo played trigger by trigger with real coin flips: every Krark on the battlefield as the spell
   is cast flips for it, and the first loss sends the card back to your hand. With Krark's Thumbs each
   flip is twice the coins for each, and you keep whichever coin `choices` says. Each spell cast is the
   one the odds pick; once they have none to pick, the cheapest copying spell you can pay for and still
   cast the mana ritual after, or else the ritual. With the ritual used up or too dear to cast nothing
   makes mana, so so many Krarks run out of it long before a cast wins every flip. Ends with how the
   combo went. */
function play(board: Board, odds: KrarkOdds, start: Spot, random: () => number) {
  const { copiers, thumbs = 0, ritual } = board;
  const coins = 2 ** thumbs;
  const plenty = thumbs ? PLENTY_WITH_THUMBS : PLENTY;
  const copying = (1 << copiers.length) - 1;
  const ritualBit = ritual ? 1 << copiers.length : 0;
  let spot = start;
  for (;;) {
    const { krarks, mana, hand } = spot;
    if ((hand & copying) === 0) {
      return 'used up';
    }
    if (krarks >= plenty) {
      return (hand & ritualBit) === ritualBit && mana >= (ritual?.cost ?? 0) ? 'infinite' : 'out of mana';
    }
    const affordable = copiers.flatMap((copier, i) => (hand & (1 << i) && mana >= copier.cost ? [i] : []));
    const ritualAffordable = hand & ritualBit && mana >= ritual!.cost;
    if (affordable.length === 0 && !ritualAffordable) {
      return 'out of mana';
    }
    const cheapest = affordable.reduce((a, b) => (copiers[b].cost < copiers[a].cost ? b : a), affordable[0]);
    const i =
      odds.at(spot).cast ??
      (ritualAffordable && (cheapest === undefined || mana < copiers[cheapest].cost + ritual!.cost)
        ? copiers.length
        : cheapest);
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
  const odds = krarkOdds(board.copiers, board.engine, board);
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

  test('match the odds worked out the plain way, at every spot', () => {
    expectPlainOdds({ copiers: TEMPLATE, engine: 'legendary' });
    expectPlainOdds({ copiers: TEMPLATE, engine: 'legendary', thumbs: 2 });
    expectPlainOdds({ copiers: [MOLTEN, { cost: 3, everyNontoken: true }], engine: 'creature', others: 1 });
    expectPlainOdds({ copiers: [{ cost: 1, everyNontoken: false }], engine: 'magecraft', thumbs: 1 });
  });

  test('count the mana a cast leaves you ahead by where the Artists outnumber what a spell costs', () => {
    /* Two Artists make a Treasure more than the cheaper spell costs each time it's cast, so even a cast that
       loses every flip leaves a mana more toward the dearer one */
    const board: Board = {
      copiers: [
        { cost: 1, everyNontoken: false },
        { cost: 3, everyNontoken: true },
      ],
      engine: 'magecraft',
    };
    expectPlainOdds(board);
    expectPlainOdds({ ...board, thumbs: 1 });
    /* three Artists and a single mana: casts lost are what pays for Multiversal Incursion */
    expectPlayedOdds(
      { copiers: [{ cost: 1, everyNontoken: false }, INCURSION], engine: 'magecraft' },
      { krarks: 1, artists: 3, mana: 1, hand: 3 },
    );
    /* five Artists making a Treasure more than Irenicus's Vile Duplication costs */
    const odds = krarkOdds([INCURSION, DUPLICATION], 'magecraft');
    expect(odds.at({ krarks: 1, artists: 5, mana: 4, hand: 3 }).win).toBeCloseTo(0.7958, 4);
  });

  test('a single Krark uses up its only spell with the first flip it wins', () => {
    const odds = krarkOdds(TEMPLATE, 'legendary');
    expect(odds.unlimited(1, 1)).toBe(0);
    /* short of losing every flip until the mana runs out */
    const lone = odds.at({ krarks: 1, artists: 0, mana: 100, hand: 1 });
    expect(lone.win).toBe(0);
    expect(lone.usedUp).toBeCloseTo(1 - 2 ** -50, 12);
    /* Krark's Thumb lets it lose on purpose, but that never makes a second Krark */
    expect(krarkOdds(TEMPLATE, 'legendary', { thumbs: 1 }).unlimited(1, 1)).toBe(0);
  });

  test("with Krark's Thumb and nothing left to win, a flip is lost to keep the spell", () => {
    /* A lone Krark can only use its last spell up, so where the coins leave a choice it loses the flip. Six
       mana pay for three casts, and each uses the spell up only when both coins come up a win, 1 time in 4:
       otherwise the mana runs out with the spell still in hand. */
    const lone = krarkOdds(TEMPLATE, 'legendary', { thumbs: 1 }).at({ krarks: 1, artists: 0, mana: 6, hand: 1 });
    expect(lone.win).toBe(0);
    expect(lone.usedUp).toBeCloseTo(1 - 0.75 ** 3, 12);
    expect(outOfMana(lone)).toBeCloseTo(0.75 ** 3, 12);
  });

  test('a lone Krark with its last spell uses it up a cast at a time, however much the mana', () => {
    /* Every cast is a single flip that uses the spell up when won, as often whatever the mana: half the
       time, or with Krark's Thumbs only when every coin comes up a win. So the mana only says how many
       casts there are, far past what the table keeps count of. */
    const manas = (most: number) => [0, 1, 5, most - 1, most, most + 1, most + 7, 1000, 12_345, 1e9];
    for (const thumbs of [0, 1, 2, 3, 4]) {
      const lost = 1 - 2 ** -(2 ** thumbs);
      const relic = krarkOdds(TEMPLATE, 'legendary', { thumbs });
      for (const mana of manas(relic.most)) {
        const lone = relic.at({ krarks: 1, artists: 0, mana, hand: 1 });
        expect(lone.win).toBe(0);
        expect(outOfMana(lone), `${thumbs} ${mana}`).toBeCloseTo(lost ** Math.floor(mana / 2), 12);
      }
      /* the Treasure the Artist makes for each cast leaves it three mana short of the four it cost */
      const kiln = krarkOdds([DUPLICATION], 'magecraft', { thumbs });
      for (const mana of manas(kiln.most)) {
        const casts = mana < 4 ? 0 : Math.floor((mana - 4) / 3) + 1;
        const lone = kiln.at({ krarks: 1, artists: 1, mana, hand: 1 });
        expect(outOfMana(lone), `${thumbs} ${mana}`).toBeCloseTo(lost ** casts, 12);
      }
    }
  });

  test("with Krark's Thumb, losing a flip on purpose to cast again for free beats risking the spell", () => {
    /* Two Krarks and four Storm-Kiln Artists make back the last spell's cost in Treasures as it's cast.
       Losing the first flip whenever the coins let you, the spell is used up when both flips come up all
       wins, 1 in 16, and you are back where you were when the first is lost and the second comes up all
       losses, 3 in 16. Every other way, 12 in 16, you win one flip and have 8 Treasures. Only the casts
       that go anywhere count, so that's 12 of every 13. */
    const odds = krarkOdds([INCURSION, DUPLICATION], 'magecraft', { thumbs: 1 });
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
    expect(odds.unlimited(1, 3)).toBeCloseTo(chance(3), 9);
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
    const odds = krarkOdds(TEMPLATE, 'legendary', { thumbs: 1 });
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
      const byThumbs = [0, 1, 2, 3].map((thumbs) => krarkOdds([...copiers], engine, { thumbs }));
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

/* The chance of going infinite worked out the plain way for every spot the table holds: from the most
   Krarks down, every spot with that many gone over again and again, each from where the others stand,
   until none changes. A cast either makes a Krark more, which is worked out already, or comes back to
   the same Krarks, as the mana ritual does and any cast that loses every flip. With Krark's Thumbs each
   flip that leaves a choice goes the way that gives the better chance. Past the horizon, or with an
   Artist for every mana the dearest spell costs, it's the chance with mana to spare while something
   still makes mana, and nothing otherwise. */
function plainOdds(board: Board, odds: KrarkOdds) {
  const { copiers, thumbs = 0, ritual } = board;
  const { horizon, most } = odds;
  const costs = [...copiers.map((copier) => copier.cost), ...(ritual ? [ritual.cost] : [])];
  const hands = 1 << costs.length;
  const copying = (1 << copiers.length) - 1;
  const ritualBit = ritual ? 1 << copiers.length : 0;
  const artistsRange = artistsOf(board);
  const mostArtists = artistsRange.at(-1)!;
  const alike = 2 ** -(2 ** thumbs);
  const table = Array.from({ length: horizon }, () => new Float64Array((mostArtists + 1) * hands * (most + 1)));
  const slot = (artists: number, hand: number, mana: number) => (artists * hands + hand) * (most + 1) + mana;
  const chance = ({ krarks, artists, hand, ...spot }: Spot): number => {
    const mana = Math.min(spot.mana, most);
    if ((hand & copying) === 0 || !costs.some((cost, i) => hand & (1 << i) && mana >= cost)) {
      return 0;
    }
    if (krarks >= horizon || artists > mostArtists) {
      return (hand & ritualBit) === ritualBit && mana >= (ritual?.cost ?? 0) ? odds.unlimited(krarks, hand) : 0;
    }
    return table[krarks][slot(artists, hand, mana)];
  };
  for (let krarks = horizon - 1; krarks >= 1; krarks--) {
    const worth = new Float64Array(krarks + 1);
    for (let changed = true; changed;) {
      changed = false;
      for (const artists of artistsRange) {
        for (let hand = 1; hand < hands; hand++) {
          for (let mana = 0; mana <= most && (hand & copying) !== 0; mana++) {
            let best = 0;
            for (let i = 0; i < costs.length; i++) {
              if (!(hand & (1 << i)) || mana < costs[i]) {
                continue;
              }
              for (let wins = 0; wins <= krarks; wins++) {
                worth[wins] = chance(after(board, { krarks, artists, mana, hand }, i, wins));
              }
              for (let flip = krarks - 1; flip >= 0; flip--) {
                for (let wins = 0; wins <= flip; wins++) {
                  const lost = worth[wins];
                  const won = worth[wins + 1];
                  worth[wins] = alike * (lost + won) + (1 - 2 * alike) * Math.max(lost, won);
                }
              }
              best = Math.max(best, worth[0]);
            }
            const at = slot(artists, hand, mana);
            changed ||= Math.abs(best - table[krarks][at]) > 1e-13;
            table[krarks][at] = best;
          }
        }
      }
    }
  }
  return chance;
}

/* the Storm-Kiln Artists the table keeps count of: short of one for every mana the dearest spell costs
   where a spell copies them, and otherwise the one the combo has, if any */
function artistsOf({ copiers, engine }: Board): number[] {
  if (engine !== 'magecraft') {
    return [0];
  }
  const dearest = Math.max(...copiers.map((copier) => copier.cost));
  return copiers.some((copier) => copier.everyNontoken) ? Array.from({ length: dearest - 1 }, (_, i) => i + 1) : [1];
}

/* the odds at every spot the table holds, against the plain way */
function expectPlainOdds(board: Board) {
  const odds = krarkOdds(board.copiers, board.engine, board);
  const plain = plainOdds(board, odds);
  const hands = 1 << (board.copiers.length + (board.ritual ? 1 : 0));
  let worst = 0;
  let where = '';
  for (let krarks = 1; krarks < odds.horizon; krarks++) {
    for (const artists of artistsOf(board)) {
      for (let hand = 1; hand < hands; hand++) {
        for (let mana = 0; mana <= odds.most; mana++) {
          const spot = { krarks, artists, mana, hand };
          const off = Math.abs(odds.at(spot).win - plain(spot));
          if (off > worst) {
            worst = off;
            where = JSON.stringify(spot);
          }
        }
      }
    }
  }
  expect(worst, where).toBeLessThan(5e-10);
}

describe('the odds with a mana ritual', () => {
  test('match the odds worked out the plain way, at every spot', () => {
    expectPlainOdds({ copiers: [MOLTEN], engine: 'ritual', ritual: MANAMORPHOSE });
    expectPlainOdds({ copiers: [MOLTEN, { cost: 3, everyNontoken: false }], engine: 'ritual', ritual: DARK_RITUAL });
    expectPlainOdds({ copiers: [MOLTEN], engine: 'ritual', ritual: BRIGHTSTONE_RITUAL });
    expectPlainOdds({ copiers: [MOLTEN], engine: 'ritual', ritual: MANA_GEYSER });
    expectPlainOdds({ copiers: [MOLTEN], engine: 'ritual', ritual: PYRETIC_RITUAL, thumbs: 1 });
  });

  test('match the plain way where a cast can give back just the mana the ritual cost', () => {
    /* six of the flips won make the six mana it cost, with the ritual back in hand: where you were */
    const board: Board = {
      copiers: [{ cost: 1, everyNontoken: false }],
      engine: 'ritual',
      ritual: { cost: 6, makes: 1, perKrark: false },
    };
    expectPlainOdds(board);
    expectPlainOdds({ ...board, thumbs: 1 });
  });

  test('match the combo played flip by flip, ritual and all', () => {
    expectPlayedOdds(
      { copiers: [MOLTEN], engine: 'ritual', ritual: MANAMORPHOSE },
      { krarks: 2, artists: 0, mana: 4, hand: 3 },
    );
    expectPlayedOdds(
      { copiers: [INCURSION, PRODUCTION], engine: 'ritual', ritual: DARK_RITUAL },
      { krarks: 1, artists: 0, mana: 12, hand: 7 },
    );
    expectPlayedOdds(
      { copiers: [MOLTEN], engine: 'ritual', ritual: BRIGHTSTONE_RITUAL },
      { krarks: 2, artists: 0, mana: 3, hand: 3 },
    );
    expectPlayedOdds(
      { copiers: [MOLTEN], engine: 'ritual', ritual: MANA_GEYSER },
      { krarks: 2, artists: 0, mana: 7, hand: 3 },
    );
  });

  test('go nowhere on mana that pays for a copying spell but not for a dearer ritual', () => {
    /* Molten Duplication makes no mana: four are two casts of it and then nothing, however many the Krarks */
    const odds = krarkOdds([MOLTEN], 'ritual', { ritual: MANA_GEYSER });
    for (const krarks of [3, odds.horizon - 1, odds.horizon, 1000]) {
      expect(odds.at({ krarks, artists: 0, mana: 4, hand: 3 }).win).toBe(0);
    }
    expect(odds.at({ krarks: 1000, artists: 0, mana: 5, hand: 3 }).win).toBeCloseTo(1, 6);
  });

  test("match the combo played with Krark's Thumbs, which can keep the ritual too", () => {
    expectPlayedOdds(
      { copiers: [MOLTEN], engine: 'ritual', ritual: PYRETIC_RITUAL, thumbs: 1 },
      { krarks: 1, artists: 0, mana: 3, hand: 3 },
      10_000,
    );
    expectPlayedOdds(
      { copiers: [INCURSION, PRODUCTION], engine: 'ritual', ritual: MANAMORPHOSE, thumbs: 1 },
      { krarks: 1, artists: 0, mana: 9, hand: 7 },
      10_000,
    );
  });

  test('go nowhere once the ritual is used up, nothing else making mana', () => {
    const odds = krarkOdds([MOLTEN], 'ritual', { ritual: DARK_RITUAL });
    for (const mana of [2, 10, odds.most]) {
      expect(odds.at({ krarks: 5, artists: 0, mana, hand: 1 }).win).toBe(0);
    }
    /* With two Krarks and a mana, only the ritual can be cast: losing both flips leaves nothing, and winning
       both makes 9 mana but uses it up. Winning one leaves 3 mana with the ritual back in hand. */
    const back = odds.at({ krarks: 2, artists: 0, mana: 3, hand: 3 }).win;
    expect(odds.at({ krarks: 2, artists: 0, mana: 1, hand: 3 }).win).toBeCloseTo(back / 2, 12);
  });

  test("with Krark's Thumbs, a combo that lost its ritual runs out of mana on either side of the horizon", () => {
    /* nothing left to win, so every flip that leaves a choice is lost and the spell stays in hand */
    const odds = krarkOdds([MOLTEN], 'ritual', { ritual: MANAMORPHOSE, thumbs: 2 });
    for (const krarks of [odds.horizon - 1, odds.horizon]) {
      const lost = odds.at({ krarks, artists: 0, mana: 10, hand: 1 });
      expect(lost.win).toBe(0);
      expect(lost.usedUp).toBeLessThan(1e-6);
      expect(outOfMana(lost)).toBeGreaterThan(1 - 1e-6);
    }
  });

  test('count the casts of a lone Krark past the mana kept count of, the ritual in hand or used up', () => {
    const odds = krarkOdds([{ cost: 3, everyNontoken: false }], 'ritual', {
      thumbs: 2,
      ritual: { cost: 2, makes: 1000, perKrark: false },
    });
    const lone = (mana: number) => odds.at({ krarks: 1, artists: 0, mana, hand: 3 });
    /* Two mana pay for the ritual alone. Its flip is won 1 time in 16, which uses it up for two thousand
       mana: 666 casts of the copying spell, each using it up 1 time in 16. */
    expect(lone(2).win).toBe(0);
    expect(lone(2).usedUp).toBeCloseTo((1 - (15 / 16) ** 666) / 16, 12);
    /* with the ritual still in hand, one more cast of the copying spell keeps it 15 times in 16 */
    for (const mana of [odds.most - 2, odds.most, odds.most + 1, 5000]) {
      expect(outOfMana(lone(mana + 3)), `${mana}`).toBeCloseTo((15 / 16) * outOfMana(lone(mana)), 12);
    }
  });

  test("never get worse with more mana, more Krarks, more mana from the ritual or more Krark's Thumbs", () => {
    for (const thumbs of [0, 1]) {
      const byMana = [1, 2, 3, 4].map((makes) =>
        krarkOdds([MOLTEN, { cost: 3, everyNontoken: false }], 'ritual', {
          thumbs,
          ritual: { cost: 2, makes, perKrark: false },
        }),
      );
      byMana.forEach((odds, more) => {
        for (const hand of [3, 5, 7]) {
          for (let krarks = 1; krarks < 12; krarks++) {
            for (let mana = 0; mana < 40; mana++) {
              const here = odds.at({ krarks, artists: 0, mana, hand }).win;
              expect(odds.at({ krarks, artists: 0, mana: mana + 1, hand }).win).toBeGreaterThanOrEqual(here - 1e-12);
              expect(odds.at({ krarks: krarks + 1, artists: 0, mana, hand }).win).toBeGreaterThanOrEqual(here - 1e-12);
              if (more > 0) {
                expect(here).toBeGreaterThanOrEqual(
                  byMana[more - 1].at({ krarks, artists: 0, mana, hand }).win - 1e-12,
                );
              }
            }
          }
        }
      });
    }
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

test('takes the mana from a mana ritual the Krarks copy when nothing else makes it', () => {
  expect(specFor(krarkFlips, RITUAL_INCURSION)).toEqual({
    widget: 'krark-flips',
    engine: 'Mana Ritual',
    spells: [
      { name: 'Multiversal Incursion', cost: 7, everyNontoken: true },
      { name: 'Ember Island Production', cost: 5, everyNontoken: false },
    ],
  });
  expect(specFor(krarkFlips, RITUAL_SAKASHIMA)).toEqual({
    widget: 'krark-flips',
    engine: 'Mana Ritual',
    spells: [{ everyNontoken: false }],
    clones: [{ name: 'Sakashima of a Thousand Faces' }],
  });
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
  expect(specFor(krarkFlips, SHAKU_SAKASHIMA)).toEqual({
    widget: 'krark-flips',
    engine: 'Honor-Worn Shaku',
    spells: [{ everyNontoken: false }],
    clones: [{ name: 'Sakashima of a Thousand Faces' }],
  });
  expect(specFor(krarkFlips, EARTHCRAFT_DOUBLE)).toMatchObject({
    engine: 'Earthcraft',
    clones: [{ name: 'Spark Double' }],
  });
  expect(specFor(krarkFlips, KILN_CLONE_MASTER)).toMatchObject({
    engine: 'Storm-Kiln Artist',
    clones: [{ name: 'Colossal Clone Master' }],
  });
});

const FLIPS = 'Resolve all Krark triggers, copying that spell for each flip you won.';
const KEEPS_LEGENDARY = 'Instant/Sorcery that Copies a Legendary Creature You Control without Bypassing Legend Rule';
const ANY_COPY = 'Instant or Sorcery that Creates One or More Copies of a Creature You Control';
const NONLEGENDARY_COPY = 'Instant or Sorcery that Creates One or More Nonlegendary Copies of a Creature You Control';

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

test('takes only copies that can stay legendary where the mana comes from legends', () => {
  const relic = (requires: string[]) =>
    krarkFlips.detect(
      fakeVariant({ uses: ['Krark, the Thumbless', 'Relic of Legends'], requires, description: FLIPS }),
    );
  expect(relic([NONLEGENDARY_COPY])).toBeUndefined();
  expect(relic([ANY_COPY])?.spells).toHaveLength(1);
  expect(relic([KEEPS_LEGENDARY])?.spells).toHaveLength(1);
  /* where the mana comes from the ritual, any copy will do */
  expect(
    krarkFlips.detect(
      fakeVariant({ uses: ['Krark, the Thumbless'], requires: ['Mana Ritual', NONLEGENDARY_COPY], description: FLIPS }),
    ),
  ).toEqual({ engine: 'Mana Ritual', spells: [{ everyNontoken: false }] });
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

  test("says how a combo with nothing left to win ends with Krark's Thumb, and counts it so", () => {
    const explained =
      'With the Thumb and no way left to go infinite, they lose the flip as well: such a combo counts as running out of mana, a copying spell still in hand, rather than as using it up.';
    const calculator = calculatorFor(krarkFlips, RELIC);
    for (const id of [RELIC, SHAKU_SAKASHIMA, RITUAL_INCURSION] as const) {
      expect(calculatorFor(krarkFlips, id).summary.endsWith(explained)).toBe(true);
    }
    /* a lone Krark with its last spell and six mana: three casts, each used up 1 time in 4 */
    const lone = run(calculator, { numbers: { krarks: 1, mana: 6, thumbs: 1 }, choices: { hand: '1' } });
    expect(lone.headline.value).toBe('0%');
    expect(lone.stats?.slice(0, 2).map(({ label, value }) => [label, value])).toEqual([
      ['Runs out of mana', '42.2%'],
      ['Uses up the spell', '57.8%'],
    ]);
  });

  test('counts the casts of a lone Krark with its last spell however much the mana', () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    const lone = (thumbs: number, mana?: number) => ({
      numbers: { krarks: 1, thumbs, ...(mana !== undefined && { mana }) },
      choices: { hand: '1' },
    });
    /* each cast of the two-mana spell uses it up 1 time in 16 with two Thumbs, 1 in 65,536 with four: 118
       casts make that all but sure, or half a million */
    expectSteadyFrom(calculator, 'mana', 236, lone(2));
    expectSteadyFrom(calculator, 'mana', 996_258, lone(4));
    expect(run(calculator, lone(2, 100)).stats?.[1]).toMatchObject({ label: 'Uses up the spell', value: '96%' });
    expect(run(calculator, lone(4, 1e9)).stats?.[1]).toMatchObject({ label: 'Uses up the spell', value: '>99.9%' });
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

  test('asks what the mana ritual costs and makes, next to the spells, where the mana comes from one', () => {
    expect(
      calculatorFor(krarkFlips, RITUAL_INCURSION).inputs.map(({ key, label, initial }) => [key, label, initial]),
    ).toEqual([
      ['mana', 'Mana you have', 24],
      ['ritualCost', 'Mana value of the mana ritual', 2],
      ['ritualMana', 'Mana the mana ritual makes', 2],
      ['ritualPer', 'Mana ritual makes', 'spell'],
      ['hand', 'Copying spells in your hand', '3'],
      ['krarks', 'Krarks you control', 1],
      ['thumbs', "Krark's Thumbs you control", 0],
    ]);
    expect(calculatorFor(krarkFlips, RITUAL_SAKASHIMA).inputs.map(({ key, initial }) => [key, initial])).toEqual([
      ['mana', 4],
      ['firstCost', 2],
      ['ritualCost', 2],
      ['ritualMana', 2],
      ['ritualPer', 'spell'],
      ['krarks', 2],
      ['thumbs', 0],
    ]);
  });

  test('says the Krarks copy the mana ritual too', () => {
    const { summary } = calculatorFor(krarkFlips, RITUAL_INCURSION);
    expect(summary).toMatch(
      /^Each Krark flips a coin whenever you cast Multiversal Incursion, Ember Island Production or the mana ritual\. /,
    );
    expect(summary).toContain('a copy of the mana ritual makes its mana again');
    expect(summary).toContain('The loop stops once both copying spells are,');
    expect(calculatorFor(krarkFlips, RITUAL_SAKASHIMA).summary).toMatch(
      /^Each Krark flips a coin whenever you cast a creature-copying spell targeting Krark or the mana ritual\. /,
    );
  });

  test('gives the chance with the mana ritual, and which spell to cast first', () => {
    const calculator = calculatorFor(krarkFlips, RITUAL_SAKASHIMA);
    const result = run(calculator);
    expect(result.headline).toEqual({ label: 'Chance of going infinite', value: '19.6%' });
    expect(result.stats).toEqual([
      { label: 'Runs out of mana', value: '41.5%', caption: 'with a copying spell still in hand' },
      { label: 'Uses up the spell', value: '38.9%', caption: 'by winning every flip of a cast' },
      { label: 'With unlimited mana', value: '53.5%', caption: 'the best these spells can do' },
      { label: 'Cast first', value: 'The copying spell', caption: '9.8% the other way around' },
    ]);
    /* Dark Ritual makes more than it costs even from a single win, so with too little for two casts of the
       copying spell it comes first */
    expect(run(calculator, { numbers: { mana: 2, ritualCost: 1, ritualMana: 3 } }).stats?.[3]).toMatchObject({
      label: 'Cast first',
      value: 'The mana ritual',
    });
    expect(run(calculatorFor(krarkFlips, RITUAL_INCURSION)).stats?.[3]).toEqual({
      label: 'Cast first',
      value: 'Ember Island Production',
      caption: '60.5% casting Multiversal Incursion first',
    });
  });

  test('counts a mana ritual making its mana for each Krark, like Brightstone Ritual', () => {
    const calculator = calculatorFor(krarkFlips, RITUAL_SAKASHIMA);
    const odds = (ritualPer: string) =>
      Number.parseFloat(
        run(calculator, { numbers: { krarks: 3, ritualCost: 1, ritualMana: 1 }, choices: { ritualPer } }).headline
          .value,
      );
    expect(odds('krark')).toBeGreaterThan(odds('spell'));
  });

  test('charts the chance with the mana ritual, steady where more stops showing', () => {
    expectSteadyFrom(calculatorFor(krarkFlips, RITUAL_INCURSION), 'krarks', 4);
    expectSteadyFrom(calculatorFor(krarkFlips, RITUAL_INCURSION), 'mana', 78);
    expectSteadyFrom(calculatorFor(krarkFlips, RITUAL_SAKASHIMA), 'krarks', 12);
  });

  test('stays quick and sane at every extreme', () => {
    for (const id of [
      RELIC,
      SHAKU,
      SAKASHIMA,
      KILN,
      KILN_INCURSION,
      EARTHCRAFT_INCURSION,
      SHAKU_SAKASHIMA,
      EARTHCRAFT_DOUBLE,
      KILN_CLONE_MASTER,
      RITUAL_SAKASHIMA,
      RITUAL_INCURSION,
    ] as const) {
      expectSaneAtExtremes(calculatorFor(krarkFlips, id));
    }
  });
});
