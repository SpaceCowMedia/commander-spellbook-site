import { formatMana, parseMana, scaleMana } from 'lib/symbols/mana';
import { formatSwept, sweptDots } from './shared/charts';
import { formatNumber, plural } from './shared/format';
import { HIGHEST_LIFE, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { MANA, findInSteps, has, says } from './parse/variant';

const POWER = numberInput('power', "Ojer Axonil's power", 4, { min: 1 });

export const ojerAxonil = defineWidget('ojer-axonil', {
  detect(variant) {
    const outlet =
      has(variant, 'Ojer Axonil, Deepest Might') &&
      says(variant, /dealing 1 damage to each creature/i) &&
      findInSteps(variant, new RegExp(`^activate (.+?) by paying ${MANA}`, 'i'));
    return outlet && { outlet: outlet[1], mana: outlet[2] };
  },
  calculator({ outlet, mana }) {
    const cost = parseMana(mana);
    return {
      category: 'lethal',
      title: `How many ${outlet} activations?`,
      summary: `Each activation deals damage equal to Ojer Axonil's power to each opponent and 1 to you, so you need more life than activations: with exactly that much the game is a draw. It deals 1 to Ojer Axonil too, which has to be there for the last one.`,
      inputs: [POWER, numberInput('toughness', "Ojer Axonil's toughness", 4, { min: 1 }), HIGHEST_LIFE],
      compute(values) {
        const { power, toughness, highestLife } = values.numbers;
        const activations = Math.ceil(highestLife / power);
        const total = cost && scaleMana(cost, activations);
        return {
          headline: { label: 'Activations', value: formatNumber(activations) },
          stats: [
            {
              label: 'You lose',
              value: `${formatNumber(activations)} life`,
              caption: 'with exactly that much life the game is a draw',
            },
            ...(total ? [{ label: 'Mana', value: formatMana(total), mana: total }] : []),
            {
              label: 'Ojer Axonil takes',
              value: `${formatNumber(activations)} damage`,
              caption:
                toughness < activations
                  ? `it would die on activation ${formatNumber(toughness)}: give it indestructible or protection`
                  : toughness === activations
                    ? 'it dies on the last activation, together with the opponents'
                    : 'it survives',
            },
          ],
          charts: [
            {
              kind: 'dots',
              title: "Activations by Ojer Axonil's power",
              xLabel: POWER.label,
              yLabel: 'Activations',
              selects: POWER.key,
              steadyFrom: highestLife,
              ...sweptDots(
                POWER,
                power,
                (at) => {
                  const needed = Math.ceil(highestLife / at);
                  const lives = toughness >= needed;
                  return {
                    y: needed,
                    label: `Power ${formatSwept(at, highestLife)}: ${plural(needed, 'activation')}${lives ? '' : ', more than its toughness'}`,
                    tone: lives ? 'good' : 'warn',
                  };
                },
                highestLife,
              ),
            },
          ],
        };
      },
    };
  },
});
