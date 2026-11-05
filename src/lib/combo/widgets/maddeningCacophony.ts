import { OPPONENT_LIBRARY, OPPONENT_LIFE, choiceInput } from './shared/inputs';
import { killedHeadline, lifeOutcome, tableVerdict } from './shared/outcomes';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

export const maddeningCacophony = defineWidget('maddening-cacophony', {
  detect: (variant) => has(variant, 'Maddening Cacophony', 'Duskmantle Guildmage') && {},
  calculator: () => ({
    category: 'lethal',
    title: 'Who dies to Maddening Cacophony?',
    summary:
      'Each card milled makes its owner lose 1 life through Duskmantle Guildmage. Kicked, each opponent mills half their library, rounded up; otherwise eight cards.',
    inputs: [
      choiceInput('kicked', 'Maddening Cacophony', [
        ['yes', 'Kicked'],
        ['no', 'Not kicked'],
      ]),
    ],
    opponents: { fields: [OPPONENT_LIFE, OPPONENT_LIBRARY] },
    compute(values) {
      const outcomes = values.opponents.map(({ life, library }) =>
        lifeOutcome(life - (values.choices.kicked === 'no' ? Math.min(8, library) : Math.ceil(library / 2))),
      );
      return { headline: killedHeadline(outcomes), verdict: tableVerdict(outcomes), outcomes };
    },
  }),
});
