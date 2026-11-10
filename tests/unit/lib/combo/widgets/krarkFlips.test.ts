import { describe, expect, test } from 'vitest';
import {
  type Copier,
  type Engine,
  type KrarkOdds,
  type Odds,
  type Ritual,
  type Spot,
  krarkFlips,
  krarkOdds,
  outOfMana,
} from 'lib/combo/widgets/krarkFlips';
import type { NumberInput } from 'lib/combo/widgets/shared/calculator';
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
   Storm-Kiln Artist makes a Treasure for the cast and for each copy; every Tavern Scoundrel makes two
   for each flip won. The first `makers` copies of a spell copying one creature copy the Artist or the
   Scoundrel rather than Krark, and so does the spell itself if `spellToo`. The mana ritual comes after
   the copying spells, and it and each copy of it make its mana, for each Krark if it says so. */
function after(board: Board, spot: Spot, i: number, wins: number, makers = 0, spellToo = false): Spot {
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
  const aimable = (engine === 'magecraft' || engine === 'flips') && !copier.everyNontoken;
  const resolve = (maker: boolean) => {
    if (aimable && maker) {
      artists++;
      return;
    }
    krarks++;
    if (engine === 'legendary') {
      mana++;
    } else if (engine === 'creature') {
      /* every nontoken creature: Krark and the rest */
      mana += copier.everyNontoken ? 1 + others : 1;
    } else if ((engine === 'magecraft' || engine === 'flips') && copier.everyNontoken) {
      /* the Artist or the Scoundrel too */
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
    } else if (engine === 'flips') {
      mana += 2 * artists;
    }
    resolve(won < makers);
  }
  if (wins === spot.krarks) {
    resolve(spellToo);
    hand &= ~(1 << i);
  }
  return { krarks, artists, mana, hand };
}

/* Which copies of a cast the odds' aim makes copy the maker: the first ones, each so long as it's won by
   the flip the aim says, `wonOn` being the flips won in turn */
function makersAmong(aim: Odds['aim'], wonOn: number[]): number {
  const byFlip = aim?.byFlip ?? [];
  let makers = 0;
  while (makers < byFlip.length && makers < wonOn.length && wonOn[makers] <= byFlip[makers]) {
    makers++;
  }
  return makers;
}

/* With Krark's Thumb, whether to keep the win of a flip whose coins leave the choice, by the flip, the
   wins before it and how many of them copied the maker as the aim says: the chance from where each
   number of wins leaves you, played back flip by flip, taking the win unless losing gives a better
   chance, or neither way has any. */
function choices(board: Board, odds: KrarkOdds, spot: Spot, i: number, aim: Odds['aim']) {
  const alike = 2 ** -(2 ** board.thumbs!);
  const flips = spot.krarks;
  const width = flips + 2;
  const keeps = new Uint8Array(flips * width * width);
  const worth = new Float64Array(width * width);
  for (let wins = 0; wins <= flips; wins++) {
    for (let makers = 0; makers <= wins; makers++) {
      worth[wins * width + makers] = odds.at(after(board, spot, i, wins, makers, aim?.spellToo ?? false)).win;
    }
  }
  for (let flip = flips - 1; flip >= 0; flip--) {
    for (let wins = 0; wins <= flip; wins++) {
      for (let makers = 0; makers <= wins; makers++) {
        /* a win now is one more copy, the maker if every copy so far is and the aim says so of this flip */
        const maker = makers === wins && makersAmong(aim, Array<number>(wins + 1).fill(flip + 1)) > wins;
        const lost = worth[wins * width + makers];
        const won = worth[(wins + 1) * width + makers + (maker ? 1 : 0)];
        const keep = won > 0 && won >= lost - 1e-12;
        keeps[(flip * width + wins) * width + makers] = keep ? 1 : 0;
        worth[wins * width + makers] = alike * (lost + won) + (1 - 2 * alike) * (keep ? won : lost);
      }
    }
  }
  return (flip: number, wins: number, makers: number) => keeps[(flip * width + wins) * width + makers] === 1;
}

/* The combo played trigger by trigger with real coin flips: every Krark on the battlefield as the spell
   is cast flips for it, and the first loss sends the card back to your hand. With Krark's Thumbs each
   flip is twice the coins for each, and you keep whichever coin `choices` says. Each spell cast is the
   one the odds pick, with as many of its first copies aimed at the Artist or Scoundrel as they say; once
   they have none to pick, as with mana to spare: the spell copying every nontoken creature if there is
   one, else the first in hand, where the mana comes from the engine; where it comes from a mana ritual,
   the cheapest copying spell you can pay for and still cast the ritual after, or else the ritual. With
   the ritual used up or too dear to cast nothing makes mana, so so many Krarks run out of it long before
   a cast wins every flip. Ends with how the combo went and what it made: copies of Krark, casts and
   mana. */
interface Made {
  krarks: number;
  casts: number;
  mana: number;
}
function play(board: Board, odds: KrarkOdds, start: Spot, random: () => number) {
  const { copiers, thumbs = 0, ritual } = board;
  const coins = 2 ** thumbs;
  const plenty = thumbs ? PLENTY_WITH_THUMBS : PLENTY;
  const copying = (1 << copiers.length) - 1;
  const ritualBit = ritual ? 1 << copiers.length : 0;
  const made: Made = { krarks: 0, casts: 0, mana: 0 };
  let spot = start;
  for (;;) {
    const { krarks, mana, hand } = spot;
    if ((hand & copying) === 0) {
      return { end: 'used up', made };
    }
    /* with the ritual used up or too dear, the casts go on while the mana lasts, however many the Krarks */
    if (krarks >= plenty && (hand & ritualBit) === ritualBit && mana >= (ritual?.cost ?? 0)) {
      return { end: 'infinite', made };
    }
    const affordable = copiers.flatMap((copier, i) => (hand & (1 << i) && mana >= copier.cost ? [i] : []));
    const ritualAffordable = hand & ritualBit && mana >= ritual!.cost;
    if (affordable.length === 0 && !ritualAffordable) {
      return { end: 'out of mana', made };
    }
    const cheapest = affordable.reduce((a, b) => (copiers[b].cost < copiers[a].cost ? b : a), affordable[0]);
    const { cast, aim } = odds.at(spot);
    const i =
      cast ??
      (ritual
        ? ritualAffordable && (cheapest === undefined || mana < copiers[cheapest].cost + ritual.cost)
          ? copiers.length
          : cheapest
        : (affordable.find((spell) => copiers[spell].everyNontoken) ?? affordable[0]));
    /* with no chance left, every flip that leaves a choice is lost to keep the spell */
    const keep = thumbs ? (odds.at(spot).win > 0 ? choices(board, odds, spot, i, aim) : () => false) : () => true;
    const wonOn: number[] = [];
    for (let flip = 0; flip < krarks; flip++) {
      let won = 0;
      for (let coin = 0; coin < coins; coin++) {
        if (random() < 0.5) {
          won++;
        }
      }
      if (won === coins || (won > 0 && keep(flip, wonOn.length, makersAmong(aim, wonOn)))) {
        wonOn.push(flip + 1);
      }
    }
    const next = after(board, spot, i, wonOn.length, makersAmong(aim, wonOn), aim?.spellToo ?? false);
    made.krarks += next.krarks - krarks;
    made.casts++;
    made.mana += next.mana - mana + (i === copiers.length ? ritual!.cost : copiers[i].cost);
    spot = next;
  }
}

/* How often each ending comes up over many plays, against the odds worked out, and what the plays that
   stop make on the way, mean and deviation, against what the odds say they do. With a mana ritual, how
   often it is cast once the combo is settled isn't counted, so only the Krarks are checked then, and
   only their mean: a hand that lost its ritual goes on copying Krark with the mana left, and the rare
   long runs of that make the deviation too wild for so many plays to show. */
function expectPlayedOdds(board: Board, start: Spot, plays = 20_000) {
  const odds = krarkOdds(board.copiers, board.engine, board);
  const random = seeded(1234);
  const counts: Record<string, number> = { infinite: 0, 'used up': 0, 'out of mana': 0 };
  const stopped: Made[] = [];
  for (let i = 0; i < plays; i++) {
    const { end, made } = play(board, odds, start, random);
    counts[end]++;
    if (end !== 'infinite') {
      stopped.push(made);
    }
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
  const n = stopped.length;
  for (const what of board.ritual ? (['krarks'] as const) : (['krarks', 'casts', 'mana'] as const)) {
    const values = stopped.map((made) => made[what]);
    const mean = values.reduce((sum, value) => sum + value, 0) / n;
    const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n);
    const said = expected.made![what];
    const spread = Math.max(deviation, said.deviation);
    /* four standard errors of the mean; the deviation's own error is larger for what is made, as the
       counts are skewed; and a hair again for the mana past the table */
    expect(Math.abs(mean - said.mean), `${what} made: played ${mean} against ${said.mean}`).toBeLessThan(
      (4 * spread) / Math.sqrt(n) + 0.02,
    );
    if (!board.ritual) {
      expect(
        Math.abs(deviation - said.deviation),
        `${what} made, deviation: played ${deviation} against ${said.deviation}`,
      ).toBeLessThan((6 * spread) / Math.sqrt(n) + 0.02);
    }
  }
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

  test('settle a hand as soon as every cast pays for the dearest spell in it, to one in a million', () => {
    /* The plain way counting 12 Krarks past where the odds ever stop, with nothing taken as settled before:
       the more Artists the sooner a cast pays, a hand left with the cheaper spell needs fewer wins, and a
       Thumb wins nearly all of them. */
    const pair: Copier[] = [MOLTEN, { cost: 3, everyNontoken: true }];
    expectPlainOdds({ copiers: pair, engine: 'magecraft' }, 12);
    expectPlainOdds({ copiers: TEMPLATE, engine: 'legendary' }, 12);
    expectPlainOdds({ copiers: TEMPLATE, engine: 'legendary', thumbs: 1 }, 12);
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

  test("aim a cast's first copies at the Artist or Scoundrel where that gives the better chance", () => {
    const odds = krarkOdds([DUPLICATION, PRODUCTION], 'magecraft');
    /* a Krark, an Artist and seven mana: Ember Island Production with its copy an Artist is the only way on,
       as the way with free choice copy by copy finds too */
    const short = { krarks: 1, artists: 1, mana: 7, hand: 3 };
    expect(odds.at(short)).toMatchObject({ cast: 1, aim: { byFlip: [1], spellToo: false } });
    expect(odds.at(short).win).toBeCloseTo(0.1694, 4);
    expect(odds.casting(short, 0)?.win).toBe(0);
    expect(
      krarkOdds([DUPLICATION, PRODUCTION], 'flips').at({ krarks: 4, artists: 1, mana: 5, hand: 2 }).win,
    ).toBeCloseTo(0.5885, 3);
    /* with mana to spare, Krarks are the better copies */
    expect(odds.at({ ...short, mana: 18 }).aim).toBeUndefined();
    /* Two Krarks, two Artists and four mana with Multiversal Incursion to pay for next: the first copy is an
       Artist if won on the first flip, to pay for the second copy, but a Krark if on the last, there being
       no second; the second copy is an Artist. The way with free choice copy by copy finds the same. */
    const incursion = krarkOdds([INCURSION, DUPLICATION], 'magecraft');
    const two = incursion.at({ krarks: 2, artists: 2, mana: 4, hand: 3 });
    expect(two).toMatchObject({ cast: 1, aim: { byFlip: [1, 2], spellToo: false } });
    expect(two.win).toBeCloseTo(0.5637, 4);
    /* with a third Krark and two Artists, the copies make Krarks and the spell itself an Artist */
    expect(incursion.at({ krarks: 3, artists: 2, mana: 4, hand: 3 }).aim).toEqual({ byFlip: [], spellToo: true });
    /* weighed only while a cast can fall short, by Krarks and by mana, and up to the Artists that settle it:
       with Ember Island Production in hand a single Artist needs four wins of a cast, which twenty-five
       Krarks fall short of rarer than one in ten thousand */
    expect(odds.makers(short)).toBe(1);
    expect(odds.makers({ krarks: 24, artists: 1, mana: 14, hand: 3 })).toBe(4);
    expect(odds.makers({ krarks: 25, artists: 1, mana: 14, hand: 3 })).toBe(0);
    expect(odds.makers({ krarks: 2, artists: 1, mana: 15, hand: 3 })).toBe(0);
    expect(odds.makers({ krarks: 5, artists: 3, mana: 7, hand: 3 })).toBe(2);
    /* nothing to aim at with any other engine */
    expect(krarkOdds(TEMPLATE, 'legendary').makers({ krarks: 1, artists: 0, mana: 2, hand: 3 })).toBe(0);
  });

  test('count two Treasures from each Tavern Scoundrel for every flip won', () => {
    expectPlainOdds({ copiers: TEMPLATE, engine: 'flips' });
    expectPlainOdds({ copiers: TEMPLATE, engine: 'flips', thumbs: 1 });
    expectPlainOdds({ copiers: [INCURSION, DUPLICATION], engine: 'flips' });
    expectPlainOdds({ copiers: [MOLTEN, { cost: 3, everyNontoken: true }], engine: 'flips' }, 12);
    expectPlayedOdds(
      { copiers: [INCURSION, DUPLICATION], engine: 'flips' },
      { krarks: 1, artists: 1, mana: 11, hand: 3 },
    );
    expectPlayedOdds(
      { copiers: TEMPLATE, engine: 'flips', thumbs: 1 },
      { krarks: 1, artists: 1, mana: 3, hand: 3 },
      10_000,
    );
    /* a single win pays for the two-mana spell again, so two Krarks win where three do with a win kept */
    const odds = krarkOdds(TEMPLATE, 'flips');
    const at = (krarks: number, mana: number) => odds.at({ krarks, artists: 1, mana, hand: 1 }).win;
    expect(at(2, 2)).toBeCloseTo(at(3, 2) / 2, 12);
    expect(at(2, 3)).toBeCloseTo(at(3, 3) / 2, 12);
    /* every win is worth two mana, where a legend taps for one: never the worse for it */
    const legends = krarkOdds(TEMPLATE, 'legendary');
    for (let krarks = 1; krarks < 6; krarks++) {
      for (let mana = 0; mana <= 12; mana++) {
        const spot = { krarks, artists: 1, mana, hand: 3 };
        expect(odds.at(spot).win).toBeGreaterThanOrEqual(legends.at({ ...spot, artists: 0 }).win - 1e-12);
      }
    }
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
    /* a one-mana spell and an Artist pay for every cast, so a single mana is as good as any, however few
       the Krarks */
    const free = krarkOdds([{ cost: 1, everyNontoken: false }], 'magecraft');
    for (const krarks of [2, 3, 7]) {
      expect(free.at({ krarks, artists: 1, mana: 1, hand: 1 }).win, `${krarks}`).toBeCloseTo(chance(krarks), 9);
    }
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
      /* but for a hair past the mana or the Krarks where copies aimed at the Artist stop being weighed */
      const seam = engine === 'magecraft' ? 1e-4 : 1e-12;
      byThumbs.forEach((odds, thumbs) => {
        for (const hand of [1, 2, 3]) {
          for (let krarks = 1; krarks < 12; krarks++) {
            for (let mana = 0; mana < 60; mana++) {
              const here = odds.at({ krarks, artists: 1, mana, hand }).win;
              expect(odds.at({ krarks, artists: 1, mana: mana + 1, hand }).win).toBeGreaterThanOrEqual(here - seam);
              expect(odds.at({ krarks: krarks + 1, artists: 1, mana, hand }).win).toBeGreaterThanOrEqual(here - seam);
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

  test('count what the combo makes before it stops, copies of Krark, casts and mana, with their spread', () => {
    const odds = krarkOdds(TEMPLATE, 'legendary');
    /* two Krarks, the two-mana spell alone and just the mana for it: it stops after the one cast, having
       made no Krark one time in four, one as often as not and three the rest, each tapping for a mana */
    const once = odds.at({ krarks: 2, artists: 0, mana: 2, hand: 1 });
    expect(once.win).toBe(0);
    expect(once.made!.krarks.mean).toBeCloseTo(1.25, 12);
    expect(once.made!.krarks.deviation).toBeCloseTo(Math.sqrt(1.1875), 12);
    expect(once.made!.casts).toEqual({ mean: 1, deviation: 0 });
    expect(once.made!.mana).toEqual(once.made!.krarks);
    /* a lone Krark with its last spell casts until a flip is won: two Krarks then, and the spell used up */
    const lone = odds.at({ krarks: 1, artists: 0, mana: 100, hand: 1 });
    expect(lone.made!.krarks.mean).toBeCloseTo(2, 10);
    expect(lone.made!.krarks.deviation).toBeCloseTo(0, 5);
    expect(lone.made!.casts.mean).toBeCloseTo(2, 10);
    expect(lone.made!.casts.deviation).toBeCloseTo(Math.SQRT2, 10);
    /* with a Thumb it loses on purpose, and the spell is used up only when every coin wins, one cast in
       four, however much the mana */
    const thumb = krarkOdds(TEMPLATE, 'legendary', { thumbs: 1 }).at({ krarks: 1, artists: 0, mana: 1e9, hand: 1 });
    expect(thumb.made!.casts.mean).toBeCloseTo(4, 10);
    expect(thumb.made!.casts.deviation).toBeCloseTo(Math.sqrt(12), 10);
    expect(thumb.made!.krarks).toEqual({ mean: 2, deviation: 0 });
    /* an Artist pays for a one-mana spell: a lone Krark casts it until a flip is won, a Treasure for each
       cast and one more for the copy */
    const artist = krarkOdds([{ cost: 1, everyNontoken: false }], 'magecraft').at({
      krarks: 1,
      artists: 1,
      mana: 1,
      hand: 1,
    });
    expect(artist.made!.casts.mean).toBeCloseTo(2, 10);
    expect(artist.made!.mana.mean).toBeCloseTo(3, 10);
    expect(artist.made!.mana.deviation).toBeCloseTo(Math.SQRT2, 10);
    /* nothing to tell where the combo doesn't stop */
    expect(odds.at({ krarks: 40, artists: 0, mana: 100, hand: 3 }).made).toBeUndefined();
  });

  test("can't start without the mana for a spell in hand", () => {
    const odds = krarkOdds(TEMPLATE, 'legendary');
    /* stopped before it began, with nothing made */
    const nothing = { mean: 0, deviation: 0 };
    const stopped = { win: 0, usedUp: 0, made: { krarks: nothing, casts: nothing, mana: nothing } };
    expect(odds.at({ krarks: 1, artists: 0, mana: 1, hand: 3 })).toEqual(stopped);
    expect(odds.at({ krarks: 5, artists: 0, mana: 2, hand: 2 })).toEqual(stopped);
    /* the cheaper one you can cast, but a single win leaves too little to cast it again */
    expect(odds.at({ krarks: 5, artists: 0, mana: 2, hand: 1 }).win).toBeCloseTo(0.7548, 4);
  });
});

/* The chance of going infinite worked out the plain way for every spot the table holds: from the most
   Krarks down, every spot with that many gone over again and again, each from where the others stand,
   until none changes. A cast either makes a Krark or a maker more, which is worked out already, or
   comes back to the same Krarks, as the mana ritual does and any cast that loses every flip. The copies
   aimed at the Artist or Scoundrel are as many as give the best chance, of the counts the odds weigh.
   With Krark's Thumbs each flip that leaves a choice goes the way that gives the better chance. Where
   the odds call a spot settled, by its Krarks or its Artists, it's the chance with mana to spare while
   something still makes mana, and nothing otherwise. */
function plainOdds(board: Board, odds: KrarkOdds, past = 0) {
  const { copiers, thumbs = 0, ritual } = board;
  const { most } = odds;
  const horizon = odds.horizon + past;
  const costs = [...copiers.map((copier) => copier.cost), ...(ritual ? [ritual.cost] : [])];
  const hands = 1 << costs.length;
  const copying = (1 << copiers.length) - 1;
  const ritualBit = ritual ? 1 << copiers.length : 0;
  const artistsRange = artistsOf(board);
  const mostArtists = artistsRange.at(-1)!;
  const alike = 2 ** -(2 ** thumbs);
  const table = Array.from({ length: horizon }, () => new Float64Array((mostArtists + 1) * hands * (most + 1)));
  const slot = (artists: number, hand: number, mana: number) => (artists * hands + hand) * (most + 1) + mana;
  const chance = ({ krarks, hand, ...spot }: Spot): number => {
    const mana = Math.min(spot.mana, most);
    /* Scoundrels past the ones kept count of are as many as the last */
    const artists = board.engine === 'flips' ? Math.min(spot.artists, mostArtists) : spot.artists;
    if ((hand & copying) === 0 || !costs.some((cost, i) => hand & (1 << i) && mana >= cost)) {
      return 0;
    }
    /* counting `past` the Krarks the odds ever settle from, nothing is taken as settled short of that */
    const settled =
      past > 0 ? krarks >= horizon || artists > mostArtists : odds.settled({ krarks, artists, mana, hand });
    if (settled) {
      return (hand & ritualBit) === ritualBit && mana >= (ritual?.cost ?? 0) ? odds.unlimited(krarks, hand) : 0;
    }
    return table[krarks][slot(artists, hand, mana)];
  };
  for (let krarks = horizon - 1; krarks >= 1; krarks--) {
    const width = krarks + 2;
    const worth = new Float64Array(width * width);
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
              const aimable =
                i < copiers.length && !copiers[i].everyNontoken ? odds.makers({ krarks, artists, mana, hand }) : 0;
              const byFlip = aimable > 0 && krarks <= odds.byFlipUpTo;
              for (let makers = 0; makers <= (byFlip ? 0 : aimable); makers++) {
                for (const spellToo of aimable > 0 ? [false, true] : [false]) {
                  /* the chance from each number of wins and, aimed as they are won, of makers among them */
                  for (let wins = 0; wins <= krarks; wins++) {
                    for (let made = 0; made <= (byFlip ? Math.min(wins, aimable) : 0); made++) {
                      worth[wins * width + made] = chance(
                        after(board, { krarks, artists, mana, hand }, i, wins, byFlip ? made : makers, spellToo),
                      );
                    }
                  }
                  for (let flip = krarks - 1; flip >= 0; flip--) {
                    for (let wins = 0; wins <= flip; wins++) {
                      for (let made = 0; made <= (byFlip ? Math.min(wins, aimable) : 0); made++) {
                        const lost = worth[wins * width + made];
                        let won = worth[(wins + 1) * width + made];
                        if (byFlip && made === wins && made < aimable) {
                          won = Math.max(won, worth[(wins + 1) * width + made + 1]);
                        }
                        worth[wins * width + made] = alike * (lost + won) + (1 - 2 * alike) * Math.max(lost, won);
                      }
                    }
                  }
                  best = Math.max(best, worth[0]);
                }
              }
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

/* the Storm-Kiln Artists or Tavern Scoundrels the table keeps count of: short of an Artist for every
   mana the dearest spell costs, or up to that many Scoundrels; none with any other engine */
function artistsOf({ copiers, engine }: Board): number[] {
  if (engine !== 'magecraft' && engine !== 'flips') {
    return [0];
  }
  const dearest = Math.max(...copiers.map((copier) => copier.cost));
  return Array.from({ length: Math.max(1, engine === 'flips' ? dearest : dearest - 1) }, (_, i) => i + 1);
}

/* the odds at every spot the table holds, against the plain way */
function expectPlainOdds(board: Board, past = 0) {
  const odds = krarkOdds(board.copiers, board.engine, board);
  const plain = plainOdds(board, odds, past);
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
  /* settling sooner than the plain way does is good to the one in a million it goes by, twice over */
  expect(worst, where).toBeLessThan(past > 0 ? 3e-6 : 5e-10);
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

  test("with Krark's Thumbs, a combo that lost its ritual runs out of mana on either side of where it settles", () => {
    /* nothing left to win, so every flip that leaves a choice is lost and the spell stays in hand */
    const odds = krarkOdds([MOLTEN], 'ritual', { ritual: MANAMORPHOSE, thumbs: 2 });
    const spot = (krarks: number) => ({ krarks, artists: 0, mana: 10, hand: 1 });
    /* such a hand is settled sooner than one that can still go infinite */
    const settles = Array.from({ length: odds.horizon }, (_, i) => i + 1).find((krarks) => odds.settled(spot(krarks)))!;
    expect(settles).toBeGreaterThan(1);
    expect(settles).toBeLessThan(odds.horizon);
    for (const krarks of [settles - 1, settles]) {
      const lost = odds.at(spot(krarks));
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

test('takes the Treasures from the flips Tavern Scoundrel sees won', () => {
  expect(
    krarkFlips.detect(
      fakeVariant({
        uses: ['Krark, the Thumbless', 'Tavern Scoundrel', 'Multiversal Incursion'],
        requires: [ANY_COPY],
        description: FLIPS,
      }),
    ),
  ).toEqual({
    engine: 'Tavern Scoundrel',
    spells: [{ name: 'Multiversal Incursion', cost: 7, everyNontoken: true }, { everyNontoken: false }],
  });
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
      ['artists', 1],
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
      { label: 'Krarks made', value: '4.4 ± 3.2', caption: 'copies of Krark when it stops, mean ± deviation' },
      { label: 'Casts', value: '3.6 ± 1.0', caption: 'of the copying spells when it stops, mean ± deviation' },
      { label: 'Mana made', value: '4.4 ± 3.2', caption: 'by Relic of Legends when it stops, mean ± deviation' },
    ]);
    expect(calculatorFor(krarkFlips, RELIC).summary).toContain(
      'Where it stops, how many copies of Krark it has made by then, how many casts and how much mana are given as mean ± deviation.',
    );
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
      { label: 'Krarks made', value: '5.1 ± 2.5', caption: 'copies of Krark when it stops, mean ± deviation' },
      { label: 'Casts', value: '3.2 ± 1.2', caption: 'of the copying spells when it stops, mean ± deviation' },
      { label: 'Mana made', value: '5.1 ± 2.5', caption: 'by Relic of Legends when it stops, mean ± deviation' },
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
      expect(calculatorFor(krarkFlips, id).summary).toContain(explained);
    }
    /* a lone Krark with its last spell and six mana: three casts, each used up 1 time in 4, two Krarks then */
    const lone = run(calculator, { numbers: { krarks: 1, mana: 6, thumbs: 1 }, choices: { hand: '1' } });
    expect(lone.headline.value).toBe('0%');
    expect(lone.stats?.map(({ label, value }) => [label, value])).toEqual([
      ['Runs out of mana', '42.2%'],
      ['Uses up the spell', '57.8%'],
      ['With unlimited mana', '0%'],
      ['Krarks made', '1.2 ± 1.0'],
      ['Casts', '2.3 ± 0.8'],
      ['Mana made', '1.2 ± 1.0'],
    ]);
  });

  test('counts the casts of a lone Krark with its last spell however much the mana', () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    const lone = (thumbs: number, mana?: number) => ({
      numbers: { krarks: 1, thumbs, ...(mana !== undefined && { mana }) },
      choices: { hand: '1' },
    });
    /* each cast of the two-mana spell uses it up 1 time in 16 with two Thumbs, 1 in 65,536 with four: 125
       casts make that all but sure, and how many it takes read the same, or nine hundred thousand */
    expectSteadyFrom(calculator, 'mana', 250, lone(2));
    expectSteadyFrom(calculator, 'mana', 1_796_770, lone(4));
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
      ['artists', 1],
    ]);
    expect(calculator.summary).toMatch(/^Each Krark flips a coin whenever you cast Irenicus's Vile Duplication\. /);
    expect(calculator.summary).toContain("The loop stops once it is, or once you can't pay for the next cast.");
    expect(calculator.summary).toContain("With Krark's Thumb the odds take every win");
    const result = run(calculator);
    expect(result.stats?.map((stat) => stat.label)).toEqual([
      'Runs out of mana',
      'Uses up the spell',
      'With unlimited mana',
      'Krarks made',
      'Casts',
      'Mana made',
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
      'Krarks made',
      'Casts',
      'Mana made',
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

  test('asks for the Tavern Scoundrels where Multiversal Incursion copies them, and says what they make', () => {
    const incursion = { name: 'Multiversal Incursion', cost: 7, everyNontoken: true };
    const calculator = krarkFlips.calculator({
      engine: 'Tavern Scoundrel',
      spells: [incursion, { everyNontoken: false }],
    });
    expect(calculator.inputs.map(({ key, label, initial }) => [key, label, initial])).toEqual([
      ['mana', 'Mana you have', 18],
      ['firstCost', 'Mana value of the copying spell', 2],
      ['hand', 'Copying spells in your hand', '3'],
      ['krarks', 'Krarks you control', 1],
      ['thumbs', "Krark's Thumbs you control", 0],
      ['scoundrels', 'Tavern Scoundrels you control', 1],
    ]);
    expect(calculator.summary).toContain(
      'Tavern Scoundrel makes two Treasures for each flip you win. Multiversal Incursion copies Tavern Scoundrel too, so each copy of it makes one more Scoundrel.',
    );
    const withScoundrels = (scoundrels: number) => run(calculator, { numbers: { mana: 9, scoundrels } }).headline.value;
    expect(Number.parseFloat(withScoundrels(3))).toBeGreaterThan(Number.parseFloat(withScoundrels(1)));
    expectSaneAtExtremes(calculator);
    const alone = krarkFlips.calculator({ engine: 'Tavern Scoundrel', spells: [{ everyNontoken: false }] });
    expect(alone.inputs.map(({ key }) => key)).toEqual(['mana', 'firstCost', 'krarks', 'thumbs', 'scoundrels']);
    expect(alone.summary).not.toContain('Multiversal Incursion');
    expectSaneAtExtremes(alone);
  });

  test("says how many of a cast's first copies to aim at the Artist, where that gives the better chance", () => {
    const kiln = calculatorFor(krarkFlips, KILN);
    const short = run(kiln, { numbers: { mana: 7 } });
    expect(short.headline.value).toBe('16.9%');
    expect(short.stats?.find((stat) => stat.label.startsWith('Aim at'))).toEqual({
      label: 'Aim at Storm-Kiln Artist',
      value: 'The copy',
      caption: 'rather than Krark, casting Ember Island Production',
    });
    /* with the mana to spare, Krarks are the better copies */
    expect(run(kiln).stats?.map((stat) => stat.label)).not.toContain('Aim at Storm-Kiln Artist');
    expect(kiln.summary).toContain(
      'A copy of a spell can copy Storm-Kiln Artist instead, for the mana: where that gives the better chance, the odds aim',
    );
    const hint = (id: typeof KILN | typeof KILN_INCURSION) =>
      (calculatorFor(krarkFlips, id).inputs.find((input) => input.key === 'artists') as NumberInput).hint;
    expect(hint(KILN)).toBe('The copying spells can copy it instead of Krark.');
    expect(hint(KILN_INCURSION)).toBe(
      'The copying spells can copy it instead of Krark, and Multiversal Incursion copies it along with Krark.',
    );
  });

  test('charts the chance by mana and by Krarks, steady where more stops showing', () => {
    const calculator = calculatorFor(krarkFlips, RELIC);
    const [byMana, byKrarks] = run(calculator).charts!;
    expect(byMana).toMatchObject({ title: 'Chance of going infinite by mana', selects: 'mana', percent: true });
    expect(byMana.dots[0]).toEqual({ x: 10, y: expect.closeTo(66.85, 2), label: '10 mana: 66.8%', tone: 'warn' });
    /* the chance is all but sure from four Krarks, but what is made when the combo stops still changes */
    expect(byKrarks).toMatchObject({ title: 'Chance of going infinite by Krarks', selects: 'krarks', steadyFrom: 10 });
    expect(byKrarks.dots.slice(0, 4).map((dot) => dot.label)).toEqual([
      '1 Krark: 66.8%',
      '2 Krarks: 97.6%',
      '3 Krarks: 99.8%',
      '4 Krarks: >99.9%',
    ]);
    expect(byKrarks.dots.at(-1)!.label).toBe('10 or more Krarks: >99.9%');
    expectSteadyFrom(calculator, 'krarks', 10);
    expectSteadyFrom(calculator, 'mana', 31);
    expectSteadyFrom(calculatorFor(krarkFlips, KILN), 'mana', 47);
    expectSteadyFrom(calculatorFor(krarkFlips, KILN_INCURSION), 'krarks', 10);
    const withThumb = { numbers: { thumbs: 1 } };
    expectSteadyFrom(calculator, 'krarks', 5, withThumb);
    expectSteadyFrom(calculator, 'mana', 21, withThumb);
    const [, fromOne] = run(calculator, { numbers: { thumbs: 2 } }).charts!;
    expect(fromOne.dots.map((dot) => dot.label)).toEqual([
      '1 Krark: >99.9%',
      '2 Krarks: >99.9%',
      '3 or more Krarks: >99.9%',
    ]);
  });

  test('charts the chance by Krarks where every cast pays for itself from the first Krark on', () => {
    /* a one-mana spell with Storm-Kiln Artist: settled with any Krarks, the chance still grows with them */
    const calculator = krarkFlips.calculator({ engine: 'Storm-Kiln Artist', spells: [{ everyNontoken: false }] });
    const cheap = { firstCost: 1 };
    expect(run(calculator, { numbers: { ...cheap, krarks: 2 } }).headline.value).toBe('53.5%');
    expectSteadyFrom(calculator, 'krarks', 30, { numbers: cheap });
    expectSteadyFrom(calculator, 'krarks', 15, { numbers: { ...cheap, thumbs: 1 } });
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
      /* a hand that lost the ritual goes on copying Krark with the mana left, which spreads the count wide */
      { label: 'Krarks made', value: '4.4 ± 30.5', caption: 'copies of Krark when it stops, mean ± deviation' },
    ]);
    expect(calculator.summary).toContain(
      'Where it stops, how many copies of Krark it has made by then is given as mean ± deviation.',
    );
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
    expectSteadyFrom(calculatorFor(krarkFlips, RITUAL_INCURSION), 'krarks', 10);
    expectSteadyFrom(calculatorFor(krarkFlips, RITUAL_INCURSION), 'mana', 78);
    expectSteadyFrom(calculatorFor(krarkFlips, RITUAL_SAKASHIMA), 'krarks', 30);
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
