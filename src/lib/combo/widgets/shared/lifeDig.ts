import { normalCdf } from './probability';

/* Playing your whole library from the top, one card at a time: a spell costs life equal to its mana
   value while a payoff gains 1 life for each spell cast this turn, and anything else, or a spell not
   worth its price, is exiled for 1 life. No payment may leave you below 1 life. */

export interface Dig {
  cards: number;
  /* the cards that can't be cast */
  lands: number;
  /* the spells' average mana value, which their mana values spread around like a Poisson curve */
  manaValue: number;
  life: number;
  /* spells cast this turn before the first card */
  storm: number;
  /* the first lands that cost nothing, played with land drops instead of exiled */
  freeLands?: number;
}

const NEGLIGIBLE_TAIL = 1e-12;
const SETTLED = 1e-13;
/* the life from which falling below 1 is estimated rather than worked out */
export const SAFE_LIFE = 512;
/* storm counts the recursion tells apart past the mana values: by then every spell is worth casting,
   and a higher storm only makes that surer */
const STORM_PAST_VALUES = 8;
/* land drops the recursion follows: more than that, short of every land, count as life */
const MOST_DROPS = 16;

/* The chance of each mana value, up to where the rest is negligible */
export function manaValueChances(mean: number): Float64Array {
  const chances: number[] = [];
  let chance = Math.exp(-mean);
  let total = 0;
  for (let value = 0; value <= mean || 1 - total > NEGLIGIBLE_TAIL; value++) {
    chances.push(chance);
    total += chance;
    chance *= mean / (value + 1);
  }
  return Float64Array.from(chances, (each) => each / total);
}

/* The life left once every card is played, on average, casting every spell: the storm gives back
   1 + 2 + … for the spells on top of the storm count, while they cost their mana values and each land
   not played for free costs 1. */
export function lifeAtTheEnd({ cards, lands, manaValue, life, storm, freeLands = 0 }: Dig): number {
  const spells = cards - lands;
  return life + spells * storm + (spells * (spells + 1)) / 2 - spells * manaValue - Math.max(0, lands - freeLands);
}

/* The chance of not falling below 1 life before casting the last spell, playing the best way, for every
   life up to the safe one: Bellman's recursion over the land drops left, the spells cast and life, from
   the last spell back, with each card a land at the library's share of them. A spell costing at most 2
   more than the storm count is always worth casting, since it leaves more life than exiling it would
   and adds to the storm; a dearer one is worth it while casting does at least as well as exiling. A land
   comes for free while land drops are left, and when every land would, the lands change nothing. Past
   the mana values the spells cast are no longer told apart, the highest count standing for every one
   above it. */
export function survival({ cards, lands, manaValue, storm, freeLands = 0 }: Dig) {
  const chances = manaValueChances(manaValue);
  const size = chances.length;
  const spells = cards - lands;
  const everyLand = freeLands >= lands;
  const landChance = everyLand ? 0 : lands / cards;
  const drops = everyLand ? 0 : Math.min(freeLands, MOST_DROPS);
  const lastCast = spells <= size + STORM_PAST_VALUES;
  const most = lastCast ? spells : size + STORM_PAST_VALUES;
  const width = SAFE_LIFE + 1;
  const layer = (most + 1) * width;
  const table = new Float64Array((drops + 1) * layer);
  const fill = (cast: number, dropsLeft: number) => {
    const row = dropsLeft * layer + cast * width;
    const above = dropsLeft * layer + Math.min(cast + 1, most) * width;
    const gain = storm + cast + 1;
    let change = 0;
    table[row + SAFE_LIFE] = 1;
    for (let life = 1; life < SAFE_LIFE; life++) {
      const exile = life >= 2 ? table[row + life - 1] : 0;
      const land = dropsLeft > 0 ? table[row - layer + life] : exile;
      const affordable = Math.min(life, size);
      let value = 0;
      let worth = 0;
      let rest = 1;
      for (; value < affordable; value++) {
        const after = life + gain - value;
        const cast = after >= SAFE_LIFE ? 1 : table[above + after];
        if (cast < exile && value > gain + 1) {
          break;
        }
        worth += chances[value] * cast;
        rest -= chances[value];
      }
      const chance = landChance * land + (1 - landChance) * (worth + Math.max(0, rest) * exile);
      change = Math.max(change, Math.abs(chance - table[row + life]));
      table[row + life] = chance;
    }
    return change;
  };
  for (let dropsLeft = 0; dropsLeft <= drops; dropsLeft++) {
    if (lastCast) {
      table.fill(1, dropsLeft * layer + most * width, dropsLeft * layer + (most + 1) * width);
    } else {
      let sweeps = 0;
      while (fill(most, dropsLeft) > SETTLED && ++sweeps < SAFE_LIFE) {
        /* until the row that leads back to itself settles */
      }
    }
    for (let cast = most - 1; cast >= 0; cast--) {
      fill(cast, dropsLeft);
    }
  }
  return (life: number) => (life >= SAFE_LIFE ? 1 : table[drops * layer + life]);
}

/* The chance of not falling below 1 life on the way, from far up: the average path dips while the
   storm count is low and then climbs, and the dip spreads like a normal curve. */
export function surviveDip({ cards, lands, manaValue, life, storm }: Dig): number {
  const spells = cards - lands;
  const gap = lands / (spells + 1);
  const gapSpread = gap * (1 + gap);
  const climb = storm + 0.5 - manaValue - gap;
  const lowest = Math.min(spells, Math.max(0, -climb));
  const margin = life + lowest * climb + (lowest * lowest) / 2 - gap - 0.5;
  return normalCdf(margin / Math.sqrt(lowest * (manaValue + gapSpread) + gapSpread));
}

/* The chance of falling below 1 life before the end of the library, for each of the lives asked about */
export function deathChances(dig: Dig, lives: number[] = [dig.life]): Map<number, number> {
  const { cards, lands, freeLands = 0 } = dig;
  const free = Math.min(freeLands, lands);
  const past = free < lands ? Math.max(0, free - MOST_DROPS) : 0;
  const survives = cards > lands && lives.some((life) => life + past < SAFE_LIFE) ? survival(dig) : undefined;
  return new Map(
    lives.map((life) => {
      if (lifeAtTheEnd({ ...dig, life }) < 1) {
        return [life, 1];
      }
      if (cards <= lands) {
        return [life, 0];
      }
      const survived =
        survives && life + past < SAFE_LIFE ? survives(life + past) : surviveDip({ ...dig, life: life + free });
      return [life, 1 - survived];
    }),
  );
}
