import type { Input, NumberInput, Stat } from './shared/calculator';
import { chanceTone, formatSwept, sweptDots } from './shared/charts';
import { capitalize, formatPercent } from './shared/format';
import { choiceInput, numberInput } from './shared/inputs';
import { highestPassing } from './shared/search';
import { defineWidget } from './shared/widget';
import { clonesOf, describeClones } from './parse/clones';
import { says, uses, usesAny } from './parse/variant';

/* Where the mana to cast the copying spell again comes from: a mana for every new legendary creature,
   like Relic of Legends gives, one for every new creature, like Earthcraft, a Treasure for every
   cast and every copy, from each Storm-Kiln Artist, or a mana ritual the Krarks copy like any other
   spell. */
export type Engine = 'legendary' | 'creature' | 'magecraft' | 'ritual';

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

/* Where the combo stands: the Krarks and Storm-Kiln Artists you control, the mana you can make, and
   which spells are in your hand, one bit each in the order they are given, the mana ritual last */
export interface Spot {
  krarks: number;
  artists: number;
  mana: number;
  hand: number;
}

export interface Odds {
  /* the chance the Krarks and the mana outgrow anything that could stop them */
  win: number;
  /* the chance every copying spell is used up, each by winning every flip it made */
  usedUp: number;
  /* the spell to cast for the best chance, by index, the mana ritual last, if you can pay for one */
  cast?: number;
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
   than one in a million, the cast needing the wins `needs` says: any Krarks at all where it needs none.
   A cast falls short by losing more flips than it has to spare: each is lost half the time, or with
   Krark's Thumb only when every coin of it comes up a loss, which leaves one flip fewer to spare, the
   first being lost on purpose to keep the spell. */
function horizonFor(needs: (krarks: number) => number, thumbs: number): number {
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
    if (short < 1e-6) {
      return krarks;
    }
  }
}

/* Plays out the flips of a cast, from the odds where each number of wins leaves you: `ends.win[w]` and
   `ends.usedUp[w]` after winning w of them, every one at w equal to the flips. Winning none may leave
   you where you were (`stays`), to cast again, so those odds count only the casts that go anywhere.
   With Krark's Thumb, each flip that leaves a choice is won unless losing it gives the better chance,
   knowing how the flips before it went: every win is a Krark more, but one loss keeps the spell. A flip
   with no chance left either way is lost too. Which way such a flip goes changes only how a combo that
   can no longer go infinite is said to end, and a win that gains nothing shouldn't make it "used up": it
   keeps its spell until the mana runs out, which is also how it reads once settled with nothing making
   mana. */
function flipping(thumbs: number, longest: number) {
  const alike = alikeWith(thumbs);
  const either = 1 - 2 * alike;
  const rows = either > 0 ? [] : Array.from({ length: longest + 1 }, (_, flips) => binomial(flips));
  const ends = { win: new Float64Array(longest + 1), usedUp: new Float64Array(longest + 1) };
  const win = new Float64Array(longest + 1);
  const usedUp = new Float64Array(longest + 1);

  /* every coin alike or none to choose from: each number of wins as likely as the coins make it */
  const counted = (flips: number, stays: boolean): Odds => {
    const chance = rows[flips];
    let winning = 0;
    let using = 0;
    for (let wins = stays ? 1 : 0; wins <= flips; wins++) {
      winning += chance[wins] * ends.win[wins];
      using += chance[wins] * ends.usedUp[wins];
    }
    const stay = stays ? chance[0] : 0;
    return { win: winning / (1 - stay), usedUp: using / (1 - stay) };
  };

  /* Back from the last flip, the odds with each number of wins so far, playing every choice left for the
     best chance. Staying where you were is worth what the cast is: guess it, nothing at first, play the
     choices for the best chance with that guess and take the chance they give as the next, until it
     stops growing, which takes a round or two. */
  const chosen = (flips: number, stays: boolean): Odds => {
    let self = 0;
    for (;;) {
      for (let wins = 0; wins <= flips; wins++) {
        win[wins] = ends.win[wins];
        usedUp[wins] = ends.usedUp[wins];
      }
      /* the chance of ending where you were, from no flip won so far */
      let stay = stays ? 1 : 0;
      for (let flip = flips - 1; flip >= 0; flip--) {
        const keep = win[1] > 0 && win[1] >= win[0] + stay * self - 1e-12;
        win[0] = alike * (win[0] + win[1]) + either * (keep ? win[1] : win[0]);
        usedUp[0] = alike * (usedUp[0] + usedUp[1]) + either * (keep ? usedUp[1] : usedUp[0]);
        stay *= keep ? alike : 1 - alike;
        for (let wins = 1; wins <= flip; wins++) {
          const lost = win[wins];
          const won = win[wins + 1];
          const kept = won > 0 && won >= lost - 1e-12;
          win[wins] = alike * (lost + won) + either * (kept ? won : lost);
          usedUp[wins] = alike * (usedUp[wins] + usedUp[wins + 1]) + either * usedUp[kept ? wins + 1 : wins];
        }
      }
      const odds = { win: win[0] / (1 - stay), usedUp: usedUp[0] / (1 - stay) };
      if (stay === 0 || odds.win <= self + 1e-12) {
        return odds;
      }
      self = odds.win;
    }
  };

  return { ends, rows, play: either > 0 ? chosen : counted };
}

type Flipping = ReturnType<typeof flipping>;

/* The chance of going infinite with mana to spare for every cast, by Krarks and copying spells in hand:
   with k Krarks a cast wins none of the flips, which changes nothing, some of them, each a new Krark, or
   all k, which makes k + 1 Krarks and uses the spell up. */
function unlimitedOdds(spells: number, most: number, { ends, play }: Flipping): Float64Array[] {
  const odds = [new Float64Array(most + 1)];
  for (let left = 1; left <= spells; left++) {
    const row = new Float64Array(most + 1).fill(1);
    for (let krarks = Math.floor((most - 1) / 2); krarks >= 1; krarks--) {
      ends.win[0] = 0;
      ends.usedUp[0] = 0;
      for (let wins = 1; wins <= krarks; wins++) {
        const win = wins < krarks ? row[krarks + wins] : odds[left - 1][2 * krarks + 1];
        ends.win[wins] = win;
        ends.usedUp[wins] = 1 - win;
      }
      row[krarks] = play(krarks, true).win;
    }
    odds.push(row);
  }
  return odds;
}

/* Times over the mana where a cast can come back with more of it, far more than it takes for the odds to
   settle */
const MOST_SWEEPS = 1000;

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
  const breeds = engine === 'magecraft' && copiers.some((copier) => copier.everyNontoken);
  const fewestArtists = engine === 'magecraft' ? 1 : 0;
  const levels = breeds ? Math.max(1, dearest - fewestArtists) : 1;
  const spellCosts = ritual ? [...costs, ritual.cost] : costs;
  const hands = bit(spellCosts.length);
  /* The Krarks from which each hand is settled, by Artists. A cast has to give back what the dearest
     spell in hand costs: as many wins where each new Krark makes a mana, fewer the more Artists make a
     Treasure for the cast and for every copy, none with an Artist for each mana of it, and the copies
     of a mana ritual that pay for itself and for that spell. */
  const horizons = Array.from({ length: levels * hands }, (_, group) => {
    const artists = fewestArtists + Math.floor(group / hands);
    const dear = Math.max(0, ...costs.filter((_, i) => (group % hands) & bit(i)));
    return horizonFor((krarks) => {
      if (ritual) {
        return Math.ceil((dear + ritual.cost) / ritualMana(krarks));
      }
      return engine === 'magecraft' ? Math.ceil(dear / artists) - 1 : dear;
    }, thumbs);
  });
  const horizon = Math.max(...horizons);
  const most = 16 * dearest + 2 * horizon;
  const size = most + 1;
  const cheapest = Array.from({ length: hands }, (_, hand) => Math.min(...spellCosts.filter((_, i) => hand & bit(i))));
  const spellsIn = Array.from({ length: hands }, (_, hand) => costs.filter((_, i) => hand & bit(i)).length);
  /* the only copying spell in each hand, where there is just one */
  const lastSpell = Array.from({ length: hands }, (_, hand) =>
    spellsIn[hand] === 1 ? costs.findIndex((_, i) => hand & bit(i)) : -1,
  );
  const alike = alikeWith(thumbs);
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
  const flips = flipping(thumbs, deep);
  const { ends } = flips;
  const unlimited = unlimitedOdds(copiers.length, 2 * deep + 1, flips);
  const win = new Float64Array(horizon * levels * hands * size);
  const usedUp = new Float64Array(win.length);
  const choice = new Int8Array(win.length).fill(-1);
  const at = (krarks: number, artists: number, hand: number) =>
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
    i === ritualIndex
      ? ritualMana(krarks) * (krarks - 1) - ritual!.cost
      : (engine === 'magecraft' ? artists : 0) - costs[i];

  /* The mana each cast costs a lone Krark holding its last copying spell, none where the cast pays for
     itself or the spot is any other. Such a Krark can only use the spell up, by a single flip won as
     often whatever the mana, and losing it costs nothing but this: so unlike any other spot, its odds
     of using the spell up go on rising with the mana, a cast at a time, however much there is. */
  const lone = (krarks: number, artists: number, hand: number) => {
    const last = krarks === 1 ? lastSpell[hand] : -1;
    return last < 0 ? 0 : Math.max(0, -rise(1, artists, last));
  };

  /* The odds from where a cast leaves you, put in `ends` for winning `wins` of its flips. Mana past what
     the table keeps count of reads as the most it does, but for a lone Krark with its last copying spell:
     each cast it takes for its mana to be back within the table is lost as often as not every coin wins,
     and only then is it where the table says. Settled with the mana ritual used up or too dear to cast,
     nothing makes mana and what is left runs out with the spells in hand: so many Krarks don't win every
     flip of a cast unless made to, and with nothing left to win they aren't. */
  const reach = (wins: number, krarks: number, artists: number, mana: number, hand: number) => {
    let winning = 0;
    let using = 0;
    if ((hand & copying) === 0) {
      using = 1;
    } else {
      const each = mana > most ? lone(krarks, artists, hand) : 0;
      const casts = each > 0 ? Math.ceil((mana - most) / each) : 0;
      const within = Math.min(most, mana - casts * each);
      if (held(krarks, artists, within, hand)) {
        const index = at(krarks, artists, hand) + within;
        winning = win[index];
        using = usedUp[index];
        if (casts > 0) {
          using += (1 - (1 - alike) ** casts) * (1 - using);
        }
      } else if (within >= restarts(hand) && (hand & ritualBit) === ritualBit) {
        winning = unlimited[spellsIn[hand]][Math.min(krarks, 2 * deep + 1)];
        using = 1 - winning;
      }
    }
    ends.win[wins] = winning;
    ends.usedUp[wins] = using;
  };

  /* Where casting copying spell `i` and losing every flip leaves you, put in `ends`, unless it leaves you
     where you were, which it then says: the same Krarks, Artists and hand, with the mana you had. */
  const loseAll = (krarks: number, artists: number, mana: number, hand: number, i: number) => {
    const left = Math.min(most, mana + rise(krarks, artists, i));
    if (left === mana) {
      ends.win[0] = 0;
      ends.usedUp[0] = 0;
      return true;
    }
    reach(0, krarks, artists, left, hand);
    return false;
  };

  /* Where winning each number of flips of a copying spell leaves you is the same whatever the mana, but
     for the mana itself, so it is worked out once for a hand and its Krarks: the mana those wins leave
     you ahead by, the least they have to leave for the odds to be anything, and where the table keeps
     the odds from there or, settled or with the spells used up, the odds themselves. With no Thumb to
     choose by, the wins whose odds no mana changes are summed up front, each by its chance, leaving
     only the `open` ones to go by the mana. */
  const landings = copiers.map(() => ({
    krarks: 0,
    artists: 0,
    hand: 0,
    ahead: new Float64Array(horizon + 1),
    least: new Float64Array(horizon + 1),
    held: new Int32Array(horizon + 1),
    win: new Float64Array(horizon + 1),
    usedUp: new Float64Array(horizon + 1),
    open: new Int32Array(horizon + 1),
    opens: 0,
    sureWin: 0,
    sureUsedUp: 0,
  }));
  const chances = (krarks: number): Float64Array | undefined => (thumbs === 0 ? flips.rows[krarks] : undefined);
  const land = (krarks: number, artists: number, hand: number, i: number) => {
    const landing = landings[i];
    if (landing.krarks === krarks && landing.artists === artists && landing.hand === hand) {
      return landing;
    }
    Object.assign(landing, { krarks, artists, hand, opens: 0, sureWin: 0, sureUsedUp: 0 });
    const { cost, everyNontoken } = copiers[i];
    const chance = chances(krarks);
    for (let wins = 1; wins <= krarks; wins++) {
      const all = wins === krarks;
      const made = all ? wins + 1 : wins;
      let gain = 0;
      if (engine === 'legendary') {
        /* every copy a legend: the spells whose copies aren't are left out of such a combo */
        gain = made;
      } else if (engine === 'creature') {
        gain = everyNontoken ? made * (1 + others) : made;
      } else if (engine === 'magecraft') {
        /* a Treasure from each Artist for the cast and for every copy, each copy of a spell copying every
           nontoken creature making one more Artist before the next flip */
        gain = artists * (1 + wins) + (everyNontoken ? (wins * (wins - 1)) / 2 : 0);
      }
      const nextArtists = breeds && everyNontoken ? artists + made : artists;
      const nextHand = all ? hand & ~bit(i) : hand;
      /* settled with nothing making mana, the odds are none whatever the mana */
      let least = Infinity;
      let held = -1;
      let winning = 0;
      let using = 0;
      if ((nextHand & copying) === 0) {
        least = -Infinity;
        using = 1;
      } else if (!settled(krarks + made, nextArtists, nextHand)) {
        least = cheapest[nextHand];
        held = at(krarks + made, nextArtists, nextHand);
      } else if ((nextHand & ritualBit) === ritualBit) {
        least = restarts(nextHand);
        winning = unlimited[spellsIn[nextHand]][Math.min(krarks + made, 2 * deep + 1)];
        using = 1 - winning;
      }
      landing.ahead[wins] = gain - cost;
      landing.least[wins] = least;
      landing.held[wins] = held;
      landing.win[wins] = winning;
      landing.usedUp[wins] = using;
      /* a cast is paid for, so it leaves at least the mana it makes */
      if (chance && held < 0 && (gain >= least || least === Infinity)) {
        landing.sureWin += chance[wins] * winning;
        landing.sureUsedUp += chance[wins] * using;
      } else {
        landing.open[landing.opens++] = wins;
      }
    }
    return landing;
  };

  /* The odds of casting copying spell `i` from a spot the table holds, then playing on for the best
     chance, with where losing every flip leaves you in `ends` already, or `stays` for where you were.
     With no Thumb each number of wins is as likely as the coins make it, and a cast that can leave you
     where you were counts only when it doesn't. */
  const castCopier = (krarks: number, artists: number, mana: number, hand: number, i: number, stays: boolean) => {
    const landing = land(krarks, artists, hand, i);
    const chance = chances(krarks);
    let winning = landing.sureWin;
    let using = landing.sureUsedUp;
    for (let open = 0; open < landing.opens; open++) {
      const wins = landing.open[open];
      const left = mana + landing.ahead[wins];
      const held = landing.held[wins];
      let won = 0;
      let used = 0;
      if (left >= landing.least[wins]) {
        won = held < 0 ? landing.win[wins] : win[held + Math.min(most, left)];
        used = held < 0 ? landing.usedUp[wins] : usedUp[held + Math.min(most, left)];
      }
      if (chance) {
        winning += chance[wins] * won;
        using += chance[wins] * used;
      } else {
        ends.win[wins] = won;
        ends.usedUp[wins] = used;
      }
    }
    if (!chance) {
      return flips.play(krarks, stays);
    }
    if (stays) {
      return { win: winning / (1 - chance[0]), usedUp: using / (1 - chance[0]) };
    }
    return { win: winning + chance[0] * ends.win[0], usedUp: using + chance[0] * ends.usedUp[0] };
  };

  /* The odds of casting the mana ritual from a spot the table holds: every copy makes its mana, and so
     does the spell if it resolves. Short of that it comes back to hand with the Krarks as they were,
     which the table holds too, so those odds are read straight from it. */
  const castRitual = (krarks: number, artists: number, mana: number, hand: number): Odds => {
    const made = ritualMana(krarks);
    const paid = mana - ritual!.cost;
    const back = at(krarks, artists, hand);
    const chance = chances(krarks);
    reach(krarks, krarks, artists, paid + made * (krarks + 1), hand & ~ritualBit);
    let winning = chance ? chance[krarks] * ends.win[krarks] : 0;
    let using = chance ? chance[krarks] * ends.usedUp[krarks] : 0;
    for (let wins = 0; wins < krarks; wins++) {
      const left = Math.min(most, paid + made * wins);
      const pays = left >= cheapest[hand];
      const won = pays ? win[back + left] : 0;
      const used = pays ? usedUp[back + left] : 0;
      if (chance) {
        winning += chance[wins] * won;
        using += chance[wins] * used;
      } else {
        ends.win[wins] = won;
        ends.usedUp[wins] = used;
      }
    }
    return chance ? { win: winning, usedUp: using } : flips.play(krarks, false);
  };

  type Cast = (krarks: number, artists: number, mana: number, hand: number, i: number) => Odds;

  const castSpell: Cast = (krarks, artists, mana, hand, i) =>
    i === ritualIndex
      ? castRitual(krarks, artists, mana, hand)
      : castCopier(krarks, artists, mana, hand, i, loseAll(krarks, artists, mana, hand, i));

  /* While the odds of a hand settle, each copying spell's casts kept by spell and mana, with the odds of
     losing every flip they went by: the rest of where they lead has more Krarks, so they change only
     when those odds do. With no Thumb to choose by, they then change by as much, as often as every flip
     is lost. */
  const keptWin = new Float64Array(copiers.length * size);
  const keptUsedUp = new Float64Array(keptWin.length);
  const lostWin = new Float64Array(keptWin.length);
  const lostUsedUp = new Float64Array(keptWin.length);
  const castKept: Cast = (krarks, artists, mana, hand, i) => {
    if (i === ritualIndex) {
      return castRitual(krarks, artists, mana, hand);
    }
    const slot = i * size + mana;
    const stays = loseAll(krarks, artists, mana, hand, i);
    const lost = { win: ends.win[0], usedUp: ends.usedUp[0] };
    if (Math.abs(lost.win - lostWin[slot]) > 1e-12 || Math.abs(lost.usedUp - lostUsedUp[slot]) > 1e-12) {
      if (thumbs === 0 && lostWin[slot] >= 0) {
        const every = 0.5 ** krarks;
        keptWin[slot] += every * (lost.win - lostWin[slot]);
        keptUsedUp[slot] += every * (lost.usedUp - lostUsedUp[slot]);
      } else {
        const odds = castCopier(krarks, artists, mana, hand, i, stays);
        keptWin[slot] = odds.win;
        keptUsedUp[slot] = odds.usedUp;
      }
      lostWin[slot] = lost.win;
      lostUsedUp[slot] = lost.usedUp;
    }
    return { win: keptWin[slot], usedUp: keptUsedUp[slot] };
  };

  /* The best of the first `spells` spells to cast from a spot the table holds, kept there, and by how
     much its odds changed. With none to pay for, the spot holds nothing until the ritual is counted. */
  const settle = (
    krarks: number,
    artists: number,
    mana: number,
    hand: number,
    cast: Cast,
    spells = spellCosts.length,
  ) => {
    const index = at(krarks, artists, hand) + mana;
    let best: Odds = { win: 0, usedUp: 0 };
    let bestSpell = -1;
    for (let i = 0; i < spells; i++) {
      if (hand & bit(i) && mana >= spellCosts[i]) {
        const odds = cast(krarks, artists, mana, hand, i);
        if (bestSpell < 0 || odds.win > best.win + 1e-12) {
          best = odds;
          bestSpell = i;
        }
      }
    }
    const change = Math.max(Math.abs(best.win - win[index]), Math.abs(best.usedUp - usedUp[index]));
    win[index] = best.win;
    usedUp[index] = best.usedUp;
    choice[index] = bestSpell;
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
        /* A cast can come back to the same Krarks and hand with as much mana or more, the mana ritual by
           its copies and a copying spell by more Artists than it costs, so the odds with some mana count
           on those with more as well as less. Go over the mana from the least up with the copying spells
           alone, then from the most down, where the mana comes back to, until the odds stop changing. A
           cast drops at most `drop` mana and comes back at most `up` ahead, so after the first time down
           only the mana that counts on odds that changed needs going over again: from `drop` above the
           highest change down to the lowest, which may count on itself, and on to `up` below any change
           on the way. */
        lostWin.fill(-1);
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
    artists: Math.min(Math.max(fewestArtists, spot.artists), breeds ? dearest : fewestArtists),
    mana: Math.max(0, spot.mana),
    hand: spot.hand & (hands - 1),
  });

  return {
    horizon,
    most,
    /* Krarks enough that more make no difference to the odds: no cast is taken to win every flip */
    plenty: deep + 1,
    /* the odds from a spot, at its best */
    at(spot: Spot): Odds {
      const { krarks, artists, mana, hand } = clamp(spot);
      reach(0, krarks, artists, mana, hand);
      const odds = { win: ends.win[0], usedUp: ends.usedUp[0] };
      const counted = Math.min(most, mana);
      return held(krarks, artists, counted, hand)
        ? { ...odds, cast: choice[at(krarks, artists, hand) + counted] }
        : odds;
    },
    /* the odds from a spot casting spell `i` now, if you can pay for it, then playing on at your best */
    casting(spot: Spot, i: number): Odds | undefined {
      const { krarks, artists, hand, ...counted } = clamp(spot);
      const mana = Math.min(most, counted.mana);
      if (!(hand & bit(i)) || mana < spellCosts[i] || !held(krarks, artists, mana, hand)) {
        return undefined;
      }
      return { ...castSpell(krarks, artists, mana, hand, i), cast: i };
    },
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
      return unlimited[spellsIn[hand & copying]][Math.min(Math.max(1, krarks), 2 * deep + 1)];
    },
  };
}

export type KrarkOdds = ReturnType<typeof krarkOdds>;

const solved = new Map<string, KrarkOdds>();
const REMEMBERED = 16;

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
};

const MANA_HINT: Record<string, string> = {
  'Relic of Legends': 'Counting Relic of Legends and the untapped legendary creatures it can tap, Krark included.',
  'Honor-Worn Shaku': 'Counting Honor-Worn Shaku and the untapped legendary permanents that untap it, Krark included.',
  Earthcraft: 'Counting the basic lands your untapped creatures can untap with Earthcraft, Krark included.',
  'Storm-Kiln Artist': 'Counting your Treasures.',
  [MANA_RITUAL]: 'Counting mana that can pay for the copying spells and the mana ritual.',
};

const COST_KEYS = ['firstCost', 'secondCost'];
/* the mana values of Molten Duplication and Heat Shimmer, a common pair */
const TEMPLATE_COSTS = [2, 3];
const ORDINALS = ['first', 'second'];
const MOST_COST = 12;
const MOST_OTHERS = 30;
/* past four, sixteen coins a flip, a flip goes against your choice too rarely to show */
const MOST_THUMBS = 4;
/* Manamorphose, two mana of any colors for two, so that it pays for any copying spell */
const RITUAL_COST = 2;
const RITUAL_MANA = 2;

const chance = (probability: number) => formatPercent(probability, 1);

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
    const breeds = kind === 'magecraft' && spells.some((spell) => spell.everyNontoken);
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
    const artists = numberInput('artists', 'Storm-Kiln Artists you control', 1, {
      min: 1,
      hint: 'Multiversal Incursion copies it along with Krark.',
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
      ...(breeds ? [artists] : []),
      ...(copiesOthers ? [others] : []),
    ];
    const spellNames = [
      ...spells.flatMap((spell) => (spell.name ? [spell.name] : [])),
      ...(unnamed > 0 ? ['a creature-copying spell targeting Krark'] : []),
      ...(withRitual ? ['the mana ritual'] : []),
    ];
    const spellText =
      spellNames.length > 2 ? `${spellNames.slice(0, -1).join(', ')} or ${spellNames.at(-1)}` : spellNames.join(' or ');
    const copiesText = breeds
      ? ' Multiversal Incursion copies Storm-Kiln Artist too, so each copy of it makes one more Artist.'
      : copiesOthers
        ? ' Multiversal Incursion copies your other nontoken creatures too, and each of those untaps a land as well.'
        : '';
    const thumbText = "with Krark's Thumb take every win unless losing the flip, to keep the spell, gives a better one";
    /* how a combo with no chance left is said to end, which only Krark's Thumb leaves a say in */
    const lostText =
      'With the Thumb and no way left to go infinite, they lose the flip as well: such a combo counts as running out of mana, a copying spell still in hand, rather than as using it up.';
    const summary = withRitual
      ? `Each Krark flips a coin whenever you cast ${spellText}. Every win copies the spell: a copy of ${pair ? 'a copying spell' : 'the copying spell'} makes one more Krark, and a copy of the mana ritual makes its mana again. A single loss returns the spell to your hand to cast again, but win every flip and it resolves too and is used up. The loop stops once ${pair ? 'both copying spells are' : 'the copying spell is'}, or once you can't pay for the next cast. The odds cast whichever spell gives the better chance each time, and ${thumbText}. ${lostText}`
      : `Each Krark flips a coin whenever you cast ${spellText}. Every win copies the spell for one more Krark, and ${ENGINE_TEXT[engine]}.${copiesText} A single loss returns the spell to your hand to cast again, but win every flip and it resolves for one more Krark and is used up. The loop stops once ${pair ? 'both spells are' : 'it is'}, or once you can't pay for the next cast. ${pair ? `The odds cast whichever spell gives the better chance each time, and ${thumbText}.` : "With Krark's Thumb the odds take every win unless losing the flip, to keep the spell, gives the better chance."} ${lostText}`;
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
        const artistsNow = breeds ? values.numbers.artists : kind === 'magecraft' ? 1 : 0;
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
