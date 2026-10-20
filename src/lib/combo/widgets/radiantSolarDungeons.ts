import type { Dot } from './shared/calculator';
import { formatSwept, sweptDots } from './shared/charts';
import { formatNumber, plural } from './shared/format';
import { LIFE, numberInput } from './shared/inputs';
import { moreLife } from './shared/outcomes';
import { defineWidget } from './shared/widget';
import { findInSteps, has, says } from './parse/variant';

/* The trips to the Sandfall Cell that no run through the Lost Mine of Phandelver pays for. Each costs 1
   life to Trapped Entry, and a card or 2 more life to Veils of Fear. */
const UNPAID_TRIPS = 2;
/* the trips the chart of your life shows: a few past the one where it is back where it started */
const TRIPS = 12;
const LOWEST = [{ y: 1, label: 'Lowest you can go', tone: 'bad' as const }];

const HAND = numberInput('hand', 'Cards in hand you can discard', 2, {
  hint: 'Once Dack Fayden is cast. Veils of Fear takes one instead of 2 life.',
});

/* The runs through the Lost Mine of Phandelver the kth trip to the Sandfall Cell affords before going
   back into the Tomb of Annihilation. Getting back to the Sandfall Cell takes 4 ventures, Cradle of the
   Death God included, and a run 4 more. Dack Fayden hands the original Radiant Solar to an opponent, so
   the first trip makes 4: 3 as the creatures enter and the first Illusion's own, 1 more than reaching
   the Sandfall Cell for the first time takes. The second makes 4 too: the first Illusion's as the
   banisher and then the original come back, the original's own and the new Illusion's. From then on the
   kth makes 2k + 1: every Radiant Solar ventures as the banisher comes back and again as the original
   does, and the new Illusion once. Ventures to spare wait on the stack for the next trip, so the kth
   affords ⌊(k − 1) / 2⌋ runs. */
export function lostMineRuns(trip: number): number {
  return Math.floor((trip - 1) / 2);
}

/* Your life after `trips` trips, from `life` with `hand` cards you can discard. Trapped Entry takes 1
   each trip and Dark Pool gives 1 back each run, ⌊(trips − 1)² / 4⌋ of them by then. Temple of Dumathoin
   draws a card each run too, so only the unpaid trips can leave Veils of Fear nothing to take but life. */
export function lifeAfter(trips: number, life: number, hand: number): number {
  const paidInLife = Math.max(0, Math.min(trips, UNPAID_TRIPS) - hand);
  return life - trips + Math.floor((trips - 1) ** 2 / 4) - 2 * paidInLife;
}

/* What the unpaid trips cost, which is as low as your life goes: every trip after them gives back at
   least what it takes. */
export function lifeLost(hand: number): number {
  return UNPAID_TRIPS + 2 * Math.max(0, UNPAID_TRIPS - hand);
}

/* The first trip after which your life is back where it started */
export function tripBackToStart(hand: number): number {
  let trip = 1;
  while (lifeAfter(trip, 0, hand) < 0) {
    trip++;
  }
  return trip;
}

/* Your life after each trip, ending at the first one you don't survive */
function lifeDots(life: number, hand: number): Dot[] {
  const dots: Dot[] = [];
  for (let trip = 0; trip <= TRIPS && (trip === 0 || dots[trip - 1].y >= 1); trip++) {
    const left = lifeAfter(trip, life, hand);
    const runs = lostMineRuns(trip);
    dots.push({
      x: trip,
      y: left,
      label:
        trip === 0
          ? `To start: ${formatNumber(left)} life`
          : `Trip ${formatNumber(trip)}: ${formatNumber(left)} life${runs > 0 ? ` after ${plural(runs, 'run')} through the Lost Mine` : ''}`,
      ...(left < 1 && { tone: 'bad' as const }),
    });
  }
  return dots;
}

/* Dack Fayden puts Radiant Solar, Preston and a creature that exiles another until it leaves onto the
   battlefield, then hands them to the opponents, and every trip to the Sandfall Cell makes one more
   Illusion of Radiant Solar. */
export const radiantSolarDungeons = defineWidget('radiant-solar-dungeons', {
  detect(variant) {
    const banisher = findInSteps(variant, /\bchoose Preston as the target for ([^.]+?)\./i);
    return (
      banisher &&
      has(variant, 'Dack Fayden, Helping Hand', 'Preston, the Vanisher', 'Radiant Solar') &&
      says(variant, /\bSandfall Cell\b/i) &&
      says(variant, /\bLost Mine of Phandelver\b/i) && { banisher: banisher[1] }
    );
  },
  calculator: ({ banisher }) => ({
    category: 'drain',
    title: 'How much life does the loop cost before it pays for itself?',
    summary: `Dack Fayden hands the original Radiant Solar to an opponent until ${banisher} brings it back, so the first two trips to the Sandfall Cell can't spare the 4 ventures a run through the Lost Mine of Phandelver takes, and you pay for them: 1 life to Trapped Entry each time, and a card from your hand or 2 more life to Veils of Fear. Every trip makes one more Illusion of Radiant Solar, so from the third on the ventures to spare pay for runs, where Dark Pool gives the life back and Temple of Dumathoin draws the card.`,
    inputs: [LIFE, HAND],
    compute(values) {
      const { life, hand } = values.numbers;
      const discarded = Math.min(hand, UNPAID_TRIPS);
      const lost = lifeLost(hand);
      const lowest = life - lost;
      return {
        headline: {
          label: 'Life you lose to get going',
          value: formatNumber(lost),
          caption: discarded > 0 ? `and ${plural(discarded, 'card')} from your hand` : 'with no card to discard',
        },
        verdict:
          lowest >= 1
            ? { tone: 'good', title: 'You can go off', detail: `Your life bottoms out at ${formatNumber(lowest)}.` }
            : moreLife(
                1 - lowest,
                discarded < UNPAID_TRIPS ? 'Each card you can discard saves 2 life, up to two.' : undefined,
              ),
        meter: { have: life, need: lost + 1, unit: 'life' },
        stats:
          lowest >= 1
            ? [{ label: 'Back to your starting life', value: `Trip ${formatNumber(tripBackToStart(hand))}` }]
            : [],
        charts: [
          {
            title: 'Life you lose by cards in hand',
            xLabel: HAND.label,
            selects: HAND.key,
            steadyFrom: UNPAID_TRIPS,
            ...sweptDots(
              HAND,
              hand,
              (cards) => {
                const at = lifeLost(cards);
                return {
                  y: at,
                  label: `${formatSwept(cards, UNPAID_TRIPS)} ${cards === 1 ? 'card' : 'cards'}: ${formatNumber(at)} life`,
                  tone: life > at ? 'good' : 'bad',
                };
              },
              UNPAID_TRIPS,
            ),
          },
          {
            title: 'Your life, trip by trip',
            xLabel: 'Trips to the Sandfall Cell',
            marks: LOWEST,
            dots: lifeDots(life, hand),
          },
        ],
      };
    },
  }),
});
