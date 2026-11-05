import { sweptDots } from './shared/charts';
import { formatNumber } from './shared/format';
import { choiceInput, numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has, shortName, usesAny } from './parse/variant';

const KAMBAL = 'Kambal, Profiteering Mayor';
const AYARA = 'Ayara, First of Locthwain';
const REPLACERS = ['Mirrormind Crown', 'Moonlit Meditation'];
const TOKENS = numberInput('tokens', 'Tokens you create at once', 3, { min: 2 });

export type Order = 'payoff' | 'payoffThenRatadrabik' | 'ratadrabikThenPayoff';

export interface Chain {
  tokens: number;
  /* the payoff drains for each creature entering, not once for all the tokens entering together */
  eachCreature: boolean;
  order: Order;
}

/* 1 + 2 + … + count: what the copies of the payoff drain, the kth draining k as it enters */
function rising(count: number): number {
  return (count * (count + 1)) / 2;
}

/* The life each opponent has lost once each kill has resolved, and the 2/2 Zombies left. The copies of
   Ratadrabik enter together, then the legend rule puts all but one into the graveyard, and every
   Ratadrabik makes a Zombie copy of each other one that died: n² Zombies, each draining 1. The payoff
   dying makes every Ratadrabik copy it. Ratadrabik dying makes each Zombie copy it once more: before
   the payoff, that doubles the payoff's copies; after, each new Zombie drains once for every copy. */
export function kills({ tokens, eachCreature, order }: Chain): { drained: number[]; zombies: number } {
  const squared = tokens * tokens;
  const start = (eachCreature ? tokens : 1) + squared;
  if (order === 'ratadrabikThenPayoff') {
    const afterRatadrabik = start + squared;
    return { drained: [afterRatadrabik, afterRatadrabik + rising(2 * squared)], zombies: 4 * squared };
  }
  const afterPayoff = start + rising(squared + 1);
  return order === 'payoff'
    ? { drained: [afterPayoff], zombies: 2 * squared + 1 }
    : { drained: [afterPayoff, afterPayoff + squared * (squared + 1)], zombies: 3 * squared + 1 };
}

export function drained(chain: Chain): number {
  return kills(chain).drained.at(-1)!;
}

export const ratadrabikDrain = defineWidget('ratadrabik-drain', {
  detect(variant) {
    const payoff = usesAny(variant, [KAMBAL, AYARA]);
    const replacer = usesAny(variant, REPLACERS);
    return has(variant, 'Ratadrabik of Urborg') && payoff && replacer && { payoff, replacer };
  },
  calculator({ payoff, replacer }) {
    const name = shortName(payoff);
    const eachCreature = payoff === AYARA;
    return {
      category: 'finite',
      title: 'How much life does each opponent lose?',
      summary: `${replacer} turns the tokens you create at once into copies of Ratadrabik, and when the legend rule puts all but one into your graveyard, every Ratadrabik makes a 2/2 Zombie copy of each other one that died. ${name} drains 1 ${eachCreature ? 'for each copy and each Zombie as they enter' : 'as the copies enter together, and 1 as each Zombie enters'}. Once ${name} dies, every Ratadrabik makes a copy of it, and each one drains once for every copy of ${name} there is as it enters. With a second kill, Ratadrabik dying makes each Zombie copy it once more: killed first, it doubles the copies of ${name}${eachCreature ? `, and ${name} can sacrifice it herself if she can tap` : ''}; killed after, each new Zombie drains once for every copy.`,
      inputs: [
        TOKENS,
        choiceInput('order', 'Kill order', [
          ['payoff', `Only ${name}`],
          ['payoffThenRatadrabik', `${name}, then Ratadrabik`],
          ['ratadrabikThenPayoff', `Ratadrabik, then ${name}`],
        ]),
      ],
      compute(values) {
        const order = values.choices.order as Order;
        const chainOf = (tokens: number): Chain => ({ tokens, eachCreature, order });
        const chain = chainOf(values.numbers.tokens);
        const { drained: afterEach, zombies } = kills(chain);
        const [first, second] = afterEach;
        const survivor = order === 'ratadrabikThenPayoff' ? name : 'Ratadrabik';
        return {
          headline: {
            label: 'Life each opponent loses',
            value: formatNumber(second ?? first),
            caption: 'you gain as much',
          },
          stats: [
            ...(second === undefined
              ? []
              : [{ label: 'After the first kill', value: formatNumber(first), caption: `if ${survivor} survives` }]),
            { label: '2/2 Zombie tokens left', value: formatNumber(zombies) },
          ],
          charts: [
            {
              title: 'Life drained by tokens created at once',
              xLabel: 'Tokens created at once',
              selects: 'tokens',
              ...sweptDots(TOKENS, chain.tokens, (tokens) => {
                const life = drained(chainOf(tokens));
                return { y: life, label: `${formatNumber(tokens)} tokens: ${formatNumber(life)} life` };
              }),
            },
          ],
        };
      },
    };
  },
});
