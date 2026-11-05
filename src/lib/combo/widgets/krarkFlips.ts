import type { Input, NumberInput, Stat } from './shared/calculator';
import { chanceTone, formatSwept, sweptDots } from './shared/charts';
import { formatPercent } from './shared/format';
import { choiceInput, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { says, uses, usesAny } from './parse/variant';

/* Where the mana to cast the copying spell again comes from: a mana for every new legendary creature,
   like Relic of Legends gives, one for every new creature, like Earthcraft, or a Treasure for every
   cast and every copy, from each Storm-Kiln Artist. */
export type Engine = 'legendary' | 'creature' | 'magecraft';

export interface Copier {
  cost: number;
  /* copies every nontoken creature you control, like Multiversal Incursion, rather than Krark alone */
  everyNontoken: boolean;
}

/* Where the combo stands: the Krarks and Storm-Kiln Artists you control, the mana you can make, and
   which copying spells are in your hand, one bit each in the order they are given */
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
  /* the spell to cast for the best chance, by index, if you can pay for one */
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

/* The chance of going infinite with mana to spare for every cast, by Krarks and copying spells in hand:
   with k Krarks a cast wins none of the flips, which changes nothing, some of them, each a new Krark, or
   all k, which makes k + 1 Krarks and uses the spell up. */
function unlimitedOdds(spells: number, most: number): Float64Array[] {
  const odds = [new Float64Array(most + 1)];
  for (let left = 1; left <= spells; left++) {
    const row = new Float64Array(most + 1).fill(1);
    for (let krarks = Math.floor((most - 1) / 2); krarks >= 1; krarks--) {
      const chance = binomial(krarks);
      let win = chance[krarks] * odds[left - 1][2 * krarks + 1];
      for (let wins = 1; wins < krarks; wins++) {
        win += chance[wins] * row[krarks + wins];
      }
      row[krarks] = win / (1 - chance[0]);
    }
    odds.push(row);
  }
  return odds;
}

/* The odds from every spot, playing each cast for the best chance. Past `horizon` Krarks every cast
   gives back what the dearest spell costs, short of a fluke rarer than one in a million, so from there
   only using up the spells can stop the combo. Mana past `most` makes too little difference to keep
   count of, and a Storm-Kiln Artist for every mana the dearest spell costs makes it pay for itself. */
export function krarkOdds(copiers: Copier[], engine: Engine, others = 0) {
  const costs = copiers.map((copier) => copier.cost);
  const dearest = Math.max(...costs);
  const horizon = 2 * dearest + 32;
  const most = 16 * dearest + 2 * horizon;
  const breeds = engine === 'magecraft' && copiers.some((copier) => copier.everyNontoken);
  const fewestArtists = engine === 'magecraft' ? 1 : 0;
  const levels = breeds ? Math.max(1, dearest - fewestArtists) : 1;
  const hands = bit(copiers.length);
  const size = most + 1;
  const cheapest = Array.from({ length: hands }, (_, hand) => Math.min(...costs.filter((_, i) => hand & bit(i))));
  const spellsIn = Array.from({ length: hands }, (_, hand) => costs.filter((_, i) => hand & bit(i)).length);
  const unlimited = unlimitedOdds(copiers.length, 2 * horizon + 1);
  const rows = Array.from({ length: horizon }, (_, krarks) => binomial(krarks));
  const win = new Float64Array(horizon * levels * hands * size);
  const usedUp = new Float64Array(win.length);
  const choice = new Int8Array(win.length).fill(-1);
  const at = (krarks: number, artists: number, hand: number) =>
    ((krarks * levels + artists - fewestArtists) * hands + hand) * size;
  const settled = (krarks: number, artists: number) => krarks >= horizon || (breeds && artists >= dearest);

  /* the odds of casting spell `i` from a spot the table holds, then playing on for the best chance */
  const cast = (krarks: number, artists: number, mana: number, hand: number, i: number): Odds => {
    const { cost, everyNontoken } = copiers[i];
    const chance = rows[krarks];
    let winning = 0;
    let using = 0;
    let stay = 0;
    for (let wins = 0; wins <= krarks; wins++) {
      const all = wins === krarks;
      const made = all ? wins + 1 : wins;
      let gain: number;
      if (engine === 'legendary') {
        gain = everyNontoken ? 0 : made;
      } else if (engine === 'creature') {
        gain = everyNontoken ? made * (1 + others) : made;
      } else {
        /* a Treasure from each Artist for the cast and for every copy, each copy of a spell copying every
           nontoken creature making one more Artist before the next flip */
        gain = artists * (1 + wins) + (everyNontoken ? (wins * (wins - 1)) / 2 : 0);
      }
      const nextMana = Math.min(most, mana - cost + gain);
      if (wins === 0 && nextMana >= mana) {
        /* losing every flip leaves you where you were, or with more mana, counted as no more */
        stay += chance[wins];
        continue;
      }
      const nextKrarks = krarks + made;
      const nextArtists = breeds && everyNontoken ? artists + made : artists;
      const nextHand = all ? hand & ~bit(i) : hand;
      if (nextHand === 0) {
        using += chance[wins];
      } else if (nextMana >= cheapest[nextHand]) {
        if (settled(nextKrarks, nextArtists)) {
          const odds = unlimited[spellsIn[nextHand]][Math.min(nextKrarks, 2 * horizon + 1)];
          winning += chance[wins] * odds;
          using += chance[wins] * (1 - odds);
        } else {
          const index = at(nextKrarks, nextArtists, nextHand) + nextMana;
          winning += chance[wins] * win[index];
          using += chance[wins] * usedUp[index];
        }
      }
    }
    return { win: winning / (1 - stay), usedUp: using / (1 - stay) };
  };

  for (let krarks = horizon - 1; krarks >= 1; krarks--) {
    for (let artists = fewestArtists + levels - 1; artists >= fewestArtists; artists--) {
      for (let hand = 1; hand < hands; hand++) {
        const base = at(krarks, artists, hand);
        for (let mana = cheapest[hand]; mana <= most; mana++) {
          let best: Odds | undefined;
          let bestSpell = -1;
          for (let i = 0; i < copiers.length; i++) {
            if (hand & bit(i) && mana >= costs[i]) {
              const odds = cast(krarks, artists, mana, hand, i);
              if (!best || odds.win > best.win + 1e-12) {
                best = odds;
                bestSpell = i;
              }
            }
          }
          win[base + mana] = best!.win;
          usedUp[base + mana] = best!.usedUp;
          choice[base + mana] = bestSpell;
        }
      }
    }
  }

  const clamp = (spot: Spot) => ({
    krarks: Math.max(1, spot.krarks),
    artists: Math.min(Math.max(fewestArtists, spot.artists), breeds ? dearest : fewestArtists),
    mana: Math.max(0, Math.min(most, spot.mana)),
    hand: spot.hand & (hands - 1),
  });

  return {
    horizon,
    most,
    /* the odds from a spot, at its best */
    at(spot: Spot): Odds {
      const { krarks, artists, mana, hand } = clamp(spot);
      if (hand === 0) {
        return { win: 0, usedUp: 1 };
      }
      if (mana < cheapest[hand]) {
        return { win: 0, usedUp: 0 };
      }
      if (settled(krarks, artists)) {
        const odds = unlimited[spellsIn[hand]][Math.min(krarks, 2 * horizon + 1)];
        return { win: odds, usedUp: 1 - odds };
      }
      const index = at(krarks, artists, hand) + mana;
      return { win: win[index], usedUp: usedUp[index], cast: choice[index] };
    },
    /* the odds from a spot casting spell `i` now, if you can pay for it, then playing on at your best */
    casting(spot: Spot, i: number): Odds | undefined {
      const { krarks, artists, mana, hand } = clamp(spot);
      if (!(hand & bit(i)) || mana < costs[i] || settled(krarks, artists)) {
        return undefined;
      }
      return { ...cast(krarks, artists, mana, hand, i), cast: i };
    },
    /* the chance with mana to spare for every cast */
    unlimited(krarks: number, hand: number): number {
      return unlimited[spellsIn[hand & (hands - 1)]][Math.min(Math.max(1, krarks), 2 * horizon + 1)];
    },
  };
}

export type KrarkOdds = ReturnType<typeof krarkOdds>;

const solved = new Map<string, KrarkOdds>();
const REMEMBERED = 16;

/* The same odds, worked out once for each set of spells and the board they go with */
function oddsFor(copiers: Copier[], engine: Engine, others: number): KrarkOdds {
  const key = JSON.stringify([copiers, engine, others]);
  let odds = solved.get(key);
  if (!odds) {
    odds = krarkOdds(copiers, engine, others);
    if (solved.size >= REMEMBERED) {
      solved.delete(solved.keys().next().value!);
    }
    solved.set(key, odds);
  }
  return odds;
}

const ENGINES: Record<string, Engine> = {
  'Relic of Legends': 'legendary',
  'Honor-Worn Shaku': 'legendary',
  Earthcraft: 'creature',
  'Storm-Kiln Artist': 'magecraft',
};

/* Spells that copy Krark into a nonlegendary token, by mana value */
const COPIERS: Record<string, Copier> = {
  "Irenicus's Vile Duplication": { cost: 4, everyNontoken: false },
  'Ember Island Production': { cost: 5, everyNontoken: false },
  'Quantum Misalignment': { cost: 5, everyNontoken: false },
  'Multiversal Incursion': { cost: 7, everyNontoken: true },
};

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
};

const COST_KEYS = ['firstCost', 'secondCost'];
/* the mana values of Molten Duplication and Heat Shimmer, a common pair */
const TEMPLATE_COSTS = [2, 3];
const ORDINALS = ['first', 'second'];
const MOST_COST = 12;
const MOST_OTHERS = 30;

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
    const engine = usesAny(variant, Object.keys(ENGINES));
    if (
      !engine ||
      !uses(variant, 'Krark, the Thumbless') ||
      !says(variant, /\bflips? you won\b|\bflipping a coin\b/i)
    ) {
      return undefined;
    }
    const named = variant.uses
      .map((card) => card.card.name)
      .filter((name) => name in COPIERS)
      .sort((a, b) => variant.description.indexOf(a) - variant.description.indexOf(b));
    let spells: Spell[];
    if (named.length === 2 && ENGINES[engine] !== 'legendary') {
      spells = named.map((name) => ({ name, ...COPIERS[name] }));
    } else if (named.length === 0 && says(variant, /\bthe second creature-copying spell\b/i)) {
      spells = [{ everyNontoken: false }, { everyNontoken: false }];
    } else {
      return undefined;
    }
    return { engine, spells };
  },
  calculator({ engine, spells }) {
    const kind = ENGINES[engine];
    const breeds = kind === 'magecraft' && spells.some((spell) => spell.everyNontoken);
    const copiesOthers = kind === 'creature' && spells.some((spell) => spell.everyNontoken);
    const names = spells.map((spell, i) => spell.name ?? `the ${ORDINALS[i]} copying spell`);
    const costInputs = spells.flatMap((spell, i) =>
      spell.cost === undefined
        ? [
            numberInput(COST_KEYS[i], `Mana value of the ${ORDINALS[i]} copying spell`, TEMPLATE_COSTS[i], {
              min: 1,
              max: MOST_COST,
            }),
          ]
        : [],
    );
    const fixedCosts = spells.map((spell, i) => spell.cost ?? TEMPLATE_COSTS[i]);
    /* twice what casting each spell once takes: enough for odds worth a look */
    const mana = numberInput('mana', 'Mana you have', 2 * fixedCosts.reduce((sum, cost) => sum + cost, 0), {
      hint: MANA_HINT[engine],
    });
    const krarks = numberInput('krarks', 'Krarks you control', 1, {
      min: 1,
      hint: 'Krark and its copies: change it as the combo goes to see where you stand.',
    });
    const artists = numberInput('artists', 'Storm-Kiln Artists you control', 1, {
      min: 1,
      hint: 'Multiversal Incursion copies it along with Krark.',
    });
    const others = numberInput('others', 'Other nontoken creatures you control', 0, {
      max: MOST_OTHERS,
      hint: 'Multiversal Incursion copies them along with Krark, and each copy untaps a land too.',
    });
    const hand = choiceInput('hand', 'Copying spells in your hand', [
      ['3', 'Both'],
      ['1', `Only ${names[0]}`],
      ['2', `Only ${names[1]}`],
    ]);
    const inputs: Input[] = [
      mana,
      ...costInputs,
      ...(copiesOthers ? [others] : []),
      krarks,
      ...(breeds ? [artists] : []),
      hand,
    ];
    const spellText = spells[0].name ? `${names[0]} or ${names[1]}` : 'a creature-copying spell targeting Krark';
    const copiesText = breeds
      ? ' Multiversal Incursion copies Storm-Kiln Artist too, so each copy of it makes one more Artist.'
      : copiesOthers
        ? ' Multiversal Incursion copies your other nontoken creatures too, and each of those untaps a land as well.'
        : '';
    return {
      category: 'chance',
      title: "Will Krark's coin flips go infinite?",
      summary: `Each Krark flips a coin whenever you cast ${spellText}. Every win copies the spell for one more Krark, and ${ENGINE_TEXT[engine]}.${copiesText} A single loss returns the spell to your hand to cast again, but win every flip and it resolves for one more Krark and is used up. The loop stops once both spells are, or once you can't pay for the next cast. The odds cast whichever spell gives the better chance each time.`,
      inputs,
      compute(values) {
        const copiers = spells.map((spell, i) => ({
          cost: spell.cost ?? values.numbers[COST_KEYS[i]],
          everyNontoken: spell.everyNontoken,
        }));
        const odds = oddsFor(copiers, kind, copiesOthers ? values.numbers.others : 0);
        const inHand = Number(values.choices.hand);
        const both = inHand === 3;
        const artistsNow = breeds ? values.numbers.artists : kind === 'magecraft' ? 1 : 0;
        const spotAt = (krarksNow: number, manaNow: number): Spot => ({
          krarks: krarksNow,
          artists: artistsNow,
          mana: manaNow,
          hand: inHand,
        });

        /* the order that gives the best chance, when it beats the other by enough to show */
        const order = (spot: Spot) => {
          const best = odds.at(spot);
          const other = best.cast === undefined ? undefined : odds.casting(spot, 1 - best.cast);
          return both && best.cast !== undefined && other && rounded(other.win) !== rounded(best.win)
            ? { first: best.cast, other: other.win }
            : undefined;
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
            first ? `${first.first} ${rounded(first.other)}` : '',
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

        const krarksSteady = steadyFrom(krarks, odds.horizon - 1, (x) =>
          spotAt(x, Math.min(values.numbers.mana, odds.most)),
        );
        const krarksNow = Math.min(values.numbers.krarks, krarksSteady);
        const manaSteady = steadyFrom(mana, odds.most, (x) => spotAt(krarksNow, x));
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
          const cheaper = copiers[best.first].cost < copiers[1 - best.first].cost;
          stats.push({
            label: 'Cast first',
            value: spells[best.first].name ?? (cheaper ? 'The cheaper spell' : 'The dearer spell'),
            caption: `${chance(best.other)} the other way around`,
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
                  const win = odds.at(spotAt(x, Math.min(values.numbers.mana, odds.most))).win;
                  return {
                    y: win * 100,
                    label: `${formatSwept(x, krarksSteady)} ${x === 1 ? 'Krark' : 'Krarks'}: ${chance(win)}`,
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
