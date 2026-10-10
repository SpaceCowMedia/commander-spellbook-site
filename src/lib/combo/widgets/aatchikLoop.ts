import { formatNumber, plural, signed } from './shared/format';
import { numberInput } from './shared/inputs';
import { defineWidget } from './shared/widget';
import { has } from './parse/variant';

/* Recasting Aatchik for {3}{B}{B}{G}, plus {1}{G} when Temur Sabertooth returns it */
const LOOPS = [
  { card: 'Temur Sabertooth', cost: 8 },
  { card: 'Cloudstone Curio', cost: 6 },
];

const OWN_MANA = numberInput('mana', 'Mana of your own for the loops', 0);

export const aatchikLoop = defineWidget('aatchik-loop', {
  detect(variant) {
    const loop = has(variant, 'Aatchik, Emerald Radian', 'Phyrexian Altar')
      ? LOOPS.find(({ card }) => has(variant, card))
      : undefined;
    return loop && { cost: loop.cost };
  },
  calculator({ cost }) {
    const cards = numberInput('cards', 'Artifact and creature cards in your graveyard', cost);
    return {
      category: 'board',
      title: 'How long does the Aatchik loop last?',
      summary: `Aatchik makes an Insect for each artifact and creature card in your graveyard. Sacrificing them makes that much mana and drains each opponent that much, and returning and recasting Aatchik costs ${cost}: with ${cost} cards or more the loop never stops.`,
      inputs: [cards, OWN_MANA],
      compute(values) {
        const insects = values.numbers.cards;
        const endless = insects >= cost;
        const loops = endless ? Infinity : 1 + Math.floor(values.numbers.mana / (cost - insects));
        return {
          headline: endless
            ? { label: 'Loops', value: 'As many as you like' }
            : {
                label: 'Loops',
                value: formatNumber(loops),
                caption: `${plural(loops * insects, 'life', 'life')} from each opponent`,
              },
          verdict: endless
            ? { tone: 'good', title: 'Every opponent dies' }
            : { tone: 'warn', title: 'The loop stops when your mana runs out' },
          stats: [
            { label: 'Mana each loop', value: signed(insects - cost) },
            { label: 'Life each loop drains', value: formatNumber(insects) },
          ],
        };
      },
    };
  },
});
