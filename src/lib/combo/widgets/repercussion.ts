import { formatNumber } from './shared/format';
import { OPPONENT_LIFE, numberInput } from './shared/inputs';
import { killedHeadline, lifeOutcome, tableVerdict } from './shared/outcomes';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

const DAMAGE = 13;

export const repercussion = defineWidget('repercussion', {
  detect: (variant) => has(variant, 'Blasphemous Act', 'Repercussion') && {},
  calculator: () => ({
    category: 'finite',
    title: 'Who dies to Blasphemous Act?',
    summary:
      "Every creature takes 13 damage, and Repercussion deals that much to its controller: 13 for each creature a player controls. You order the triggers, so the opponents' resolve before yours.",
    inputs: [numberInput('creatures', 'Creatures you control', 2)],
    opponents: { fields: [OPPONENT_LIFE, numberInput('creatures', 'Creatures', 3)] },
    compute(values) {
      const creatures =
        values.numbers.creatures + values.opponents.reduce((sum, opponent) => sum + opponent.creatures, 0);
      const outcomes = values.opponents.map(({ life, creatures: theirs }) => lifeOutcome(life - DAMAGE * theirs));
      const allDead = outcomes.every((outcome) => outcome.tone === 'good');
      const yours = DAMAGE * values.numbers.creatures;
      const cost = Math.max(0, 8 - creatures);
      return {
        headline: killedHeadline(outcomes),
        verdict: allDead
          ? { tone: 'good', title: 'Every opponent dies', detail: 'Before the triggers that would damage you resolve.' }
          : { ...tableVerdict(outcomes), detail: `You take ${formatNumber(yours)} damage.` },
        stats: [
          { label: 'Damage you take', value: formatNumber(yours), caption: 'only if an opponent survives' },
          { label: 'Blasphemous Act costs', value: `{${cost}}{R}`, mana: { generic: cost, pips: { R: 1 } } },
        ],
        outcomes,
      };
    },
  }),
});
