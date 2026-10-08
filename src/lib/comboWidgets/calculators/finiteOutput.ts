import pluralize from 'pluralize';
import { FiniteOutputSpec } from '../spec';
import { formatMana } from '../mana';
import {
  Calculator,
  LIFE_INPUT,
  OPPONENT_LIFE,
  Outcome,
  Result,
  Verdict,
  formatNumber,
  formatPercent,
  formatPowerOfTwo,
  lifeOutcome,
  numberInput,
  plural,
} from '../calculator';

/* Damage that comes as triggers of `each` damage, one target per trigger, aimed at the opponents
   closest to dying first. Returns what each opponent has left. */
function aimTriggers(lives: number[], triggers: number, each: number): number[] {
  const remaining = [...lives];
  let left = triggers;
  for (const i of lives.map((_, i) => i).sort((a, b) => lives[a] - lives[b])) {
    const needed = Math.ceil(remaining[i] / each);
    const used = Math.min(needed, left);
    remaining[i] -= used * each;
    left -= used;
  }
  return remaining;
}

function killsAll(lives: number[], triggers: number, each: number): boolean {
  return each > 0 && lives.reduce((total, life) => total + Math.ceil(life / each), 0) <= triggers;
}

function tableVerdict(outcomes: Outcome[]): Verdict {
  const dead = outcomes.filter((outcome) => outcome.tone === 'good').length;
  return dead === outcomes.length
    ? { tone: 'good', title: 'Every opponent dies' }
    : {
        tone: dead > 0 ? 'warn' : 'bad',
        title: `${dead} of ${plural(outcomes.length, 'opponent')} ${dead === 1 ? 'dies' : 'die'}`,
      };
}

/* Devastating Onslaught costs {X}{X}{R}. */
const copiesFor = (mana: number) => Math.max(0, Math.floor((mana - 1) / 2));

function onslaughtDamage(copied: string, copies: number, otherDragons: number): { triggers: number; each: number } {
  if (copied === 'Terror of the Peaks') {
    // every Terror sees every other one enter
    return { triggers: copies * copies, each: 5 };
  }
  // every Scourge triggers for each token entering, itself included, for the number of Dragons you control
  return { triggers: copies * (copies + 1), each: copies + 1 + otherDragons };
}

export function finiteOutputCalculator(spec: FiniteOutputSpec): Calculator {
  switch (spec.model) {
    case 'repercussion':
      return {
        title: 'Who dies to Blasphemous Act?',
        summary:
          "Every creature takes 13 damage, and Repercussion deals that much to its controller: 13 for each creature a player controls. You order the triggers, so the opponents' resolve before yours.",
        inputs: [LIFE_INPUT, numberInput('creatures', 'Creatures you control', 0, 99, 2)],
        opponents: { fields: [OPPONENT_LIFE, { key: 'creatures', label: 'Creatures', min: 0, max: 99, initial: 3 }] },
        compute(values): Result {
          const total =
            values.numbers.creatures + values.opponents.reduce((sum, opponent) => sum + opponent.creatures, 0);
          const outcomes = values.opponents.map(({ life, creatures }) => lifeOutcome(life - 13 * creatures));
          const allDead = outcomes.every((outcome) => outcome.tone === 'good');
          const yourDamage = 13 * values.numbers.creatures;
          return {
            headline: {
              label: 'Opponents killed',
              value: `${outcomes.filter((o) => o.tone === 'good').length} of ${outcomes.length}`,
            },
            verdict: allDead
              ? {
                  tone: 'good',
                  title: 'Every opponent dies',
                  detail: 'Before the triggers that would damage you resolve.',
                }
              : yourDamage >= values.numbers.life
                ? { tone: 'bad', title: 'You die too', detail: `You take ${formatNumber(yourDamage)} damage.` }
                : tableVerdict(outcomes),
            stats: [
              {
                label: 'Blasphemous Act costs',
                value: formatMana({ generic: Math.max(0, 8 - total), symbols: ['R'] }),
                mana: true,
              },
              { label: 'Damage you take', value: formatNumber(yourDamage) },
            ],
            outcomes,
          };
        },
      };
    case 'dragon-tempest':
      return {
        title: 'What are the odds of killing the table?',
        summary:
          'Ancient Gold Dragon rolls a d20 and makes that many Faerie Dragons at once. Each one triggers Dragon Tempest for damage equal to the Dragons you control, aimed where you like.',
        inputs: [numberInput('dragons', 'Dragons you control, Ancient Gold Dragon included', 1, 50, 1)],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values): Result {
          const dragons = values.numbers.dragons;
          const lives = values.opponents.map((opponent) => opponent.life);
          const rolls = Array.from({ length: 20 }, (_, i) => i + 1);
          const winning = rolls.filter((roll) => killsAll(lives, roll, dragons + roll));
          const average = rolls.reduce((sum, roll) => sum + roll * (dragons + roll), 0) / 20;
          return {
            headline: { label: 'Chance to kill the table', value: formatPercent(winning.length / 20) },
            verdict: winning.length
              ? {
                  tone: winning.length === 20 ? 'good' : 'warn',
                  title: `A roll of ${winning[0]} or more kills everyone`,
                }
              : { tone: 'bad', title: 'No roll kills everyone' },
            stats: [{ label: 'Average damage', value: formatNumber(average) }],
            outcomes: lives.map((life) => {
              const roll = rolls.find((r) => killsAll([life], r, dragons + r));
              return roll
                ? { tone: 'neutral', text: `Dies alone on a ${roll}+` }
                : { tone: 'bad', text: 'Survives any roll' };
            }),
            charts: [
              {
                kind: 'bars',
                title: 'Damage by d20 roll',
                xLabel: 'Roll',
                yLabel: 'Damage',
                bars: rolls.map((roll) => ({
                  x: String(roll),
                  y: roll * (dragons + roll),
                  label: `Roll ${roll}: ${formatNumber(roll * (dragons + roll))} damage${winning.includes(roll) ? ', kills everyone' : ''}`,
                  tone: winning.includes(roll) ? 'good' : 'bad',
                })),
              },
            ],
          };
        },
      };
    case 'onslaught': {
      if (spec.copied === 'Exalted Sunborn') {
        return {
          title: 'How big the token multiplier gets',
          summary:
            'Devastating Onslaught makes X copies of Exalted Sunborn, doubled by the original into 2X. With 2X + 1 Sunborns every later token is multiplied by 2 to the power of 2X + 1.',
          inputs: [numberInput('mana', 'Mana you spend on Devastating Onslaught', 3, 99, 7)],
          compute(values): Result {
            const x = copiesFor(values.numbers.mana);
            return {
              headline: { label: 'Every later token becomes', value: formatPowerOfTwo(2 * x + 1), caption: 'tokens' },
              stats: [{ label: 'X', value: formatNumber(x) }],
            };
          },
        };
      }
      const scourge = spec.copied !== 'Terror of the Peaks';
      return {
        title: 'How much damage Devastating Onslaught deals',
        summary: scourge
          ? `Devastating Onslaught makes X copies of ${spec.copied}, X(X + 1) triggers in all, each dealing damage equal to the Dragons you control.`
          : 'Devastating Onslaught makes X copies of Terror of the Peaks. Each Terror sees every other one enter: X² triggers of 5 damage.',
        inputs: [
          numberInput('mana', 'Mana you spend on Devastating Onslaught', 3, 99, 11),
          ...(scourge ? [numberInput('dragons', 'Other Dragons you control', 0, 50, 0)] : []),
        ],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values): Result {
          const x = copiesFor(values.numbers.mana);
          const { triggers, each } = onslaughtDamage(spec.copied, x, values.numbers.dragons ?? 0);
          const lives = values.opponents.map((opponent) => opponent.life);
          const outcomes = aimTriggers(lives, triggers, each).map(lifeOutcome);
          return {
            headline: {
              label: 'Total damage',
              value: formatNumber(triggers * each),
              caption: `${plural(triggers, 'trigger')} of ${each}`,
            },
            verdict: tableVerdict(outcomes),
            stats: [{ label: 'X', value: formatNumber(x), caption: `{${x}}{${x}}{R}` }],
            outcomes,
            charts: [
              {
                kind: 'bars',
                title: 'Damage by mana spent',
                xLabel: 'Mana',
                yLabel: 'Damage',
                selects: 'mana',
                bars: [5, 7, 9, 11, 13, 15, 17, 19].map((mana) => {
                  const hit = onslaughtDamage(spec.copied, copiesFor(mana), values.numbers.dragons ?? 0);
                  return {
                    x: String(mana),
                    y: hit.triggers * hit.each,
                    label: `{${mana}}: ${formatNumber(hit.triggers * hit.each)} damage`,
                    tone: killsAll(lives, hit.triggers, hit.each) ? 'good' : 'bad',
                    selected: mana === values.numbers.mana,
                  };
                }),
              },
            ],
          };
        },
      };
    }
    case 'token-growth': {
      const factor = 1 + spec.perToken;
      const creatures = pluralize(spec.creature);
      return {
        title: `How many ${creatures} you'll have`,
        summary: `Every upkeep each ${spec.creature} makes ${spec.perToken} more, so their number grows ${factor} times each turn, as long as they survive.`,
        inputs: [
          numberInput('start', `${creatures} you control now`, 1, 99, 2),
          numberInput('upkeeps', 'Upkeeps', 1, 12, 3),
        ],
        compute(values): Result {
          const { start, upkeeps } = values.numbers;
          return {
            headline: {
              label: creatures,
              value: formatNumber(start * factor ** upkeeps),
              caption: `after ${plural(upkeeps, 'upkeep')}`,
            },
            table: {
              caption: 'Upkeep by upkeep',
              columns: ['Upkeep', creatures],
              rows: Array.from({ length: upkeeps }, (_, i) => [String(i + 1), formatNumber(start * factor ** (i + 1))]),
            },
          };
        },
      };
    }
    case 'mirrorform':
      return {
        title: 'How much damage the Omnaths deal',
        summary:
          'Mirrorform turns each nonland permanent into Omnath. All but one die to the legend rule, and every Omnath triggers for every one that died: 3 damage each time.',
        inputs: [numberInput('permanents', 'Nonland permanents you control, Omnath included', 2, 99, 7)],
        opponents: { fields: [OPPONENT_LIFE] },
        compute(values): Result {
          const x = values.numbers.permanents;
          const triggers = x * (x - 1);
          const outcomes = aimTriggers(
            values.opponents.map((opponent) => opponent.life),
            triggers,
            3,
          ).map(lifeOutcome);
          return {
            headline: {
              label: 'Total damage',
              value: formatNumber(3 * triggers),
              caption: `${plural(triggers, 'trigger')} of 3`,
            },
            verdict: tableVerdict(outcomes),
            outcomes,
          };
        },
      };
    case 'scepter-turns':
      return {
        title: 'How many extra turns',
        summary:
          "Eternity Vessel enters with charge counters equal to your life, they move to Magistrate's Scepter, and every three counters are an extra turn.",
        inputs: [LIFE_INPUT, numberInput('counters', "Charge counters already on Magistrate's Scepter", 0, 999, 0)],
        compute(values): Result {
          const turns = Math.floor((values.numbers.life + values.numbers.counters) / 3);
          return { headline: { label: 'Extra turns', value: formatNumber(turns) } };
        },
      };
  }
}
