import type { Input, NumberInput, Stat } from './shared/calculator';
import { chanceTone, formatSwept, sweptDots } from './shared/charts';
import { capitalize, formatNumber, formatPercent } from './shared/format';
import { choiceInput, numberInput } from './shared/inputs';
import { highestPassing } from './shared/search';
import { defineWidget } from './shared/widget';
import { clonesOf, describeClones } from './parse/clones';
import { says, uses, usesAny } from './parse/variant';

/* Where the mana to cast the copying spell again comes from: a mana for every new legendary creature,
   like Relic of Legends gives, one for every new creature, like Earthcraft, a Treasure for every
   cast and every copy, from each Storm-Kiln Artist, two Treasures for every flip won, from each Tavern
   Scoundrel, or a mana ritual the Krarks copy like any other spell. */
export type Engine = 'legendary' | 'creature' | 'magecraft' | 'flips' | 'ritual';

export interface Copier {
  cost: number;
  /* copies every nontoken creature you control, like Multiversal Incursion, rather than Krark alone */
  everyNontoken: boolean;
}

export interface Ritual {
  cost: number;
  /* the mana it makes as it resolves, as does each copy of it */
  makes: number;
  /* that much for each Krark, like Brightstone Ritual makes for each Goblin */
  perKrark: boolean;
}

export interface Board {
  /* other nontoken creatures you control, which a spell copying every one copies along with Krark */
  others?: number;
  thumbs?: number;
  /* the mana ritual, with the engine that says the mana comes from one */
  ritual?: Ritual;
}

/* Where the combo stands: the Krarks you control and the Storm-Kiln Artists or Tavern Scoundrels, the
   mana you can make, and which spells are in your hand, one bit each in the order they are given, the
   mana ritual last */
export interface Spot {
  krarks: number;
  artists: number;
  mana: number;
  hand: number;
}

/* The mean and standard deviation of something the combo makes */
export interface Spread {
  mean: number;
  deviation: number;
}

export interface Odds {
  /* the chance the Krarks and the mana outgrow anything that could stop them */
  win: number;
  /* the chance every copying spell is used up, each by winning every flip it made */
  usedUp: number;
  /* what the combo makes before it stops, where it does: copies of Krark, casts of the spells, and mana
     from the engine */
  made?: { krarks: Spread; casts: Spread; mana: Spread };
  /* the spell to cast for the best chance, by index, the mana ritual last, if you can pay for one */
  cast?: number;
  /* with a Treasure maker, the copies of that cast to aim at it rather than Krark: for each in turn, the
     latest flip won on which to, a copy won sooner being worth aiming at least as much; and whether to
     aim the spell itself, if it resolves */
  aim?: { byFlip: number[]; spellToo: boolean };
}

/* The chance of running out of mana with a copying spell still in hand */
export const outOfMana = (odds: Odds) => Math.max(0, 1 - odds.win - odds.usedUp);

const bit = (i: number) => 1 << i;

/* The chance of each number of wins among `flips` coin flips */
function binomial(flips: number): Float64Array {
  const row = new Float64Array(flips + 1);
  row[0] = 1;
  for (let n = 1; n <= flips; n++) {
    for (let wins = n; wins > 0; wins--) {
      row[wins] = (row[wins] + row[wins - 1]) / 2;
    }
    row[0] /= 2;
  }
  return row;
}

/* The chance that every coin of a flip comes up a win, or every one a loss: with Krark's Thumbs you flip
   twice the coins for each, four with two, and keep the one you like, so only then does a flip go
   against your choice. Without one it is a single coin, and half the time either way. */
const alikeWith = (thumbs: number) => 2 ** -(2 ** thumbs);

/* The fewest Krarks from which every cast gives back what the dearest spell costs, short of a fluke rarer
   than `fluke`, the cast needing the wins `needs` says: any Krarks at all where it needs none. A cast
   falls short by losing more flips than it has to spare: each is lost half the time, or with Krark's
   Thumb only when every coin of it comes up a loss, which leaves one flip fewer to spare, the first
   being lost on purpose to keep the spell. */
function horizonFor(needs: (krarks: number) => number, thumbs: number, fluke: number): number {
  const alike = alikeWith(thumbs);
  for (let krarks = 1; ; krarks++) {
    const need = needs(krarks);
    if (need <= 0) {
      return krarks;
    }
    const spare = krarks - need - Math.min(thumbs, 1);
    if (spare < 0) {
      continue;
    }
    let short = 0;
    let chance = (1 - alike) ** krarks;
    for (let lost = 0; lost <= krarks; lost++) {
      if (lost > spare) {
        short += chance;
      }
      chance = (((chance * (krarks - lost)) / (lost + 1)) * alike) / (1 - alike);
    }
    if (short < fluke) {
      return krarks;
    }
  }
}

/* What is kept of every spot and of every way a cast can go, side by side: the chance of going infinite,
   the chance of using the spells up, and for the copies of Krark, the casts and the mana made before
   the combo stops, where it does, the mean and the mean square, each times the chance that it stops.
   Those two give the mean and the deviation of what is made, among the times the combo stops. */
const WIN = 0;
const USED_UP = 1;
const KRARKS = 2;
const CASTS = 4;
const MANA = 6;
const TRACKED = 8;
const MADE = [KRARKS, CASTS, MANA];

/* What a cast makes on one way it can go: so many copies of Krark, a cast, and so much mana */
interface Gains {
  krarks: number;
  casts: number;
  mana: number;
}

/* Keeps at `slot` of `into` what a way of a cast is worth, arriving at the spot kept at `from` of `spot`
   and making `gains` on the way: what is made from the spot on, and the cast's own gains where the
   combo goes on to stop. */
function arriving(spot: Float64Array, from: number, gains: Gains, into: Float64Array, slot: number) {
  const win = spot[from + WIN];
  const stop = 1 - win;
  into[slot + WIN] = win;
  into[slot + USED_UP] = spot[from + USED_UP];
  const krarks = spot[from + KRARKS];
  into[slot + KRARKS] = gains.krarks * stop + krarks;
  into[slot + KRARKS + 1] = gains.krarks * gains.krarks * stop + 2 * gains.krarks * krarks + spot[from + KRARKS + 1];
  const casts = spot[from + CASTS];
  into[slot + CASTS] = gains.casts * stop + casts;
  into[slot + CASTS + 1] = gains.casts * gains.casts * stop + 2 * gains.casts * casts + spot[from + CASTS + 1];
  const mana = spot[from + MANA];
  into[slot + MANA] = gains.mana * stop + mana;
  into[slot + MANA + 1] = gains.mana * gains.mana * stop + 2 * gains.mana * mana + spot[from + MANA + 1];
}

/* the spells all used up: the combo stops here, having made nothing more */
const USED_UP_ALL = new Float64Array(TRACKED);
USED_UP_ALL[USED_UP] = 1;

/* Settles `out` from the sums over the ways a cast goes somewhere, `stay` being the chance it leaves you
   where you were: every time it does, the combo is as likely to stop as from here and has made one cast
   and `staying` mana more, which counts for the mean and the mean square of what is made at each q. */
function settleStay(out: Float64Array, stay: number, staying: number) {
  out[WIN] /= 1 - stay;
  out[USED_UP] /= 1 - stay;
  const stop = 1 - out[WIN];
  for (const q of MADE) {
    const gain = q === KRARKS ? 0 : q === CASTS ? 1 : staying;
    const mean = (out[q] + stay * gain * stop) / (1 - stay);
    out[q + 1] = (out[q + 1] + stay * (gain * gain * stop + 2 * gain * mean)) / (1 - stay);
    out[q] = mean;
  }
  return out;
}

/* Plays out the flips of a cast, from what each number of wins is worth: at w of `ends` after winning w
   of them, every one at w equal to the flips. Winning none may leave you where you were (`stays`), to
   cast again, so those odds count only the casts that go anywhere; what the cast makes staying put, a
   cast and `staying` mana, is counted for every time it does. With Krark's Thumb, each flip that leaves
   a choice is won unless losing it gives the better chance, knowing how the flips before it went: every
   win is a Krark more, but one loss keeps the spell. A flip with no chance left either way is lost too.
   Which way such a flip goes changes only how a combo that can no longer go infinite is said to end,
   and a win that gains nothing shouldn't make it "used up": it keeps its spell until the mana runs out,
   which is also how it reads once settled with nothing making mana. */
function flipping(thumbs: number, longest: number) {
  const alike = alikeWith(thumbs);
  const either = 1 - 2 * alike;
  const rows = either > 0 ? [] : Array.from({ length: longest + 1 }, (_, flips) => binomial(flips));
  const ends = new Float64Array((longest + 1) * TRACKED);
  const now = new Float64Array(ends.length);
  const out = new Float64Array(TRACKED);

  /* every coin alike or none to choose from: each number of wins as likely as the coins make it */
  const counted = (flips: number, stays: boolean, staying: number) => {
    const chance = rows[flips];
    out.fill(0);
    for (let wins = stays ? 1 : 0; wins <= flips; wins++) {
      for (let q = 0; q < TRACKED; q++) {
        out[q] += chance[wins] * ends[wins * TRACKED + q];
      }
    }
    return settleStay(out, stays ? chance[0] : 0, staying);
  };

  /* Back from the last flip, the odds with each number of wins so far, playing every choice left for the
     best chance. Staying where you were is worth what the cast is: guess it, nothing at first, play the
     choices for the best chance with that guess and take the chance they give as the next, until it
     stops growing, which takes a round or two. */
  const chosen = (flips: number, stays: boolean, staying: number) => {
    let self = 0;
    for (;;) {
      now.set(ends.subarray(0, (flips + 1) * TRACKED));
      /* the chance of ending where you were, from no flip won so far */
      let stay = stays ? 1 : 0;
      for (let flip = flips - 1; flip >= 0; flip--) {
        for (let wins = 0; wins <= flip; wins++) {
          const lost = wins * TRACKED;
          const won = lost + TRACKED;
          const kept = now[won + WIN] > 0 && now[won + WIN] >= now[lost + WIN] + (wins === 0 ? stay * self : 0) - 1e-12;
          for (let q = 0; q < TRACKED; q++) {
            now[lost + q] = alike * (now[lost + q] + now[won + q]) + either * now[(kept ? won : lost) + q];
          }
          if (wins === 0) {
            stay *= kept ? alike : 1 - alike;
          }
        }
      }
      const win = now[WIN] / (1 - stay);
      if (stay === 0 || win <= self + 1e-12) {
        out.set(now.subarray(0, TRACKED));
        return settleStay(out, stay, staying);
      }
      self = win;
    }
  };

  return { ends, rows, play: either > 0 ? chosen : counted };
}

/* Times over the mana where a cast can come back with more of it, far more than it takes for the odds to
   settle */
const MOST_SWEEPS = 1000;

/* A copy of a copying spell may copy the Storm-Kiln Artist or Tavern Scoundrel rather than Krark, for
   the mana, and the spell itself too if it resolves. That pays while the Krarks are few and the mana is
   short: the odds weigh it short of the Krarks from which a cast falls short of the dearest spell rarer
   than one in ten thousand, with less than this many casts' worth of that spell in mana, aiming at most
   this many of a cast's first copies at the maker. An aim is both at once, the spell itself past the
   copies; with Krarks enough that aiming the spell itself can't show, only the copies are weighed. */
const MAKER_CASTS = 3;
const MOST_MAKERS = 4;
const AIMS = 2 * (MOST_MAKERS + 1);
const makersOf = (aim: number) => aim % (MOST_MAKERS + 1);
const spellTooOf = (aim: number) => aim > MOST_MAKERS;
/* the aim of a cast with few Krarks, each copy aimed as it is won */
const BY_FLIP = -1;
const BY_FLIP_ONLY = [BY_FLIP];

/* The odds from every spot, playing each cast for the best chance, and with Krark's Thumbs each flip of
   it too. With enough Krarks every cast gives back what the dearest spell in hand costs, short of a
   fluke rarer than one in a million, and the spot is settled: only using up the spells can stop the
   combo. `horizon` is the most Krarks that ever takes. Mana past `most` makes too little difference to
   keep count of, but to a lone Krark with its last copying spell. A mana ritual pays only while it's in
   hand and you can pay for it: nothing else makes more mana. */
export function krarkOdds(copiers: Copier[], engine: Engine, { others = 0, thumbs = 0, ...board }: Board = {}) {
  const ritual = engine === 'ritual' ? board.ritual : undefined;
  const costs = copiers.map((copier) => copier.cost);
  const dearest = Math.max(...costs);
  const ritualIndex = copiers.length;
  const ritualBit = ritual ? bit(ritualIndex) : 0;
  const copying = bit(ritualIndex) - 1;
  const ritualMana = (krarks: number) => ritual!.makes * (ritual!.perKrark ? krarks : 1);
  /* a creature making Treasures, the Artist or the Scoundrel, which the copying spells can copy too: a
     spell copying every nontoken creature along with Krark, any other with the copies aimed at it */
  const treasures = engine === 'magecraft' || engine === 'flips';
  const fewestArtists = treasures ? 1 : 0;
  /* The Artists or Scoundrels the odds tell apart, up to as many as the dearest spell costs: with that
     many Artists a cast pays for itself whatever the flips, and the spot is settled; with that many
     Scoundrels a single win pays for two casts of it, and more are counted as that many, which is off by
     a ten-thousandth at most from where the combo can breed them. */
  const levels = treasures ? (engine === 'flips' ? dearest : Math.max(1, dearest - 1)) : 1;
  const spellCosts = ritual ? [...costs, ritual.cost] : costs;
  const hands = bit(spellCosts.length);
  /* The Krarks from which each hand is settled, by Artists or Scoundrels, and short of which copies
     aimed at the maker are weighed. A cast has to give back what the dearest spell in hand costs: as
     many wins where each new Krark makes a mana, fewer the more Artists make a Treasure for the cast and
     for every copy, none with an Artist for each mana of it, or the more Scoundrels make two for every
     win, and the copies of a mana ritual that pay for itself and for that spell. */
  const needsFor = (group: number) => {
    const artists = fewestArtists + Math.floor(group / hands);
    const dear = Math.max(0, ...costs.filter((_, i) => (group % hands) & bit(i)));
    return (krarks: number) => {
      if (ritual) {
        return Math.ceil((dear + ritual.cost) / ritualMana(krarks));
      }
      if (engine === 'magecraft') {
        return Math.ceil(dear / artists) - 1;
      }
      return engine === 'flips' ? Math.ceil(dear / (2 * artists)) : dear;
    };
  };
  const groups = Array.from({ length: levels * hands }, (_, group) => group);
  const horizons = groups.map((group) => horizonFor(needsFor(group), thumbs, 1e-6));
  const aimedShortOf = groups.map((group) => (treasures ? horizonFor(needsFor(group), thumbs, 1e-4) : 1));
  const horizon = Math.max(...horizons);
  /* the most of a cast's copies the odds weigh aiming at the maker from a spot: none past the Krarks or
     the mana where it could pay, or the makers they tell apart */
  const makersAt = (krarks: number, artists: number, mana: number, hand: number) =>
    krarks < aimedShortOf[(artists - fewestArtists) * hands + hand] && mana < MAKER_CASTS * dearest
      ? Math.min(MOST_MAKERS, krarks, dearest - artists)
      : 0;
  const most = 16 * dearest + 2 * horizon;
  const size = most + 1;
  const cheapest = Array.from({ length: hands }, (_, hand) => Math.min(...spellCosts.filter((_, i) => hand & bit(i))));
  const spellsIn = Array.from({ length: hands }, (_, hand) => costs.filter((_, i) => hand & bit(i)).length);
  /* the only copying spell in each hand, where there is just one */
  const lastSpell = Array.from({ length: hands }, (_, hand) =>
    spellsIn[hand] === 1 ? costs.findIndex((_, i) => hand & bit(i)) : -1,
  );
  const alike = alikeWith(thumbs);
  const either = 1 - 2 * alike;
  if (ritual) {
    /* A hand that lost the mana ritual can only use its spells up, so it is settled sooner: once not one
       of all the casts the mana could pay for is at all likely to win every flip, which with nothing
       left to win takes every coin of each. */
    const hopeless = Math.ceil(Math.log(1e-6 / most) / Math.log(alike));
    for (let hand = 0; hand < ritualBit; hand++) {
      horizons[hand] = Math.min(horizons[hand], hopeless);
    }
  }
  /* the Krarks past which no cast is taken to win every flip, however few it takes to be settled: rarer
     than one in a billion for each */
  const deep = Math.max(horizon, Math.ceil(Math.log(1e-9) / Math.log(alike)));
  const depth = 2 * deep + 2;
  const flips = flipping(thumbs, deep);
  const { ends } = flips;
  const chances = (krarks: number): Float64Array | undefined => (thumbs === 0 ? flips.rows[krarks] : undefined);
  /* the mana a cast of a copying spell makes losing every flip: the Artists' Treasures for the cast */
  const staying = (artists: number) => (engine === 'magecraft' ? artists : 0);

  /* the makers the first `copies` copies of a cast make, with `makers` of them aimed at the maker */
  const makersAmong = (copies: number, makers: number) =>
    makers >= copies ? (copies * (copies - 1)) / 2 : (makers * (makers - 1)) / 2 + (copies - makers) * makers;
  /* What casting copying spell `i` with `artists` makers makes, winning `wins` flips, `all` of them or
     not: the copies and, if it resolves, the spell itself make Krarks but for `makers` of the copies
     aimed at the maker, the first ones, and the spell itself if `spellToo`; and mana by the engine, a
     legend tapping for one, a creature untapping a land, each Artist a Treasure for the cast and for
     each copy, each Scoundrel two for each win, the makers made before a copy counting for it. */
  const gainsOf = (i: number, artists: number, wins: number, all: boolean, makers: number, spellToo: boolean) => {
    const { everyNontoken } = copiers[i];
    const resolved = all ? wins + 1 : wins;
    const toMaker = everyNontoken ? 0 : Math.min(makers, wins) + (all && spellToo ? 1 : 0);
    const krarks = resolved - toMaker;
    const before = everyNontoken ? (wins * (wins - 1)) / 2 : makersAmong(wins, makers);
    let mana = 0;
    if (engine === 'legendary') {
      /* every copy a legend: the spells whose copies aren't are left out of such a combo */
      mana = krarks;
    } else if (engine === 'creature') {
      mana = everyNontoken ? krarks * (1 + others) : krarks;
    } else if (engine === 'magecraft') {
      mana = artists * (1 + wins) + before;
    } else if (engine === 'flips') {
      mana = 2 * (artists * wins + before);
    }
    /* past the Artists or Scoundrels the odds tell apart, more are the same */
    const nextArtists = treasures ? Math.min(dearest, artists + (everyNontoken ? resolved : toMaker)) : artists;
    return { krarks, casts: 1, mana, nextArtists };
  };
  const NO_GAINS: Gains = { krarks: 0, casts: 0, mana: 0 };

  /* With mana to spare for every cast, what every spot comes to by copying spells in hand, makers up to
     as many as the dearest spell costs, and Krarks: a cast wins none of the flips, which changes nothing,
     some of them, each a new Krark, or all, which makes one more and uses the spell up. Past `deep`
     Krarks no cast is taken to win every flip, so the combo never stops. The spell cast is the one
     copying every nontoken creature if there is one, else the first in hand: the chance is the same
     either way, only the mana made differs. */
  const unlimitedLevels = treasures ? dearest : 1;
  const unlimited = new Float64Array(hands * unlimitedLevels * depth * TRACKED);
  const unlimitedAt = (hand: number, artists: number, krarks: number) =>
    (((hand & copying) * unlimitedLevels + Math.min(artists, dearest) - fewestArtists) * depth +
      Math.min(krarks, depth - 1)) *
    TRACKED;
  const byHand = [...Array(hands).keys()].filter((hand) => hand & copying).sort((a, b) => spellsIn[a] - spellsIn[b]);
  for (const hand of byHand) {
    const inHand = copiers.map((_, i) => i).filter((i) => hand & bit(i));
    const i = inHand.find((spell) => copiers[spell].everyNontoken) ?? inHand[0];
    for (let artists = fewestArtists + unlimitedLevels - 1; artists >= fewestArtists; artists--) {
      for (let krarks = depth - 1; krarks >= 1; krarks--) {
        const slot = unlimitedAt(hand, artists, krarks);
        if (krarks > deep) {
          unlimited[slot + WIN] = 1;
          continue;
        }
        ends.fill(0, 0, TRACKED);
        for (let wins = 1; wins <= krarks; wins++) {
          const all = wins === krarks;
          const gains = gainsOf(i, artists, wins, all, 0, false);
          const nextHand = all ? hand & ~bit(i) : hand;
          if (nextHand === 0) {
            arriving(USED_UP_ALL, 0, gains, ends, wins * TRACKED);
          } else {
            arriving(
              unlimited,
              unlimitedAt(nextHand, gains.nextArtists, krarks + gains.krarks),
              gains,
              ends,
              wins * TRACKED,
            );
          }
        }
        unlimited.set(flips.play(krarks, true, staying(artists)), slot);
      }
    }
  }

  const cells = horizon * levels * hands * size;
  const table = new Float64Array(cells * TRACKED);
  const choice = new Int8Array(cells).fill(-1);
  /* the aim of the chosen cast */
  const aimed = new Int8Array(cells);
  const cellAt = (krarks: number, artists: number, hand: number) =>
    ((krarks * levels + artists - fewestArtists) * hands + hand) * size;
  const settled = (krarks: number, artists: number, hand: number) =>
    artists - fewestArtists >= levels || krarks >= horizons[(artists - fewestArtists) * hands + hand];
  /* whether the table holds the odds from a spot, rather than them being plain */
  const held = (krarks: number, artists: number, mana: number, hand: number) =>
    (hand & copying) !== 0 && mana >= cheapest[hand] && !settled(krarks, artists, hand);
  /* the mana that keeps a settled combo going: the mana ritual's cost where the mana comes from it, a
     copying spell making none */
  const restarts = (hand: number) => (ritual ? ritual.cost : cheapest[hand]);

  /* The most mana casting spell `i` can leave you ahead by with the Krarks and the hand as they were:
     losing every flip of a copying spell, each Artist still making a Treasure for the cast, or winning
     all but one of the mana ritual's */
  const rise = (krarks: number, artists: number, i: number) =>
    i === ritualIndex ? ritualMana(krarks) * (krarks - 1) - ritual!.cost : staying(artists) - costs[i];

  /* The mana each cast costs a lone Krark holding its last copying spell, none where the cast pays for
     itself or the spot is any other. Such a Krark can only use the spell up, by a single flip won as
     often whatever the mana, and losing it costs nothing but this: so unlike any other spot, its odds
     of using the spell up go on rising with the mana, a cast at a time, however much there is. */
  const lone = (krarks: number, artists: number, hand: number) => {
    const last = krarks === 1 ? lastSpell[hand] : -1;
    return last < 0 ? 0 : Math.max(0, -rise(1, artists, last));
  };

  /* what a spot comes to, worked out on the spot rather than kept */
  const spot = new Float64Array(TRACKED);
  const STOPPED = new Float64Array(TRACKED);

  /* A lone Krark with its last copying spell and more mana than the table keeps count of: `casts` casts
     until the mana is back within the table, each lost unless every coin wins, which uses the spell up
     with two Krarks made. Where the combo stops at the j-th of them it has made j casts, the mana of
     j - 1 lost ones and of the won one, and two Krarks; past them all, what the table says from `from`
     on top of the casts' own. */
  const loneSpot = (from: number, casts: number, artists: number, hand: number) => {
    const p = alike;
    const q = 1 - alike;
    const left = q ** casts;
    /* sums over the lost casts before the won one, m = 0 to casts - 1, of q^m, m q^m and m² q^m */
    const g0 = (1 - left) / p;
    const g1 = q / p ** 2 - left * (q / p ** 2 + casts / p);
    const g2 =
      (q * (1 + q)) / p ** 3 - left * ((q * (1 + q)) / p ** 3 + (2 * casts * q) / p ** 2 + (casts * casts) / p);
    const lost = gainsOf(lastSpell[hand], artists, 0, false, 0, false);
    const won = gainsOf(lastSpell[hand], artists, 1, true, 0, false);
    spot[WIN] = left * table[from + WIN];
    spot[USED_UP] = 1 - left + left * table[from + USED_UP];
    const stop = 1 - table[from + WIN];
    for (const q of MADE) {
      const each = q === KRARKS ? 0 : q === CASTS ? 1 : lost.mana;
      const last = q === KRARKS ? won.krarks : q === CASTS ? 1 : won.mana;
      const mean = table[from + q];
      spot[q] = p * (each * g1 + last * g0) + left * (casts * each * stop + mean);
      spot[q + 1] =
        p * (each * each * g2 + 2 * each * last * g1 + last * last * g0) +
        left * (casts * casts * each * each * stop + 2 * casts * each * mean + table[from + q + 1]);
    }
  };

  /* Settled with the mana ritual used up or too dear to cast, nothing makes mana: the cheapest copying
     spell is cast while the mana lasts, and the combo runs out of it with the spells in hand, so many
     Krarks never winning every flip of a cast unless made to, which with nothing left to win they
     aren't. Each cast still makes a Krark for every flip won: half of them without a Thumb, and with
     one those where every coin comes up a win, the rest being lost to keep the spell. */
  const hopelessSpot = (krarks: number, mana: number, hand: number) => {
    const casts = Math.floor(mana / cheapest[hand]);
    const won = thumbs === 0 ? 0.5 : alike;
    let mean = krarks;
    let square = krarks * krarks;
    for (let cast = 0; cast < casts; cast++) {
      square = (1 + won) ** 2 * square + won * (1 - won) * mean;
      mean *= 1 + won;
    }
    spot.fill(0);
    spot[KRARKS] = mean - krarks;
    spot[KRARKS + 1] = square - 2 * krarks * mean + krarks * krarks;
    spot[CASTS] = casts;
    spot[CASTS + 1] = casts * casts;
  };

  /* What a cast making `gains` is worth landing at a spot, put in `ends` for winning `wins` of its flips.
     Mana past what the table keeps count of reads as the most it does, but for a lone Krark with its last
     copying spell, whose casts until then are counted. Settled with the mana ritual in hand or with the
     engine making mana, the spot is worth what it is with mana to spare; settled with nothing making mana,
     or short of the mana for any spell, the combo stops. */
  const reach = (wins: number, krarks: number, artists: number, mana: number, hand: number, gains: Gains) => {
    const slot = wins * TRACKED;
    if ((hand & copying) === 0) {
      arriving(USED_UP_ALL, 0, gains, ends, slot);
      return;
    }
    const each = mana > most ? lone(krarks, artists, hand) : 0;
    const casts = each > 0 ? Math.ceil((mana - most) / each) : 0;
    const within = Math.min(most, mana - casts * each);
    if (held(krarks, artists, within, hand)) {
      const from = (cellAt(krarks, artists, hand) + within) * TRACKED;
      if (casts === 0) {
        arriving(table, from, gains, ends, slot);
      } else {
        loneSpot(from, casts, artists, hand);
        arriving(spot, 0, gains, ends, slot);
      }
    } else if (!settled(krarks, artists, hand) || within < restarts(hand)) {
      arriving(STOPPED, 0, gains, ends, slot);
    } else if ((hand & ritualBit) === ritualBit) {
      arriving(unlimited, unlimitedAt(hand, artists, krarks), gains, ends, slot);
    } else {
      hopelessSpot(krarks, within, hand);
      arriving(spot, 0, gains, ends, slot);
    }
  };

  /* Where casting copying spell `i` and losing every flip leaves you, put in `ends`, unless it leaves you
     where you were, which it then says: the same Krarks, Artists and hand, with the mana you had. */
  const loseAll = (krarks: number, artists: number, mana: number, hand: number, i: number) => {
    const left = Math.min(most, mana + rise(krarks, artists, i));
    if (left === mana) {
      ends.fill(0, 0, TRACKED);
      return true;
    }
    reach(0, krarks, artists, left, hand, { krarks: 0, casts: 1, mana: staying(artists) });
    return false;
  };

  /* Where winning each number of flips of a copying spell leaves you is the same whatever the mana, but
     for the mana itself, so it is worked out once for a hand, its Krarks and the aim: what the wins make
     and the mana they leave you ahead by, the least they have to leave for the odds to be anything, and
     where the table keeps the spot they land on or, settled or with the spells used up, what it is worth
     outright. Settled with nothing making mana, what is made depends on the mana left, so that is worked
     out on the spot too. With no Thumb to choose by, the wins worth the same whatever the mana are summed
     up front, each by its chance, leaving only the `open` ones to go by the mana. */
  const HOPELESS = -2;
  const landings = copiers.map(() =>
    Array.from({ length: AIMS }, () => ({
      krarks: 0,
      artists: 0,
      hand: 0,
      ahead: new Float64Array(horizon + 1),
      least: new Float64Array(horizon + 1),
      held: new Int32Array(horizon + 1),
      made: new Float64Array(horizon + 1),
      mana: new Float64Array(horizon + 1),
      nextHand: new Int32Array(horizon + 1),
      worth: new Float64Array((horizon + 1) * TRACKED),
      open: new Int32Array(horizon + 1),
      opens: 0,
      sure: new Float64Array(TRACKED),
    })),
  );
  type Landing = (typeof landings)[number][number];
  const land = (krarks: number, artists: number, hand: number, i: number, aim: number) => {
    const landing = landings[i][aim];
    if (landing.krarks === krarks && landing.artists === artists && landing.hand === hand) {
      return landing;
    }
    Object.assign(landing, { krarks, artists, hand, opens: 0 });
    landing.sure.fill(0);
    const { cost } = copiers[i];
    const chance = chances(krarks);
    for (let wins = 1; wins <= krarks; wins++) {
      const all = wins === krarks;
      const gains = gainsOf(i, artists, wins, all, makersOf(aim), spellTooOf(aim));
      const nextHand = all ? hand & ~bit(i) : hand;
      const nextKrarks = krarks + gains.krarks;
      const slot = wins * TRACKED;
      /* the spells all used up, the combo stops whatever the mana left; settled, it goes on with the mana
         for a cast; else the table says, or the casts left say, from that mana on */
      let least = cheapest[nextHand];
      let held = -1;
      if ((nextHand & copying) === 0) {
        least = -Infinity;
        arriving(USED_UP_ALL, 0, gains, landing.worth, slot);
      } else if (!settled(nextKrarks, gains.nextArtists, nextHand)) {
        held = cellAt(nextKrarks, gains.nextArtists, nextHand);
      } else if ((nextHand & ritualBit) === ritualBit) {
        least = restarts(nextHand);
        arriving(unlimited, unlimitedAt(nextHand, gains.nextArtists, nextKrarks), gains, landing.worth, slot);
      } else {
        held = HOPELESS;
      }
      landing.ahead[wins] = gains.mana - cost;
      landing.least[wins] = least;
      landing.held[wins] = held;
      landing.made[wins] = gains.krarks;
      landing.mana[wins] = gains.mana;
      landing.nextHand[wins] = nextHand;
      /* a cast is paid for, so it leaves at least the mana it makes */
      if (chance && held === -1 && (gains.mana >= least || least === Infinity)) {
        for (let q = 0; q < TRACKED; q++) {
          landing.sure[q] += chance[wins] * landing.worth[slot + q];
        }
      } else {
        landing.open[landing.opens++] = wins;
      }
    }
    return landing;
  };

  /* what a landing's `wins` are worth, cast with `mana`, put at `slot` of `into` */
  const gains: Gains = { krarks: 0, casts: 1, mana: 0 };
  const landOn = (landing: Landing, wins: number, mana: number, into: Float64Array, slot: number) => {
    const left = mana + landing.ahead[wins];
    const held = landing.held[wins];
    gains.krarks = landing.made[wins];
    gains.mana = landing.mana[wins];
    if (left < landing.least[wins]) {
      arriving(STOPPED, 0, gains, into, slot);
    } else if (held >= 0) {
      arriving(table, (held + Math.min(most, left)) * TRACKED, gains, into, slot);
    } else if (held === HOPELESS) {
      hopelessSpot(landing.krarks + gains.krarks, Math.min(most, left), landing.nextHand[wins]);
      arriving(spot, 0, gains, into, slot);
    } else {
      into.set(landing.worth.subarray(wins * TRACKED, (wins + 1) * TRACKED), slot);
    }
  };

  /* what a cast comes to, and one way it can go */
  const result = new Float64Array(TRACKED);
  const way = new Float64Array(TRACKED);

  /* What casting copying spell `i` from a spot the table holds comes to, with the copies `aim` says at
     the maker, then playing on for the best chance, with where losing every flip leaves you in `ends`
     already, or `stays` for where you were. With no Thumb each number of wins is as likely as the coins
     make it, and a cast that can leave you where you were counts only when it doesn't. */
  const castCopier = (
    krarks: number,
    artists: number,
    mana: number,
    hand: number,
    i: number,
    aim: number,
    stays: boolean,
  ) => {
    const landing = land(krarks, artists, hand, i, aim);
    const chance = chances(krarks);
    if (!chance) {
      for (let open = 0; open < landing.opens; open++) {
        const wins = landing.open[open];
        landOn(landing, wins, mana, ends, wins * TRACKED);
      }
      result.set(flips.play(krarks, stays, staying(artists)));
      return result;
    }
    result.set(landing.sure);
    for (let open = 0; open < landing.opens; open++) {
      const wins = landing.open[open];
      landOn(landing, wins, mana, way, 0);
      for (let q = 0; q < TRACKED; q++) {
        result[q] += chance[wins] * way[q];
      }
    }
    if (!stays) {
      for (let q = 0; q < TRACKED; q++) {
        result[q] += chance[0] * ends[q];
      }
    }
    return settleStay(result, stays ? chance[0] : 0, staying(artists));
  };

  /* With few Krarks, each copy of a cast is aimed as it is won, by the flips left: a copy won with flips
     to come pays off through the copies after it, one won on the last flip only in casts to come, and
     that can be worth two in a hundred to the chance. Played back flip by flip like `flipping` does,
     over the wins so far and how many of them copied the maker, which are the first of them, every copy
     and every flip that leaves a choice going the way that gives the better chance. The spell itself is
     aimed as it is cast, so both ways are tried. With more Krarks the aim is fixed as the spell is cast,
     which loses nothing to speak of. */
  const FEW_KRARKS = 8;
  const fewWidth = MOST_MAKERS + 2;
  const fewEnd = new Float64Array((FEW_KRARKS + 2) * fewWidth * TRACKED);
  const few = new Float64Array(fewEnd.length);
  const fewAimed = new Uint8Array(FEW_KRARKS * fewWidth);
  /* the aim of the last cast played out flip by flip */
  let fewPlan: Odds['aim'];
  const castAiming = (
    krarks: number,
    artists: number,
    mana: number,
    hand: number,
    i: number,
    makers: number,
    stays: boolean,
  ) => {
    result[WIN] = -1;
    for (const spellToo of [false, true]) {
      for (let wins = 0; wins <= krarks; wins++) {
        for (let aimed = 0; aimed <= Math.min(wins, makers); aimed++) {
          const slot = (wins * fewWidth + aimed) * TRACKED;
          if (wins === 0) {
            fewEnd.set(stays ? STOPPED : ends.subarray(0, TRACKED), slot);
          } else {
            landOn(land(krarks, artists, hand, i, aimed + (spellToo ? MOST_MAKERS + 1 : 0)), wins, mana, fewEnd, slot);
          }
        }
      }
      let self = 0;
      for (;;) {
        few.set(fewEnd);
        let stay = stays ? 1 : 0;
        for (let flip = krarks - 1; flip >= 0; flip--) {
          for (let wins = 0; wins <= flip; wins++) {
            for (let aimed = 0; aimed <= Math.min(wins, makers); aimed++) {
              const lost = (wins * fewWidth + aimed) * TRACKED;
              const krark = lost + fewWidth * TRACKED;
              const toMaker = aimed === wins && aimed < makers && few[krark + TRACKED + WIN] > few[krark + WIN] + 1e-12;
              const won = toMaker ? krark + TRACKED : krark;
              if (aimed === wins) {
                fewAimed[flip * fewWidth + aimed] = toMaker ? 1 : 0;
              }
              const keep =
                few[won + WIN] > 0 && few[won + WIN] >= few[lost + WIN] + (lost === 0 ? stay * self : 0) - 1e-12;
              for (let q = 0; q < TRACKED; q++) {
                few[lost + q] = alike * (few[lost + q] + few[won + q]) + either * few[(keep ? won : lost) + q];
              }
              if (lost === 0) {
                stay *= keep ? alike : 1 - alike;
              }
            }
          }
        }
        const win = few[WIN] / (1 - stay);
        /* with no Thumb there is no flip to choose, so no guess to better */
        if (stay === 0 || either === 0 || win <= self + 1e-12) {
          if (win > result[WIN] + 1e-12) {
            result.set(few.subarray(0, TRACKED));
            settleStay(result, stay, staying(artists));
            /* for each copy aimed at the maker, the latest flip won on which it still is */
            const byFlip: number[] = [];
            for (let aimed = 0; aimed < makers; aimed++) {
              let latest = 0;
              for (let flip = aimed; flip < krarks; flip++) {
                if (fewAimed[flip * fewWidth + aimed]) {
                  latest = flip + 1;
                }
              }
              if (latest === 0) {
                break;
              }
              byFlip.push(latest);
            }
            fewPlan = { byFlip, spellToo };
          }
          break;
        }
        self = win;
      }
    }
    return result;
  };

  /* What casting the mana ritual from a spot the table holds comes to: every copy makes its mana, and so
     does the spell if it resolves. Short of that it comes back to hand with the Krarks as they were,
     which the table holds too, so those odds are read straight from it. */
  const ritualGains: Gains = { krarks: 0, casts: 1, mana: 0 };
  const castRitual = (krarks: number, artists: number, mana: number, hand: number) => {
    const made = ritualMana(krarks);
    const paid = mana - ritual!.cost;
    const back = cellAt(krarks, artists, hand);
    ritualGains.mana = made * (krarks + 1);
    reach(krarks, krarks, artists, paid + made * (krarks + 1), hand & ~ritualBit, ritualGains);
    for (let wins = 0; wins < krarks; wins++) {
      const left = Math.min(most, paid + made * wins);
      ritualGains.mana = made * wins;
      if (left >= cheapest[hand]) {
        arriving(table, (back + left) * TRACKED, ritualGains, ends, wins * TRACKED);
      } else {
        arriving(STOPPED, 0, ritualGains, ends, wins * TRACKED);
      }
    }
    result.set(flips.play(krarks, false, 0));
    return result;
  };

  type Cast = (krarks: number, artists: number, mana: number, hand: number, i: number, aim: number) => Float64Array;

  const castSpell: Cast = (krarks, artists, mana, hand, i, aim) => {
    if (i === ritualIndex) {
      return castRitual(krarks, artists, mana, hand);
    }
    const stays = loseAll(krarks, artists, mana, hand, i);
    return aim === BY_FLIP
      ? castAiming(krarks, artists, mana, hand, i, makersAt(krarks, artists, mana, hand), stays)
      : castCopier(krarks, artists, mana, hand, i, aim, stays);
  };

  /* While the odds of a hand settle, each copying spell's casts kept by spell, aim and mana, with what
     losing every flip they went by was worth: the rest of where they lead has more Krarks or makers, so
     they change only when that does. With no Thumb to choose by, they then change by as much, as often
     as every flip is lost. */
  const slots = copiers.length * (AIMS + 1) * size;
  const kept = new Float64Array(slots * TRACKED);
  const lost = new Float64Array(kept.length);
  /* the casts not kept since the hand was begun */
  const stale = new Uint8Array(slots);
  const castKept: Cast = (krarks, artists, mana, hand, i, aim) => {
    if (i === ritualIndex) {
      return castRitual(krarks, artists, mana, hand);
    }
    const cast = (i * (AIMS + 1) + (aim === BY_FLIP ? AIMS : aim)) * size + mana;
    const slot = cast * TRACKED;
    const stays = loseAll(krarks, artists, mana, hand, i);
    if (
      stale[cast] ||
      Math.abs(ends[WIN] - lost[slot + WIN]) > 1e-12 ||
      Math.abs(ends[USED_UP] - lost[slot + USED_UP]) > 1e-12
    ) {
      if (thumbs === 0 && !stale[cast]) {
        const every = 0.5 ** krarks;
        for (let q = 0; q < TRACKED; q++) {
          kept[slot + q] += every * (ends[q] - lost[slot + q]);
        }
      } else {
        kept.set(
          aim === BY_FLIP
            ? castAiming(krarks, artists, mana, hand, i, makersAt(krarks, artists, mana, hand), stays)
            : castCopier(krarks, artists, mana, hand, i, aim, stays),
          slot,
        );
      }
      lost.set(ends.subarray(0, TRACKED), slot);
      stale[cast] = 0;
    }
    result.set(kept.subarray(slot, slot + TRACKED));
    return result;
  };

  /* the aims to weigh casting spell `i` from a spot: flip by flip with few Krarks, else up to the copies
     aimed at the maker */
  const aimLists = Array.from({ length: MOST_MAKERS + 1 }, (_, makers) => [...Array(makers + 1).keys()]);
  const aimsFor = (krarks: number, artists: number, mana: number, hand: number, i: number) => {
    const makers = i === ritualIndex || copiers[i].everyNontoken ? 0 : makersAt(krarks, artists, mana, hand);
    return makers > 0 && krarks <= FEW_KRARKS ? BY_FLIP_ONLY : aimLists[makers];
  };

  /* The best of the first `spells` spells to cast from a spot the table holds, and of the aims, kept
     there, and by how much its odds changed. With none to pay for, the spot holds nothing until the
     ritual is counted. */
  const best = new Float64Array(TRACKED);
  const settle = (
    krarks: number,
    artists: number,
    mana: number,
    hand: number,
    cast: Cast,
    spells = spellCosts.length,
  ) => {
    const cell = cellAt(krarks, artists, hand) + mana;
    const from = cell * TRACKED;
    best.fill(0);
    let bestSpell = -1;
    let bestAim = 0;
    for (let i = 0; i < spells; i++) {
      if (!(hand & bit(i)) || mana < spellCosts[i]) {
        continue;
      }
      for (const aim of aimsFor(krarks, artists, mana, hand, i)) {
        const tally = cast(krarks, artists, mana, hand, i, aim);
        if (bestSpell < 0 || tally[WIN] > best[WIN] + 1e-12) {
          best.set(tally);
          bestSpell = i;
          bestAim = aim;
        }
      }
    }
    const change = Math.max(Math.abs(best[WIN] - table[from + WIN]), Math.abs(best[USED_UP] - table[from + USED_UP]));
    table.set(best, from);
    choice[cell] = bestSpell;
    aimed[cell] = bestAim;
    return change;
  };

  for (let krarks = horizon - 1; krarks >= 1; krarks--) {
    for (let artists = fewestArtists + levels - 1; artists >= fewestArtists; artists--) {
      for (let hand = 1; hand < hands; hand++) {
        if ((hand & copying) === 0 || settled(krarks, artists, hand)) {
          continue;
        }
        const inHand = spellCosts.flatMap((_, i) => (hand & bit(i) ? [i] : []));
        const up = Math.max(...inHand.map((i) => rise(krarks, artists, i)));
        if (up < 0) {
          /* every cast leaves less mana or more Krarks, where the odds are worked out already */
          for (let mana = cheapest[hand]; mana <= most; mana++) {
            settle(krarks, artists, mana, hand, castSpell);
          }
          continue;
        }
        /* A cast can come back to the same Krarks, makers and hand with as much mana or more, the mana
           ritual by its copies and a copying spell by more Artists than it costs, so the odds with some
           mana count on those with more as well as less. Go over the mana from the least up with the
           copying spells alone, then from the most down, where the mana comes back to, until the odds
           stop changing. A cast drops at most `drop` mana and comes back at most `up` ahead, so after the
           first time down only the mana that counts on odds that changed needs going over again: from
           `drop` above the highest change down to the lowest, which may count on itself, and on to `up`
           below any change on the way. */
        stale.fill(1);
        for (let mana = cheapest[hand]; mana <= most; mana++) {
          settle(krarks, artists, mana, hand, castKept, copiers.length);
        }
        const drop = Math.max(...inHand.map((i) => spellCosts[i]));
        let top = most;
        let below = cheapest[hand];
        for (let sweep = 0; sweep < MOST_SWEEPS; sweep++) {
          let highest = -1;
          let lowest = Infinity;
          for (let mana = top; mana >= Math.max(cheapest[hand], Math.min(below, lowest - up)); mana--) {
            if (settle(krarks, artists, mana, hand, castKept) > 1e-12) {
              highest = Math.max(highest, mana);
              lowest = mana;
            }
          }
          if (highest < 0) {
            break;
          }
          top = Math.min(most, highest + drop);
          below = lowest;
        }
      }
    }
  }

  const clamp = (spot: Spot) => ({
    krarks: Math.max(1, spot.krarks),
    artists: Math.min(Math.max(fewestArtists, spot.artists), treasures ? dearest : fewestArtists),
    mana: Math.max(0, spot.mana),
    hand: spot.hand & (hands - 1),
  });

  /* the odds a tally comes to: what is made, among the times the combo stops, where it can */
  const oddsOf = (tally: Float64Array): Odds => {
    const odds: Odds = { win: tally[WIN], usedUp: tally[USED_UP] };
    const stop = 1 - tally[WIN];
    if (stop > 1e-9) {
      const spread = (q: number): Spread => {
        const mean = tally[q] / stop;
        return { mean, deviation: Math.sqrt(Math.max(0, tally[q + 1] / stop - mean * mean)) };
      };
      odds.made = { krarks: spread(KRARKS), casts: spread(CASTS), mana: spread(MANA) };
    }
    return odds;
  };

  /* the aim of casting spell `i` from a spot with `aim`, as the odds say it: played out again where each
     copy is aimed as it is won */
  const aiming = (krarks: number, artists: number, mana: number, hand: number, i: number, aim: number) => {
    if (i === ritualIndex || aim === 0) {
      return {};
    }
    if (aim === BY_FLIP) {
      castSpell(krarks, artists, mana, hand, i, aim);
      return { aim: fewPlan };
    }
    return { aim: { byFlip: Array<number>(makersOf(aim)).fill(krarks), spellToo: spellTooOf(aim) } };
  };

  return {
    horizon,
    most,
    /* Krarks enough that more make no difference to the odds: no cast is taken to win every flip */
    plenty: deep + 1,
    /* the odds from a spot, at its best */
    at(spot: Spot): Odds {
      const { krarks, artists, mana, hand } = clamp(spot);
      reach(0, krarks, artists, mana, hand, NO_GAINS);
      const odds = oddsOf(ends);
      const counted = Math.min(most, mana);
      if (!held(krarks, artists, counted, hand)) {
        return odds;
      }
      const cell = cellAt(krarks, artists, hand) + counted;
      const cast = choice[cell];
      return { ...odds, cast, ...aiming(krarks, artists, counted, hand, cast, aimed[cell]) };
    },
    /* the odds from a spot casting spell `i` now, if you can pay for it, with the aim that gives the best
       chance, then playing on at your best */
    casting(spot: Spot, i: number): Odds | undefined {
      const { krarks, artists, hand, ...counted } = clamp(spot);
      const mana = Math.min(most, counted.mana);
      if (!(hand & bit(i)) || mana < spellCosts[i] || !held(krarks, artists, mana, hand)) {
        return undefined;
      }
      let odds: Odds | undefined;
      for (const aim of aimsFor(krarks, artists, mana, hand, i)) {
        const tally = castSpell(krarks, artists, mana, hand, i, aim);
        if (!odds || tally[WIN] > odds.win + 1e-12) {
          odds = { ...oddsOf(tally), cast: i, ...aiming(krarks, artists, mana, hand, i, aim) };
        }
      }
      return odds;
    },
    /* the most of a cast's copies the odds weigh aiming at the maker from a spot, the spell itself too or
       not with any */
    makers(spot: Spot): number {
      const { krarks, artists, mana, hand } = clamp(spot);
      return makersAt(krarks, artists, Math.min(most, mana), hand);
    },
    /* the Krarks up to which each copy is aimed as it is won, rather than all as the spell is cast */
    byFlipUpTo: FEW_KRARKS,
    /* whether a spot has the Krarks or the Artists to be settled, its odds those with mana to spare so
       long as something makes mana */
    settled(spot: Spot): boolean {
      const { krarks, artists, hand } = clamp(spot);
      return settled(krarks, artists, hand);
    },
    /* the mana each cast costs a lone Krark holding its last copying spell, whose odds go on changing
       with the mana however much there is: none from any other spot */
    lone(spot: Spot): number {
      const { krarks, artists, hand } = clamp(spot);
      return lone(krarks, artists, hand);
    },
    /* the chance with mana to spare for every cast */
    unlimited(krarks: number, hand: number): number {
      const { artists } = clamp({ krarks, artists: fewestArtists, mana: 0, hand });
      return (hand & copying) === 0 ? 0 : unlimited[unlimitedAt(hand, artists, Math.max(1, krarks)) + WIN];
    },
  };
}

export type KrarkOdds = ReturnType<typeof krarkOdds>;

const solved = new Map<string, KrarkOdds>();
const REMEMBERED = 8;

/* The same odds, worked out once for each set of spells and the board they go with */
function oddsFor(copiers: Copier[], engine: Engine, board: Board): KrarkOdds {
  const key = JSON.stringify([copiers, engine, board]);
  let odds = solved.get(key);
  if (!odds) {
    odds = krarkOdds(copiers, engine, board);
    if (solved.size >= REMEMBERED) {
      solved.delete(solved.keys().next().value!);
    }
    solved.set(key, odds);
  }
  return odds;
}

const KRARK = 'Krark, the Thumbless';
/* a template, the ritual left to you */
const MANA_RITUAL = 'Mana Ritual';

const ENGINES: Record<string, Engine> = {
  'Relic of Legends': 'legendary',
  'Honor-Worn Shaku': 'legendary',
  Earthcraft: 'creature',
  'Storm-Kiln Artist': 'magecraft',
  'Tavern Scoundrel': 'flips',
  [MANA_RITUAL]: 'ritual',
};

/* Spells that copy Krark into a nonlegendary token, by mana value */
const COPIERS: Record<string, Copier> = {
  "Irenicus's Vile Duplication": { cost: 4, everyNontoken: false },
  'Ember Island Production': { cost: 5, everyNontoken: false },
  'Quantum Misalignment': { cost: 5, everyNontoken: false },
  'Multiversal Incursion': { cost: 7, everyNontoken: true },
};

/* A template for a spell that copies a creature you control, like "Instant/Sorcery that Copies a
   Legendary Creature You Control without Bypassing Legend Rule", which leaves the spell to you */
const COPYING_TEMPLATE = /\b(instant|sorcery)\b.*\bcop(y|ies)\b.*\bcreature you control\b/i;
/* ones whose copies aren't legendary, so they can't tap for Relic of Legends or untap Honor-Worn Shaku */
const LOSES_LEGENDARY = /\bnonlegendary\b|(?<!\bwithout )\bbypassing (the )?legend rule\b/i;
const RITUAL_TEMPLATE = /\bmana ritual\b/i;
const MOST_SPELLS = 2;

/* How a won flip pays for the next cast */
const ENGINE_TEXT: Record<string, string> = {
  'Relic of Legends': 'each new Krark taps for a mana with Relic of Legends',
  'Honor-Worn Shaku': 'each new Krark untaps Honor-Worn Shaku for {C}',
  Earthcraft: 'each new Krark untaps a basic land with Earthcraft',
  'Storm-Kiln Artist': 'Storm-Kiln Artist makes a Treasure for the cast and for each copy',
  'Tavern Scoundrel': 'Tavern Scoundrel makes two Treasures for each flip you win',
};

const MANA_HINT: Record<string, string> = {
  'Relic of Legends': 'Counting Relic of Legends and the untapped legendary creatures it can tap, Krark included.',
  'Honor-Worn Shaku': 'Counting Honor-Worn Shaku and the untapped legendary permanents that untap it, Krark included.',
  Earthcraft: 'Counting the basic lands your untapped creatures can untap with Earthcraft, Krark included.',
  'Storm-Kiln Artist': 'Counting your Treasures.',
  'Tavern Scoundrel': 'Counting your Treasures.',
  [MANA_RITUAL]: 'Counting mana that can pay for the copying spells and the mana ritual.',
};

const COST_KEYS = ['firstCost', 'secondCost'];
/* the mana values of Molten Duplication and Heat Shimmer, a common pair */
const TEMPLATE_COSTS = [2, 3];
const ORDINALS = ['first', 'second', 'third', 'fourth'];
const MOST_COST = 12;
const MOST_OTHERS = 30;
/* as many as Multiversal Incursion costs, the least the dearest spell can where they are asked for: the
   odds count Scoundrels no further than that cost, a single win from so many paying for two casts */
const MOST_SCOUNDRELS = 7;
/* past four, sixteen coins a flip, a flip goes against your choice too rarely to show */
const MOST_THUMBS = 4;
/* Manamorphose, two mana of any colors for two, so that it pays for any copying spell */
const RITUAL_COST = 2;
const RITUAL_MANA = 2;

const chance = (probability: number) => formatPercent(probability, 1);

/* a mean and its standard deviation, as 4.2 ± 2.1 */
const oneDecimal = (value: number) => (value < 100 ? value.toFixed(1) : formatNumber(value));
const spread = ({ mean, deviation }: Spread) => `${oneDecimal(mean)} ± ${oneDecimal(deviation)}`;

/* A chance as `chance` rounds it, but quick to work out, and with nothing and next to nothing alike, as
   with everything and next to everything: the doubles reach exactly 0 and 1 long after it shows. */
function rounded(probability: number): string {
  const percent = probability * 100;
  return percent >= 99.95 ? 'all' : percent < 0.05 ? 'none' : percent.toFixed(1);
}

interface Spell {
  /* missing for a spell the combo leaves to you, which then asks for its mana value */
  name?: string;
  cost?: number;
  everyNontoken: boolean;
}

/* Krark, the Thumbless copies a creature-copying spell targeting itself, and the copies make more Krarks
   to flip more coins with. */
export const krarkFlips = defineWidget('krark-flips', {
  detect(variant) {
    const ritual = variant.requires.some(({ template }) => RITUAL_TEMPLATE.test(template.name));
    const engine = usesAny(variant, Object.keys(ENGINES)) ?? (ritual ? MANA_RITUAL : undefined);
    if (!engine || !uses(variant, KRARK) || !says(variant, /\bflips? you won\b|\bflipping a coin\b/i)) {
      return undefined;
    }
    const legendary = ENGINES[engine] === 'legendary';
    /* the named spells' copies aren't legendary, so they make no mana for an engine that taps legends */
    const named = legendary
      ? []
      : variant.uses
          .map((card) => card.card.name)
          .filter((name) => name in COPIERS)
          .sort((a, b) => variant.description.indexOf(a) - variant.description.indexOf(b));
    const templated = variant.requires
      .filter(
        ({ template }) => COPYING_TEMPLATE.test(template.name) && !(legendary && LOSES_LEGENDARY.test(template.name)),
      )
      .reduce((sum, { quantity }) => sum + quantity, 0);
    const spells: Spell[] = [
      ...named.map((name) => ({ name, ...COPIERS[name] })),
      ...Array.from({ length: templated }, () => ({ everyNontoken: false })),
    ];
    if (spells.length === 0 || spells.length > MOST_SPELLS) {
      return undefined;
    }
    /* each a Krark already when the combo starts */
    const clones = clonesOf(variant, KRARK);
    return { engine, spells, ...(clones.length > 0 && { clones }) };
  },
  calculator({ engine, spells, clones = [] }) {
    const kind = ENGINES[engine];
    const treasures = kind === 'magecraft' || kind === 'flips';
    /* the Artist or Scoundrel copied along with Krark by Multiversal Incursion, or by copies aimed at it */
    const breeds = treasures && spells.some((spell) => spell.everyNontoken);
    const aims = treasures && spells.some((spell) => !spell.everyNontoken);
    const copiesOthers = kind === 'creature' && spells.some((spell) => spell.everyNontoken);
    const withRitual = kind === 'ritual';
    const pair = spells.length === 2;
    /* the spells left to you, in order: the first and second copying spell, or the only one */
    const slots = spells.map((_, i) => spells.slice(0, i).filter((spell) => spell.cost === undefined).length);
    const unnamed = spells.filter((spell) => spell.cost === undefined).length;
    const left = (slot: number) => (unnamed > 1 ? `the ${ORDINALS[slot]} copying spell` : 'the copying spell');
    const names = spells.map((spell, i) => spell.name ?? left(slots[i]));
    const costInputs = spells.flatMap((spell, i) =>
      spell.cost === undefined
        ? [
            numberInput(COST_KEYS[slots[i]], `Mana value of ${left(slots[i])}`, TEMPLATE_COSTS[slots[i]], {
              min: 1,
              max: MOST_COST,
            }),
          ]
        : [],
    );
    const fixedCosts = spells.map((spell, i) => spell.cost ?? TEMPLATE_COSTS[slots[i]]);
    /* twice what casting each spell once takes: enough for odds worth a look */
    const mana = numberInput('mana', 'Mana you have', 2 * fixedCosts.reduce((sum, cost) => sum + cost, 0), {
      hint: MANA_HINT[engine],
    });
    const ritualInputs = withRitual
      ? [
          numberInput('ritualCost', 'Mana value of the mana ritual', RITUAL_COST, { min: 1, max: MOST_COST }),
          numberInput('ritualMana', 'Mana the mana ritual makes', RITUAL_MANA, {
            min: 1,
            hint: "As does each copy of it. Count only mana that can pay for the copying spells: Manamorphose's two of any color can, but Dark Ritual's black can't pay for blue mana.",
          }),
          choiceInput('ritualPer', 'Mana ritual makes', [
            ['spell', 'That much'],
            ['krark', 'That much per Krark'],
          ]),
        ]
      : [];
    const cloned = clones.length > 0 ? `, ${describeClones(clones)} among them` : '';
    const krarks = numberInput('krarks', 'Krarks you control', 1 + clones.length, {
      min: 1,
      hint: `Krark and its copies${cloned}: change it as the combo goes to see where you stand.`,
    });
    /* the Artists or the Scoundrels, which the combo copies and so counts along the way */
    const copied = [
      ...(aims ? ['the copying spells can copy it instead of Krark'] : []),
      ...(breeds ? ['Multiversal Incursion copies it along with Krark'] : []),
    ];
    const artists = numberInput(kind === 'flips' ? 'scoundrels' : 'artists', `${engine}s you control`, 1, {
      min: 1,
      ...(kind === 'flips' && { max: MOST_SCOUNDRELS }),
      hint: `${capitalize(copied.join(', and '))}.`,
    });
    const others = numberInput('others', 'Other nontoken creatures you control', 0, {
      max: MOST_OTHERS,
      hint: 'Multiversal Incursion copies them along with Krark, and each copy untaps a land too.',
    });
    const thumbs = numberInput('thumbs', "Krark's Thumbs you control", 0, {
      max: MOST_THUMBS,
      hint: "Each doubles the coins you flip, and you keep the one you like. It's legendary, so a second takes something like Mirror Box.",
    });
    const hand = choiceInput('hand', 'Copying spells in your hand', [
      ['3', 'Both'],
      ['1', `Only ${names[0]}`],
      ['2', `Only ${names[1]}`],
    ]);
    /* side by side: the spells, what they cost and which you still have, then the board */
    const inputs: Input[] = [
      mana,
      ...costInputs,
      ...ritualInputs,
      ...(pair ? [hand] : []),
      krarks,
      thumbs,
      ...(treasures ? [artists] : []),
      ...(copiesOthers ? [others] : []),
    ];
    const spellNames = [
      ...spells.flatMap((spell) => (spell.name ? [spell.name] : [])),
      ...(unnamed > 0 ? ['a creature-copying spell targeting Krark'] : []),
      ...(withRitual ? ['the mana ritual'] : []),
    ];
    const spellText =
      spellNames.length > 2 ? `${spellNames.slice(0, -1).join(', ')} or ${spellNames.at(-1)}` : spellNames.join(' or ');
    const maker = engine.split(' ').at(-1);
    const copiesText = breeds
      ? ` Multiversal Incursion copies ${engine} too, so each copy of it makes one more ${maker}.`
      : copiesOthers
        ? ' Multiversal Incursion copies your other nontoken creatures too, and each of those untaps a land as well.'
        : '';
    /* copies aimed at the maker rather than Krark, for the mana, where that gives the better chance */
    const aimsText = aims
      ? ` A copy of ${pair && breeds ? 'the other spell' : pair ? 'a spell' : 'the spell'} can copy ${engine} instead, for the mana: where that gives the better chance, the odds aim a cast's first copies at it and say how many, the spell itself after them. Broadly, that is while the mana left after the cast falls short of the next cast or two, and for a copy won with flips still to come; with mana to spare, or a win on the last flip, a Krark is the better copy.`
      : '';
    const thumbText = "with Krark's Thumb take every win unless losing the flip, to keep the spell, gives a better one";
    /* how a combo with no chance left is said to end, which only Krark's Thumb leaves a say in */
    const lostText =
      'With the Thumb and no way left to go infinite, they lose the flip as well: such a combo counts as running out of mana, a copying spell still in hand, rather than as using it up.';
    /* what the stats say the combo has made by the time it stops, where it can */
    const madeText = withRitual
      ? 'Where it stops, how many copies of Krark it has made by then is given as mean ± deviation.'
      : 'Where it stops, how many copies of Krark it has made by then, how many casts and how much mana are given as mean ± deviation.';
    const summary = withRitual
      ? `Each Krark flips a coin whenever you cast ${spellText}. Every win copies the spell: a copy of ${pair ? 'a copying spell' : 'the copying spell'} makes one more Krark, and a copy of the mana ritual makes its mana again. A single loss returns the spell to your hand to cast again, but win every flip and it resolves too and is used up. The loop stops once ${pair ? 'both copying spells are' : 'the copying spell is'}, or once you can't pay for the next cast. The odds cast whichever spell gives the better chance each time, and ${thumbText}. ${lostText} ${madeText}`
      : `Each Krark flips a coin whenever you cast ${spellText}. Every win copies the spell for one more Krark, and ${ENGINE_TEXT[engine]}.${copiesText}${aimsText} A single loss returns the spell to your hand to cast again, but win every flip and it resolves for one more Krark and is used up. The loop stops once ${pair ? 'both spells are' : 'it is'}, or once you can't pay for the next cast. ${pair ? `The odds cast whichever spell gives the better chance each time, and ${thumbText}.` : "With Krark's Thumb the odds take every win unless losing the flip, to keep the spell, gives the better chance."} ${lostText} ${madeText}`;
    return {
      category: 'chance',
      title: "Will Krark's coin flips go infinite?",
      summary,
      inputs,
      compute(values) {
        const copiers = spells.map((spell, i) => ({
          cost: spell.cost ?? values.numbers[COST_KEYS[slots[i]]],
          everyNontoken: spell.everyNontoken,
        }));
        const odds = oddsFor(copiers, kind, {
          others: copiesOthers ? values.numbers.others : 0,
          thumbs: values.numbers.thumbs,
          ...(withRitual && {
            ritual: {
              cost: values.numbers.ritualCost,
              makes: values.numbers.ritualMana,
              perKrark: values.choices.ritualPer === 'krark',
            },
          }),
        });
        const copying = pair ? Number(values.choices.hand) : 1;
        const both = copying === 3;
        /* the mana ritual comes after the copying spells, and you always have it */
        const ritualIndex = spells.length;
        const inHand = withRitual ? copying | (1 << ritualIndex) : copying;
        const castable = [...spells.keys(), ritualIndex].filter((i) => inHand & (1 << i));
        const artistsNow = treasures ? values.numbers[artists.key] : 0;
        const spotAt = (krarksNow: number, manaNow: number): Spot => ({
          krarks: krarksNow,
          artists: artistsNow,
          mana: manaNow,
          hand: inHand,
        });

        /* the spell to cast first for the best chance and the next best, when it beats the others by enough
           to show */
        const order = (spot: Spot) => {
          const best = odds.at(spot);
          if (best.cast === undefined) {
            return undefined;
          }
          let next: { spell: number; win: number } | undefined;
          for (const i of castable) {
            const other = i === best.cast ? undefined : odds.casting(spot, i);
            if (other && (!next || other.win > next.win)) {
              next = { spell: i, win: other.win };
            }
          }
          return next && rounded(next.win) !== rounded(best.win) ? { first: best.cast, next } : undefined;
        };
        /* What the combo has made by the time it stops, where it can, as the stats say it. With a mana
           ritual, how often the ritual itself is cast once the combo is settled isn't counted, so only the
           Krarks are given. */
        const madeStats = (made: Odds['made']): Stat[] =>
          made
            ? [
                {
                  label: 'Krarks made',
                  value: spread(made.krarks),
                  caption: 'copies of Krark when it stops, mean ± deviation',
                },
                ...(withRitual
                  ? []
                  : [
                      {
                        label: 'Casts',
                        value: spread(made.casts),
                        caption: 'of the copying spells when it stops, mean ± deviation',
                      },
                      {
                        label: 'Mana made',
                        value: spread(made.mana),
                        caption: `by ${engine} when it stops, mean ± deviation`,
                      },
                    ]),
              ]
            : [];
        /* everything the answer reads out from a spot */
        const reading = (spot: Spot) => {
          const at = odds.at(spot);
          const first = order(spot);
          return [
            rounded(at.win),
            rounded(outOfMana(at)),
            rounded(at.usedUp),
            rounded(odds.unlimited(spot.krarks, inHand)),
            first ? `${first.first} ${first.next.spell} ${rounded(first.next.win)}` : '',
            JSON.stringify(at.aim ?? ''),
            ...madeStats(at.made).map((stat) => stat.value),
          ].join(' ');
        };
        /* the least of `input` from which the answer reads the same up to `top` */
        const steadyFrom = (input: NumberInput, top: number, spot: (x: number) => Spot) => {
          const settled = reading(spot(top));
          let from = top;
          while (from > input.min && reading(spot(from - 1)) === settled) {
            from--;
          }
          return from;
        };
        /* a spell as the stat names it: by name, by what it costs next to the other, or as the ritual */
        const spellName = (i: number) => {
          if (i === ritualIndex) {
            return 'the mana ritual';
          }
          if (spells[i].name) {
            return spells[i].name;
          }
          if (!pair) {
            return 'the copying spell';
          }
          return copiers[i].cost < copiers[1 - i].cost ? 'the cheaper spell' : 'the dearer spell';
        };

        const krarksSteady = steadyFrom(krarks, odds.plenty, (x) => spotAt(x, values.numbers.mana));
        const krarksNow = Math.min(values.numbers.krarks, krarksSteady);
        const manaSpot = (x: number) => spotAt(krarksNow, x);
        /* Past the mana the odds keep count of the answer reads the same, but for a lone Krark with its
           last copying spell, which uses it up a little more surely with every cast it can pay for. A cast
           apart its answers only draw nearer the one for all the mana there can be, so from each mana in
           the last cast's worth the odds keep count of, find the most casts on top of it that still read
           otherwise: the answer is steady past the highest such mana. */
        const each = odds.lone(manaSpot(0));
        const ample = each > 0 ? reading(manaSpot(mana.max)) : '';
        const unsteady = Math.max(
          -1,
          ...Array.from({ length: each }, (_, below) => {
            const from = odds.most - below;
            const casts = highestPassing(
              (n) => reading(manaSpot(from + n * each)) !== ample,
              0,
              Math.floor((mana.max - from) / each),
            );
            return casts < 0 ? -1 : from + casts * each;
          }),
        );
        const manaSteady = unsteady < 0 ? steadyFrom(mana, odds.most, manaSpot) : unsteady + 1;
        const manaNow = Math.min(values.numbers.mana, manaSteady);
        const spot = spotAt(krarksNow, manaNow);
        const at = odds.at(spot);
        const best = order(spot);
        const stats: Stat[] = [
          { label: 'Runs out of mana', value: chance(outOfMana(at)), caption: 'with a copying spell still in hand' },
          {
            label: both ? 'Uses up both spells' : 'Uses up the spell',
            value: chance(at.usedUp),
            caption: both ? 'each by winning every flip of a cast' : 'by winning every flip of a cast',
          },
          {
            label: 'With unlimited mana',
            value: chance(odds.unlimited(krarksNow, inHand)),
            caption: 'the best these spells can do',
          },
        ];
        if (best) {
          stats.push({
            label: 'Cast first',
            value: capitalize(spellName(best.first)),
            caption:
              castable.length === 2
                ? `${chance(best.next.win)} the other way around`
                : `${chance(best.next.win)} casting ${spellName(best.next.spell)} first`,
          });
        }
        if (at.aim && (at.aim.byFlip.length > 0 || at.aim.spellToo)) {
          /* the copies of the cast to aim at the maker, each unless won too late in the cast for it to pay,
             and the spell itself if it resolves */
          const { byFlip, spellToo } = at.aim;
          const copies = byFlip.every((flip) => flip === krarksNow)
            ? byFlip.length === 0
              ? ''
              : byFlip.length === krarksNow
                ? krarksNow === 1
                  ? 'the copy'
                  : 'every copy'
                : byFlip.length === 1
                  ? 'the first copy'
                  : `the first ${byFlip.length} copies`
            : byFlip
                .map((flip, c) => {
                  const late =
                    flip === krarksNow
                      ? ''
                      : flip === krarksNow - 1
                        ? ' unless won on the last flip'
                        : ` if won by flip ${flip}`;
                  return `the ${ORDINALS[c]} copy${late}`;
                })
                .join(', ');
          const spell = spellToo ? (copies ? 'the spell itself' : 'the spell itself, if it resolves') : '';
          stats.push({
            label: `Aim at ${engine}`,
            value: capitalize([copies, spell].filter(Boolean).join(', and ')),
            caption: `rather than Krark, ${at.cast === undefined || castable.length < 2 ? 'for the mana' : `casting ${spellName(at.cast)}`}`,
          });
        }
        stats.push(...madeStats(at.made));
        return {
          headline: { label: 'Chance of going infinite', value: chance(at.win) },
          stats,
          charts: [
            {
              title: 'Chance of going infinite by mana',
              xLabel: mana.label,
              percent: true,
              selects: mana.key,
              steadyFrom: manaSteady,
              ...sweptDots(
                mana,
                manaNow,
                (x) => {
                  const win = odds.at(spotAt(krarksNow, x)).win;
                  return {
                    y: win * 100,
                    label: `${formatSwept(x, manaSteady)} mana: ${chance(win)}`,
                    tone: chanceTone(win),
                  };
                },
                manaSteady,
              ),
            },
            {
              title: 'Chance of going infinite by Krarks',
              xLabel: krarks.label,
              percent: true,
              selects: krarks.key,
              steadyFrom: krarksSteady,
              ...sweptDots(
                krarks,
                krarksNow,
                (x) => {
                  const win = odds.at(spotAt(x, values.numbers.mana)).win;
                  return {
                    y: win * 100,
                    label: `${formatSwept(x, krarksSteady)} ${x === 1 && x !== krarksSteady ? 'Krark' : 'Krarks'}: ${chance(win)}`,
                    tone: chanceTone(win),
                  };
                },
                krarksSteady,
              ),
            },
          ],
        };
      },
    };
  },
});
