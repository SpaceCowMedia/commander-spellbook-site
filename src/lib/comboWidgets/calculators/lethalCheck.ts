import { LethalCheckSpec } from '../spec';
import { formatMana, parseMana, scaleMana } from '../mana';
import {
  Calculator,
  LIFE_INPUT,
  OPPONENT_LIFE,
  OpponentField,
  Outcome,
  Result,
  STARTING_LIFE,
  Tone,
  Verdict,
  Values,
  formatNumber,
  lifeOutcome,
  numberInput,
  plural,
} from '../calculator';

const LIBRARY: OpponentField = { key: 'library', label: 'Cards in library', min: 0, max: 200, initial: 60 };
const POISON: OpponentField = { key: 'poison', label: 'Poison counters', min: 0, max: 9, initial: 0 };

/* Everyone dies, some do, or nobody. */
function tableVerdict(outcomes: Outcome[], deadTitle = 'Every opponent dies'): Verdict {
  const dead = outcomes.filter((outcome) => outcome.tone === 'good').length;
  if (dead === outcomes.length) {
    return { tone: 'good', title: deadTitle };
  }
  return {
    tone: dead > 0 ? 'warn' : 'bad',
    title: `${dead} of ${plural(outcomes.length, 'opponent')} ${dead === 1 ? 'dies' : 'die'}`,
  };
}

function killedHeadline(outcomes: Outcome[]) {
  const dead = outcomes.filter((outcome) => outcome.tone === 'good').length;
  return { label: 'Opponents killed', value: `${dead} of ${outcomes.length}` };
}

/* Aimed at one opponent: the question is which of them it can kill. */
function targetVerdict(outcomes: Outcome[]): Verdict {
  const killable = outcomes.filter((outcome) => outcome.tone === 'good').length;
  if (killable === outcomes.length) {
    return { tone: 'good', title: 'Any opponent you target dies' };
  }
  return killable > 0
    ? { tone: 'warn', title: `${killable} of ${plural(outcomes.length, 'opponent')} can be killed` }
    : { tone: 'bad', title: 'No opponent dies' };
}

/* A calculator where each opponent lives or dies on their own numbers. */
function perOpponent(
  title: string,
  summary: string,
  fields: OpponentField[],
  outcome: (opponent: Record<string, number>, values: Values) => Outcome,
  extra: Pick<Calculator, 'inputs'> & { singleTarget?: boolean } = { inputs: [] },
  finish?: (result: Result, values: Values) => Result,
): Calculator {
  return {
    title,
    summary,
    inputs: extra.inputs,
    opponents: { fields },
    compute(values) {
      const outcomes = values.opponents.map((opponent) => outcome(opponent, values));
      const verdict = extra.singleTarget ? targetVerdict(outcomes) : tableVerdict(outcomes);
      const result: Result = { headline: killedHeadline(outcomes), verdict, outcomes };
      return finish ? finish(result, values) : result;
    },
  };
}

/* Lowest life first, spend `budget` points of damage that each take `perPoint` off one opponent. */
function spread(lives: number[], budget: number, chunk: number): number[] {
  const remaining = [...lives];
  let left = budget;
  for (const i of lives.map((_, i) => i).sort((a, b) => lives[a] - lives[b])) {
    const needed = Math.ceil(remaining[i] / chunk);
    if (needed <= left) {
      left -= needed;
      remaining[i] = 0;
    } else {
      remaining[i] -= left * chunk;
      left = 0;
    }
  }
  return remaining;
}

/* Loops of damage to every player at once, with pings aimed at the opponent with the most life. */
function raceEveryone(life: number, lives: number[], damage: number, pings: number) {
  const opponents = [...lives];
  let you = life;
  const deaths: (number | null)[] = opponents.map(() => null);
  const alive = () => opponents.some((opponent) => opponent > 0);
  const ping = (loop: number) => {
    const target = opponents.reduce(
      (best, opponent, i) => (opponent > 0 && (best < 0 || opponent > opponents[best]) ? i : best),
      -1,
    );
    if (target >= 0 && --opponents[target] <= 0) {
      deaths[target] = loop;
    }
  };
  for (let loop = 1; loop <= 2000; loop++) {
    for (let i = 0; i < Math.ceil(pings / 2) && alive(); i++) {
      ping(loop);
    }
    if (!alive()) {
      return { end: 'win' as const, loops: loop, deaths, you };
    }
    you -= damage;
    opponents.forEach((opponent, i) => {
      if (opponent > 0) {
        opponents[i] -= damage;
        if (opponents[i] <= 0) {
          deaths[i] = loop;
        }
      }
    });
    if (you <= 0) {
      return { end: alive() ? ('lose' as const) : ('draw' as const), loops: loop, deaths, you };
    }
    for (let i = 0; i < Math.floor(pings / 2) && alive(); i++) {
      ping(loop);
    }
    if (!alive()) {
      return { end: 'win' as const, loops: loop, deaths, you };
    }
  }
  return { end: 'lose' as const, loops: 2000, deaths, you };
}

function lowestWinning(test: (life: number) => boolean, cap = 100000): number {
  if (!test(cap)) {
    return Infinity;
  }
  let low = 1;
  let high = cap;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (test(middle)) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }
  return low;
}

export function lethalCheckCalculator(spec: LethalCheckSpec): Calculator {
  switch (spec.model) {
    case 'peer':
      return perOpponent(
        'Who dies to Peer into the Abyss?',
        `The target draws half their library and loses half their life, both rounded up, then ${spec.punisher} makes them lose ${spec.perCard} for each card drawn.`,
        [OPPONENT_LIFE, LIBRARY],
        ({ life, library }) => {
          const left = life - Math.ceil(life / 2) - spec.perCard * Math.ceil(library / 2);
          const needed = 2 * Math.ceil(Math.floor(life / 2) / spec.perCard) - 1;
          return left <= 0
            ? { tone: 'good', text: 'Dies if targeted' }
            : {
                tone: 'bad',
                text: `Survives at ${formatNumber(left)}, needs ${Math.max(0, needed)}+ cards in library`,
              };
        },
        { inputs: [], singleTarget: true },
        (result) => ({
          ...result,
          headline: {
            ...result.headline,
            label: 'Opponents you can kill',
            caption: 'Peer into the Abyss targets one of them',
          },
        }),
      );
    case 'mill-drain':
      return perOpponent(
        'Who dies to Maddening Cacophony?',
        'Each card milled makes its owner lose 1 life through Duskmantle Guildmage. Kicked, each opponent mills half their library, rounded up; otherwise eight cards.',
        [OPPONENT_LIFE, LIBRARY],
        ({ life, library }, values) => {
          const milled = values.choices.kicked === 'no' ? Math.min(8, library) : Math.ceil(library / 2);
          return lifeOutcome(life - milled);
        },
        {
          inputs: [
            {
              kind: 'choice',
              key: 'kicked',
              label: 'Maddening Cacophony',
              options: [
                { value: 'yes', label: 'Kicked' },
                { value: 'no', label: 'Not kicked' },
              ],
              initial: 'yes',
            },
          ],
        },
      );
    case 'windfall-poison':
      return perOpponent(
        'Who dies to the Windfall?',
        'Everyone draws as many cards as the biggest hand discarded, and each card an opponent draws gives them a poison counter.',
        [POISON],
        ({ poison }, values) => {
          const total = poison + values.numbers.hand;
          return total >= 10
            ? { tone: 'good', text: 'Dies to poison' }
            : { tone: 'bad', text: `Survives at ${total} poison` };
        },
        { inputs: [numberInput('hand', 'Most cards in hand among all players', 0, 60, 7)] },
        (result, values) => ({
          ...result,
          stats: [
            {
              label: 'Biggest hand needed',
              value: formatNumber(10 - Math.min(...values.opponents.map((o) => o.poison))),
            },
          ],
        }),
      );
    case 'library-ping':
      return perOpponent(
        'Who dies before your library runs out?',
        'Each loop deals 1 damage to each opponent and draws you a card, so your library has to be bigger than their life total.',
        [OPPONENT_LIFE],
        ({ life }, values) =>
          values.numbers.library > life
            ? { tone: 'good', text: 'Dies' }
            : { tone: 'bad', text: `Needs ${life + 1}+ cards in your library` },
        { inputs: [numberInput('library', 'Cards in your library', 0, 200, 60)] },
      );
    case 'hallar':
      return perOpponent(
        'Who dies to Hallar?',
        'A kicked spell puts a +1/+1 counter on Hallar, then each opponent gets poison counters equal to the counters on it.',
        [POISON],
        ({ poison }, values) => {
          const total = poison + values.numbers.counters + 1;
          return total >= 10
            ? { tone: 'good', text: 'Dies to poison' }
            : { tone: 'bad', text: `Survives at ${total} poison` };
        },
        { inputs: [numberInput('counters', '+1/+1 counters on Hallar', 0, 20, 4)] },
      );
    case 'tireless-tribe':
      return perOpponent(
        'Is Tireless Tribe big enough?',
        'After Inside Out switches its power and toughness, Tireless Tribe has 5 power and gets 4 more for each card you discard.',
        [OPPONENT_LIFE],
        ({ life }, values) => {
          const power = 5 + 4 * values.numbers.hand;
          return power >= life
            ? { tone: 'good', text: 'Dies if attacked' }
            : { tone: 'bad', text: `Needs ${plural(Math.ceil((life - 5) / 4), 'card')} to discard` };
        },
        { inputs: [numberInput('hand', 'Cards you can discard', 0, 30, 5)] },
        (result, values) => ({
          ...result,
          stats: [{ label: "Tireless Tribe's power", value: formatNumber(5 + 4 * values.numbers.hand) }],
        }),
      );
    case 'charge-counters':
      return perOpponent(
        'Can Dragonspark Reactor finish someone?',
        "Dragonspark Reactor gets Eternity Vessel's charge counters and deals that much damage to one opponent.",
        [OPPONENT_LIFE],
        ({ life }, values) =>
          values.numbers.vessel + values.numbers.reactor >= life
            ? { tone: 'good', text: 'Dies if targeted' }
            : { tone: 'bad', text: 'Too much life' },
        {
          inputs: [
            numberInput('vessel', 'Charge counters on Eternity Vessel', 0, 999, STARTING_LIFE),
            numberInput('reactor', 'Charge counters on Dragonspark Reactor', 0, 999, 0),
          ],
          singleTarget: true,
        },
        (result, values) => ({
          ...result,
          headline: {
            label: 'Damage',
            value: formatNumber(values.numbers.vessel + values.numbers.reactor),
            caption: 'to one opponent',
          },
        }),
      );
    case 'ingris':
      return perOpponent(
        'Does the Rat army deal enough?',
        'Pay all but 1 of your life for Rats; each creature that attacks with Ingris makes it deal 1 damage to each opponent.',
        [OPPONENT_LIFE],
        ({ life }, values) => lifeOutcome(life - (values.numbers.life - 1 + values.numbers.attackers)),
        { inputs: [LIFE_INPUT, numberInput('attackers', 'Other creatures that can attack', 0, 99, 2)] },
        (result, values) => ({
          ...result,
          headline: {
            label: 'Damage to each opponent',
            value: formatNumber(values.numbers.life - 1 + values.numbers.attackers),
          },
        }),
      );
    case 'draw-drain':
      return {
        title: 'Is your library big enough to drain the table?',
        summary:
          'Every card you draw drains an opponent of your choice for 1, so your library has to hold their combined life.',
        inputs: [numberInput('library', 'Cards in your library', 0, 200, 60)],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values) {
          const lives = values.opponents.map((opponent) => opponent.life);
          const total = lives.reduce((a, b) => a + b, 0);
          const remaining = spread(lives, values.numbers.library, 1);
          const outcomes = remaining.map(lifeOutcome);
          return {
            headline: {
              label: 'Drains available',
              value: formatNumber(values.numbers.library),
              caption: `${formatNumber(total)} needed`,
            },
            verdict: tableVerdict(outcomes),
            outcomes,
          };
        },
      };
    case 'malcolm':
      return {
        title: 'Do the Treasures last until everyone is dead?',
        summary:
          'Each activation costs {1}{R}, deals 1 damage to each opponent and makes a Treasure for each one hit, then draws a card. With one opponent left, every activation loses a Treasure.',
        inputs: [
          numberInput('treasures', 'Treasures or mana to start with', 0, 99, 2),
          numberInput('library', 'Cards in your library', 0, 200, 60),
        ],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values) {
          const lives = values.opponents.map((opponent) => opponent.life);
          let treasures = values.numbers.treasures;
          let library = values.numbers.library;
          const deaths: (number | null)[] = lives.map(() => null);
          let activations = 0;
          let stop: string | undefined;
          while (lives.some((life) => life > 0)) {
            if (treasures < 2) {
              stop = 'You run out of Treasures';
              break;
            }
            if (activations > 0 && library === 0) {
              stop = 'Your library runs out';
              break;
            }
            if (activations > 0) {
              library--;
            }
            treasures -= 2;
            activations++;
            lives.forEach((life, i) => {
              if (life > 0) {
                treasures++;
                lives[i] = life - 1;
                if (lives[i] <= 0) {
                  deaths[i] = activations;
                }
              }
            });
          }
          const outcomes: Outcome[] = lives.map((life, i) =>
            deaths[i] !== null
              ? { tone: 'good', text: `Dies on activation ${deaths[i]}` }
              : { tone: 'bad', text: `Survives at ${formatNumber(life)}` },
          );
          return {
            headline: { label: 'Activations', value: formatNumber(activations) },
            verdict: stop
              ? { tone: 'bad', title: `${stop} after ${plural(activations, 'activation')}` }
              : { tone: 'good', title: 'Every opponent dies' },
            stats: [{ label: 'Treasures left', value: formatNumber(treasures) }],
            outcomes,
          };
        },
      };
    case 'debt':
      return debtCalculator(spec.via);
    case 'angel-destiny':
      return {
        title: 'Enough life for Angel of Destiny?',
        summary: spec.myriad
          ? 'Myriad gives one attacking Angel per opponent, and every Angel triggers on every hit: with N opponents you gain 4 × N² life. At your end step you need 15 more life than you started the game with.'
          : 'Each combat Angel of Destiny deals 2 + 2 damage and you gain 4 life. At your end step you need 15 more life than you started the game with.',
        inputs: [
          LIFE_INPUT,
          numberInput('start', 'Your starting life total', 1, 99, STARTING_LIFE),
          spec.myriad
            ? numberInput('opponents', 'Opponents', 1, 7, 3)
            : numberInput('combats', 'Combats with Angel of Destiny', 1, 10, 3),
        ],
        compute(values) {
          const gained = spec.myriad ? 4 * values.numbers.opponents ** 2 : 4 * values.numbers.combats;
          const needed = values.numbers.start + 15 - gained;
          return {
            headline: { label: 'Life needed now', value: formatNumber(Math.max(1, needed)) },
            verdict:
              values.numbers.life >= needed
                ? { tone: 'good', title: 'You win at your end step' }
                : { tone: 'bad', title: `You need ${formatNumber(needed - values.numbers.life)} more life` },
            stats: [{ label: 'Life gained by the Angels', value: formatNumber(gained) }],
          };
        },
      };
    case 'ojer':
      return {
        title: `How many ${spec.outlet} activations?`,
        summary: `Each activation deals damage equal to Ojer Axonil's power to each opponent and 1 to you, so you need more life than activations: with exactly that much the game is a draw.`,
        inputs: [numberInput('power', "Ojer Axonil's power", 1, 99, 4), LIFE_INPUT],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values) {
          const power = values.numbers.power;
          const life = values.numbers.life;
          const lives = values.opponents.map((opponent) => opponent.life);
          const activations = Math.ceil(Math.max(...lives) / power);
          const cost = parseMana(spec.mana);
          const tone: Tone = life > activations ? 'good' : life === activations ? 'warn' : 'bad';
          return {
            headline: { label: 'Activations', value: formatNumber(activations) },
            verdict:
              tone === 'good'
                ? { tone, title: 'Every opponent dies', detail: `You end at ${formatNumber(life - activations)} life.` }
                : tone === 'warn'
                  ? {
                      tone,
                      title: 'The game is a draw',
                      detail:
                        'Your last activation brings you to 0 together with the last opponent. One more life is enough.',
                    }
                  : { tone, title: `You need ${formatNumber(activations + 1 - life)} more life` },
            stats: [
              ...(cost ? [{ label: 'Mana', value: formatMana(scaleMana(cost, activations)), mana: true }] : []),
              {
                label: 'Ojer Axonil takes',
                value: `${formatNumber(activations)} damage`,
                caption: 'give it indestructible or protection if that is too much',
              },
            ],
            outcomes: lives.map((opponentLife) => ({
              tone: 'good',
              text: `Dies after ${plural(Math.ceil(opponentLife / power), 'activation')}`,
            })),
          };
        },
      };
    case 'hidetsugu':
      return {
        title: 'Who dies to Heartless Hidetsugu?',
        summary:
          'Every player gets poison counters equal to half their life, rounded down. Ten poison counters lose the game, you included.',
        inputs: [{ ...LIFE_INPUT, initial: 18 }, numberInput('poison', 'Your poison counters', 0, 9, 0)],
        opponents: { fields: [OPPONENT_LIFE, POISON] },
        compute(values) {
          const outcomes: Outcome[] = values.opponents.map(({ life, poison }) => {
            const total = poison + Math.floor(life / 2);
            return total >= 10
              ? { tone: 'good', text: 'Dies to poison' }
              : { tone: 'bad', text: `Survives at ${total} poison` };
          });
          const yours = values.numbers.poison + Math.floor(values.numbers.life / 2);
          const allDead = outcomes.every((outcome) => outcome.tone === 'good');
          return {
            headline: killedHeadline(outcomes),
            verdict:
              yours >= 10
                ? {
                    tone: 'bad',
                    title: allDead ? 'The game is a draw' : 'You die too',
                    detail: `You get to ${yours} poison counters.`,
                  }
                : tableVerdict(outcomes),
            stats: [{ label: 'Your poison counters after', value: formatNumber(yours) }],
            outcomes,
          };
        },
      };
    case 'toad': {
      const peer = spec.via === 'peer';
      return {
        title: 'Twenty cards in hand?',
        summary: peer
          ? 'Peer into the Abyss draws half your library and takes half your life, both rounded up. Twenty-Toed Toad wins if you have twenty cards in hand.'
          : 'Enter the Infinite draws your whole library and puts one card back. Twenty-Toed Toad wins if you have twenty cards in hand.',
        inputs: [
          numberInput('hand', 'Cards in hand after casting the spell', 0, 60, 3),
          numberInput('library', 'Cards in your library', 0, 200, 60),
          ...(peer ? [LIFE_INPUT] : []),
        ],
        compute(values) {
          const { hand, library } = values.numbers;
          const total = peer ? hand + Math.ceil(library / 2) : hand + library - 1;
          const alive = !peer || values.numbers.life >= 2;
          return {
            headline: { label: 'Cards in hand', value: formatNumber(total), caption: '20 needed' },
            verdict: !alive
              ? { tone: 'bad', title: 'Peer into the Abyss takes your last life' }
              : total >= 20
                ? { tone: 'good', title: 'Twenty-Toed Toad wins the game' }
                : { tone: 'bad', title: `${plural(20 - total, 'card')} short` },
          };
        },
      };
    }
    case 'everyone-pinged':
      return {
        title: 'Do you outlast the table?',
        summary: `Each loop ${spec.source} deals ${spec.damage} damage to every player${spec.pings > 0 ? `, and ${plural(spec.pings, 'ping')} of 1 damage go to the opponent with the most life` : ''}. Reaching 0 together with the last opponent is a draw.`,
        inputs: [LIFE_INPUT],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values) {
          const lives = values.opponents.map((opponent) => opponent.life);
          const race = raceEveryone(values.numbers.life, lives, spec.damage, spec.pings);
          const needed = lowestWinning(
            (life) => raceEveryone(life, lives, spec.damage, spec.pings).end === 'win',
            5000,
          );
          return {
            headline: { label: 'Life needed', value: Number.isFinite(needed) ? formatNumber(needed) : 'Out of reach' },
            verdict:
              race.end === 'win'
                ? {
                    tone: 'good',
                    title: `Every opponent dies in loop ${race.loops}`,
                    detail: `You end at ${formatNumber(race.you)} life.`,
                  }
                : race.end === 'draw'
                  ? {
                      tone: 'warn',
                      title: 'The game is a draw',
                      detail: 'You reach 0 together with the last opponent.',
                    }
                  : { tone: 'bad', title: `You die in loop ${race.loops}` },
            outcomes: race.deaths.map((loop) =>
              loop !== null ? { tone: 'good', text: `Dies in loop ${loop}` } : { tone: 'bad', text: 'Survives' },
            ),
          };
        },
      };
    case 'hive-revenge':
      return {
        title: 'Do you survive the copies of Revenge?',
        summary:
          "Hive Mind gives each opponent a copy of Revenge, and each copy takes half your life, rounded up. You need at least 2 to the power of your opponents' count.",
        inputs: [LIFE_INPUT, numberInput('opponents', 'Opponents', 1, 7, 3)],
        compute(values) {
          const needed = 2 ** values.numbers.opponents;
          return {
            headline: { label: 'Life needed', value: formatNumber(needed) },
            verdict:
              values.numbers.life >= needed
                ? { tone: 'good', title: 'You survive and every opponent dies' }
                : { tone: 'bad', title: `You need ${formatNumber(needed - values.numbers.life)} more life` },
          };
        },
      };
    case 'belakor':
      return {
        title: "Is Be'lakor's damage enough?",
        summary:
          "The five Be'lakor copies trigger 25 times, 6 damage each, aimed one opponent at a time. If that's not lethal, their draw triggers make you draw and lose 5 for each Demon you control, five times over.",
        inputs: [
          LIFE_INPUT,
          numberInput('library', 'Cards in your library', 0, 200, 60),
          numberInput('demons', 'Demons you control besides the copies', 1, 30, 1),
        ],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values) {
          const lives = values.opponents.map((opponent) => opponent.life);
          const remaining = spread(lives, 25, 6);
          const outcomes = remaining.map(lifeOutcome);
          const draws = 5 * values.numbers.demons;
          const survives = values.numbers.library >= draws && values.numbers.life > draws;
          const allDead = outcomes.every((outcome) => outcome.tone === 'good');
          return {
            headline: killedHeadline(outcomes),
            verdict: allDead
              ? { tone: 'good', title: 'The damage alone kills the table' }
              : survives
                ? {
                    tone: 'warn',
                    title: 'Not lethal, but you survive the draws',
                    detail: `You draw ${draws} and lose ${draws} life.`,
                  }
                : {
                    tone: 'bad',
                    title: 'Not lethal, and the draws kill you',
                    detail: `You'd draw ${draws} and lose ${draws} life.`,
                  },
            outcomes,
          };
        },
      };
  }
}

function debtCalculator(via: 'revenge' | 'beacon' | 'life-lost'): Calculator {
  const lost = via === 'life-lost';
  return {
    title: lost ? 'How much life to pay before Debt to the Deathless?' : 'Does Debt to the Deathless kill the table?',
    summary: lost
      ? 'X is the life you lost this turn and each opponent loses twice X, so you have to lose half the highest life total, rounded up, and still have 1 life left.'
      : via === 'revenge'
        ? 'Revenge doubles your life and halves the life of the opponent you target, rounded up. Then X is the life you gained this turn, and each opponent loses twice X.'
        : 'Beacon of Immortality doubles your life, so X is your life total, and each opponent loses twice X.',
    inputs: [
      LIFE_INPUT,
      lost
        ? numberInput('already', 'Life you already lost this turn', 0, 999, 0)
        : numberInput('already', 'Life you already gained this turn', 0, 999, 0),
    ],
    opponents: { fields: [OPPONENT_LIFE] },
    compute(values) {
      const life = values.numbers.life;
      const lives = values.opponents.map((opponent) => opponent.life);
      if (lost) {
        const target = Math.ceil(Math.max(...lives) / 2);
        const pay = Math.max(0, target - values.numbers.already);
        const x = values.numbers.already + pay;
        const outcomes = lives.map((opponentLife) => lifeOutcome(opponentLife - 2 * x));
        return {
          headline: { label: 'Life to pay', value: formatNumber(pay), caption: `for X = ${formatNumber(x)}` },
          verdict:
            life - pay >= 1
              ? {
                  tone: 'good',
                  title: 'Every opponent dies',
                  detail: `You go down to ${formatNumber(life - pay)} before Debt resolves.`,
                }
              : {
                  tone: 'bad',
                  title: `You need ${formatNumber(pay + 1 - life)} more life`,
                  detail: 'Paying it all would leave you at 0.',
                },
          outcomes,
        };
      }
      const x = life + values.numbers.already;
      // Revenge halves one opponent: pick the one that leaves the fewest survivors
      const afterDebt = (target: number) =>
        lives.map(
          (opponentLife, i) => (i === target ? opponentLife - Math.ceil(opponentLife / 2) : opponentLife) - 2 * x,
        );
      const killed = (left: number[]) => left.filter((remaining) => remaining <= 0).length;
      const best =
        via === 'revenge'
          ? lives.map((_, target) => afterDebt(target)).reduce((a, b) => (killed(b) > killed(a) ? b : a))
          : afterDebt(-1);
      const outcomes = best.map(lifeOutcome);
      return {
        headline: { label: 'X', value: formatNumber(x), caption: `each opponent loses ${formatNumber(2 * x)}` },
        verdict: tableVerdict(outcomes),
        outcomes,
      };
    },
  };
}
