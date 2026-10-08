import { ChannelEffect, LifeToXSpec } from '../spec';
import {
  Calculator,
  LIFE_INPUT,
  OPPONENT_LIFE,
  OpponentField,
  Result,
  formatNumber,
  formatPowerOfTwo,
  lifeOutcome,
  numberInput,
  plural,
} from '../calculator';

interface Opponent {
  life: number;
  resources: number;
}

interface Hit {
  x: number;
  /* life lost or damage taken by each opponent, null when not targeted */
  hits: (number | null)[];
  gain?: number;
  /* how the spell is cast, e.g. "Multikicked twice" */
  how?: string;
}

/* The opponents to aim at first: the ones closest to dying. */
function byLife(opponents: Opponent[]): number[] {
  return opponents.map((_, i) => i).sort((a, b) => opponents[a].life - opponents[b].life);
}

/* `perTarget` damage to up to `targets` opponents, lowest life first. */
function aimed(opponents: Opponent[], targets: number, perTarget: number): (number | null)[] {
  const chosen = new Set(byLife(opponents).slice(0, Math.max(0, targets)));
  return opponents.map((_, i) => (chosen.has(i) ? perTarget : null));
}

function kills(opponents: Opponent[], hits: (number | null)[]): number {
  return opponents.filter((opponent, i) => hits[i] !== null && hits[i]! >= opponent.life).length;
}

/* The best way to spend `generic` mana on X with the spell. */
function channelHit(effect: ChannelEffect, generic: number, opponents: Opponent[]): Hit {
  const x = Math.max(0, generic);
  const n = opponents.length;
  switch (effect) {
    case 'drain':
      return { x, hits: opponents.map(() => x), gain: x * n };
    case 'lose':
      return { x, hits: opponents.map(() => x) };
    case 'lose-twice':
      return { x, hits: opponents.map(() => 2 * x), gain: 2 * x * n };
    case 'torment':
      return { x, hits: opponents.map((opponent) => 3 * Math.max(0, x - opponent.resources)) };
    case 'crackle': {
      const third = Math.floor(x / 3);
      return {
        x: third,
        hits: aimed(opponents, third, 5 * third),
        how: `X is ${third}: ${5 * third} damage to each of up to ${plural(third, 'target')}`,
      };
    }
    case 'jaya':
      return { x, hits: aimed(opponents, 3, x), how: 'Up to three targets' };
    case 'comet': {
      let best: Hit = { x, hits: aimed(opponents, 1, x), how: 'No multikicker' };
      for (let kicks = 1; kicks <= Math.min(x, n - 1); kicks++) {
        const hit = {
          x: x - kicks,
          hits: aimed(opponents, kicks + 1, x - kicks),
          how: `Multikicked ${plural(kicks, 'time')}`,
        };
        if (kills(opponents, hit.hits) > kills(opponents, best.hits)) {
          best = hit;
        }
      }
      return best;
    }
    case 'fireball': {
      let best: Hit = { x, hits: aimed(opponents, 1, x), how: 'One target' };
      for (let targets = 2; targets <= Math.min(n, x); targets++) {
        const spent = x - (targets - 1);
        const hit = {
          x: spent,
          hits: aimed(opponents, targets, Math.floor(spent / targets)),
          how: `Split among ${plural(targets, 'target')}`,
        };
        if (kills(opponents, hit.hits) > kills(opponents, best.hits)) {
          best = hit;
        }
      }
      return best;
    }
  }
}

const VERBS: Record<ChannelEffect, string> = {
  drain: 'Each opponent loses X life and you gain the total',
  lose: 'Each opponent loses X life',
  'lose-twice': 'Each opponent loses twice X life and you gain the total',
  torment: 'Each opponent loses 3 life per repetition they can’t pay with a card or a nonland permanent',
  crackle: 'Each X costs {3}, for 5 damage to each of up to X targets',
  comet: 'X damage to each of one target plus one per multikick, each kick costing {1}',
  jaya: 'X damage to each of up to three targets',
  fireball: 'X damage split evenly, rounded down, with {1} more for each target after the first',
};

function channelCalculator(spec: Extract<LifeToXSpec, { model: 'channel' }>): Calculator {
  const torment = spec.effect === 'torment';
  const fields: OpponentField[] = [OPPONENT_LIFE];
  if (torment) {
    fields.push({ key: 'resources', label: 'Cards in hand and nonland permanents', min: 0, max: 99, initial: 12 });
  }
  const opponentsOf = (rows: Record<string, number>[]): Opponent[] =>
    rows.map((row) => ({ life: row.life, resources: row.resources ?? 0 }));
  const lifeToKill = (extra: number, opponents: Opponent[]) => {
    const killsAll = (life: number) =>
      kills(opponents, channelHit(spec.effect, life - 1 + extra, opponents).hits) === opponents.length;
    if (!killsAll(100000)) {
      return Infinity;
    }
    let low = 1;
    let high = 100000;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (killsAll(middle)) {
        high = middle;
      } else {
        low = middle + 1;
      }
    }
    return low;
  };
  return {
    title: `How big a ${spec.spell} your life buys`,
    summary: `Channel turns all but 1 of your life into colorless mana for X. ${VERBS[spec.effect]}. Channel's {G}{G} and the spell's colored mana come from elsewhere.`,
    inputs: [LIFE_INPUT, numberInput('extra', 'Other mana you can put into X', 0, 99, 0)],
    opponents: { fields },
    compute(values): Result {
      const life = values.numbers.life;
      const extra = values.numbers.extra;
      const opponents = opponentsOf(values.opponents);
      const hit = channelHit(spec.effect, life - 1 + extra, opponents);
      const killed = kills(opponents, hit.hits);
      const needed = lifeToKill(extra, opponents);
      const stats = [
        {
          label: 'Life needed to kill everyone',
          value: Number.isFinite(needed) ? formatNumber(needed) : 'Out of reach',
        },
      ];
      if (hit.gain !== undefined) {
        stats.push({ label: 'You gain', value: formatNumber(hit.gain) });
      }
      if (hit.how) {
        stats.push({ label: 'Best way to cast it', value: hit.how });
      }
      return {
        headline: {
          label: 'X',
          value: formatNumber(hit.x),
          caption: `from ${formatNumber(Math.max(0, life - 1))} life and ${formatNumber(extra)} other mana`,
        },
        verdict:
          killed === opponents.length
            ? { tone: 'good', title: 'Every opponent dies' }
            : {
                tone: killed > 0 ? 'warn' : 'bad',
                title: `${plural(killed, 'opponent')} of ${opponents.length} ${killed === 1 ? 'dies' : 'die'}`,
              },
        stats,
        outcomes: opponents.map((opponent, i) =>
          hit.hits[i] === null ? { tone: 'neutral', text: 'Not targeted' } : lifeOutcome(opponent.life - hit.hits[i]!),
        ),
      };
    },
  };
}

export function lifeToXCalculator(spec: LifeToXSpec): Calculator {
  switch (spec.model) {
    case 'channel':
      return channelCalculator(spec);
    case 'storm-herd-crusade':
      return {
        title: 'How big the Pegasus army gets',
        summary: `Storm Herd makes one 1/1 flying Pegasus per life point. They enter together, so ${spec.partner} triggers once per Pegasus and every creature you control gets that many +1/+1 counters.`,
        inputs: [LIFE_INPUT, numberInput('others', 'Other creatures you control', 0, 99, 2)],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values): Result {
          const x = values.numbers.life;
          const size = x + 1;
          const lives = values.opponents.map((opponent) => opponent.life);
          const pegasiNeeded = lives.reduce((total, life) => total + Math.ceil(life / size), 0);
          return {
            headline: { label: 'Pegasi', value: formatNumber(x), caption: `each a ${size}/${size} flier` },
            verdict:
              pegasiNeeded <= x
                ? {
                    tone: 'good',
                    title: 'Enough fliers to kill the table',
                    detail: 'Once they can attack and nothing blocks them.',
                  }
                : { tone: 'bad', title: `${plural(pegasiNeeded - x, 'Pegasus', 'Pegasi')} short of killing the table` },
            stats: [
              { label: 'Total flying power', value: formatNumber(x * size) },
              { label: 'Your other creatures get', value: `+${formatNumber(x)}/+${formatNumber(x)}` },
            ],
            outcomes: lives.map((life) => ({
              tone: 'neutral',
              text: `Needs ${plural(Math.ceil(life / size), 'Pegasus', 'Pegasi')}`,
            })),
          };
        },
      };
    case 'storm-herd-count':
      return {
        title: `Enough creatures for ${spec.partner}?`,
        summary: `Storm Herd makes one Pegasus per life point, so your life plus the creatures you already control has to reach ${spec.target}.`,
        inputs: [LIFE_INPUT, numberInput('creatures', 'Creatures you control', 0, 99, 2)],
        compute(values): Result {
          const total = values.numbers.life + values.numbers.creatures;
          const missing = spec.target - total;
          return {
            headline: {
              label: 'Creatures after Storm Herd',
              value: formatNumber(total),
              caption: `${spec.target} needed`,
            },
            verdict:
              missing <= 0
                ? { tone: 'good', title: 'Enough creatures' }
                : { tone: 'bad', title: `${plural(missing, 'creature')} or life short` },
          };
        },
      };
    case 'storm-herd-sunborn':
      return {
        title: 'How many tokens Storm Herd turns into',
        summary:
          'Storm Herd makes two Exalted Sunborn tokens per life point. Each Exalted Sunborn doubles the tokens you make, so with 2L of them plus the original, every later token is multiplied by 2 to the power of 2L + 1.',
        inputs: [LIFE_INPUT],
        compute(values): Result {
          const copies = 2 * values.numbers.life;
          return {
            headline: { label: 'Every later token becomes', value: formatPowerOfTwo(copies + 1), caption: 'tokens' },
            stats: [{ label: 'Exalted Sunborn tokens', value: formatNumber(copies) }],
          };
        },
      };
  }
}
