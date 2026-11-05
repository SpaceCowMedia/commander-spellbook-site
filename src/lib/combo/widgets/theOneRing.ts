import type { Dot } from './shared/calculator';
import { stepDots, stepPage } from './shared/charts';
import { formatNumber, plural, signed } from './shared/format';
import { LIBRARY, numberInput } from './shared/inputs';
import { lowestPassing } from './shared/search';
import { defineWidget } from './shared/widget';
import { findInSteps, has, says } from './parse/variant';

/* Ways to untap The One Ring, and the cards each untap discards */
const UNTAPS = [
  { cards: ['Mind Over Matter'], discards: 1, how: 'discarding a card to Mind Over Matter' },
  {
    cards: ['Voltaic Construct', 'Skirge Familiar'],
    discards: 2,
    how: "discarding two cards to Skirge Familiar for Voltaic Construct's {2}",
  },
];
/* steps on a page of the chart: a draw and a discard for each activation */
const PAGE = 16;

const inHand = (n: number) => `${signed(n)} ${Math.abs(n) === 1 ? 'card' : 'cards'}`;

/* Cards the next n activations draw with `burden` counters already on the Ring: one more each time */
export const drawnBy = (burden: number, n: number) => n * burden + (n * (n + 1)) / 2;

/* The fewest activations that draw `library` cards */
export const activationsFor = (burden: number, library: number) =>
  lowestPassing((n) => drawnBy(burden, n) >= library, 0, Math.max(1, library));

/* Cards in hand for the first `steps` steps, counted from where you start: up as the Ring draws, down
   as each untap discards, until the library runs out. */
export function stepByStep(
  burden: number,
  library: number,
  discards: number,
  holder = 'The One Ring',
  steps = 1 + PAGE,
): Dot[] {
  const { dots, add } = stepDots();
  let hand = 0;
  let left = library;
  add(hand, 'To start');
  for (let k = burden + 1; left > 0 && dots.length < steps; k++) {
    const draw = Math.min(k, left);
    left -= draw;
    hand += draw;
    add(hand, `Tap ${holder} with ${plural(k, 'burden counter')}, draw ${formatNumber(draw)}: ${inHand(hand)}`);
    if (left > 0) {
      hand -= discards;
      add(hand, `Discard ${formatNumber(discards)} to untap it: ${inHand(hand)}`);
    }
  }
  return dots.slice(0, steps);
}

export const theOneRing = defineWidget('the-one-ring', {
  detect(variant) {
    const untap = has(variant, 'The One Ring') ? UNTAPS.find(({ cards }) => has(variant, ...cards)) : undefined;
    const holder = findInSteps(variant, /^Activate (.+?) using The One Ring's ability/i)?.[1] ?? 'The One Ring';
    return (
      untap && {
        discards: untap.discards,
        how: untap.how,
        holder,
        burden: says(variant, new RegExp(`${holder} has a burden counter`, 'i')) ? 1 : 0,
      }
    );
  },
  calculator({ discards, how, holder, burden }) {
    const counters = numberInput('burden', `Burden counters on ${holder}`, burden);
    /* only The One Ring itself makes you lose life for its burden counters */
    const ring = holder === 'The One Ring';
    return {
      category: 'finite',
      title: 'How many activations to draw your library?',
      summary: `${ring ? 'The One Ring puts a burden counter on itself' : `${holder} uses The One Ring's ability to put a burden counter on itself`} and draws a card for each one, one more every time, and ${how} untaps it.${ring ? ' The burden counters stay, and at your upkeep you lose 1 life for each.' : ''}`,
      inputs: [counters, LIBRARY],
      compute(values) {
        const now = values.numbers.burden;
        const { library } = values.numbers;
        const n = activationsFor(now, library);
        return {
          headline: { label: 'Activations to draw your library', value: formatNumber(n) },
          stats: [
            {
              label: 'Burden counters by then',
              value: formatNumber(now + n),
              ...(ring && { caption: 'the life you lose each upkeep' }),
            },
            { label: 'Cards discarded', value: formatNumber(discards * Math.max(0, n - 1)) },
          ],
          charts: [
            {
              title: 'Cards in hand, step by step',
              xLabel: 'Step',
              ...stepPage((steps) => stepByStep(now, library, discards, holder, steps), values.page ?? 0, PAGE),
            },
          ],
        };
      },
    };
  },
});
