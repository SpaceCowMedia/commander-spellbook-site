import { expect, test } from 'vitest';
import {
  lifeAfter,
  lifeLost,
  lostMineRuns,
  radiantSolarDungeons,
  tripBackToStart,
} from 'lib/combo/widgets/radiantSolarDungeons';
import { calculatorFor, detects, expectSaneAtExtremes, expectSteadyFrom, run, specFor } from './testing/widgetTesting';

const calculator = () => calculatorFor(radiantSolarDungeons, '670-1734-4432-4605-8194');

const TOMB = ['Trapped Entry', 'Veils of Fear', 'Sandfall Cell'];
const LOST_MINE = ['Cave Entrance', 'Mine Tunnels', 'Dark Pool', 'Temple of Dumathoin'];

/* The combo played trigger by trigger: the Radiant Solars you control, the ventures waiting on the stack
   and the rooms they take you through. Every trip spends the ventures it can spare on runs through the
   Lost Mine of Phandelver before heading back to the Sandfall Cell. */
function playTrips(count: number, startingLife: number, startingHand: number) {
  let life = startingLife;
  let hand = startingHand;
  let illusions = 0;
  let originalIsYours = false;
  let waiting = 0;
  let room: string | undefined;
  const solars = () => illusions + (originalIsYours ? 1 : 0);
  const enter = (name: string) => {
    expect(waiting, `ventures left for ${name}`).toBeGreaterThan(0);
    waiting--;
    room = name;
    if (name === 'Trapped Entry') {
      life -= 1;
    } else if (name === 'Veils of Fear') {
      if (hand > 0) {
        hand--;
      } else {
        life -= 2;
      }
    } else if (name === 'Dark Pool') {
      life += 1;
    } else if (name === 'Temple of Dumathoin') {
      hand++;
    }
  };
  const trips: { runs: number; life: number }[] = [];
  for (let trip = 1; trip <= count; trip++) {
    if (trip === 1) {
      /* Dack Fayden puts all three onto the battlefield under your control before handing them out */
      waiting += 3;
      /* the banisher's Illusion brings Preston back under your control, with no Radiant Solar of yours */
      waiting += solars();
    } else {
      /* the banisher comes back from the Sandfall Cell */
      waiting += solars();
      /* and exiles the original Radiant Solar, which its Illusion brings back under your control */
      originalIsYours = true;
      waiting += solars();
    }
    /* Preston makes an Illusion of Radiant Solar, which ventures for itself */
    illusions++;
    waiting += 1;
    if (room === 'Sandfall Cell') {
      enter('Cradle of the Death God');
    }
    let runs = 0;
    while (waiting >= LOST_MINE.length + TOMB.length) {
      LOST_MINE.forEach(enter);
      runs++;
    }
    TOMB.forEach(enter);
    trips.push({ runs, life });
  }
  return trips;
}

test('recognizes the Dack Fayden combos, whichever creature exiles Preston and puts them on top', () => {
  expect(specFor(radiantSolarDungeons, '670-1734-4432-4605-8194')).toEqual({
    widget: 'radiant-solar-dungeons',
    banisher: 'Fiend Hunter',
  });
  expect(specFor(radiantSolarDungeons, '670-1271-3991-4605-8194').banisher).toBe('Faceless Butcher');
  expect(specFor(radiantSolarDungeons, '670-1683-4142-4605-8194').banisher).toBe('Hostage Taker');
  expect(specFor(radiantSolarDungeons, '670-1734-2235-4605-8194').banisher).toBe('Fiend Hunter');
  expect(
    detects(radiantSolarDungeons, {
      uses: ['Preston, the Vanisher', 'Radiant Solar', 'Fiend Hunter'],
      description:
        'Choose Preston as the target for Fiend Hunter.\nProgress to the Sandfall Cell.\nAlternate with the Lost Mine of Phandelver.',
    }),
  ).toBe(false);
});

test('asks for your life and the cards you can discard', () => {
  expect(calculator().inputs.map(({ key, label, initial }) => [key, label, initial])).toEqual([
    ['life', 'Your life total', 40],
    ['hand', 'Cards in hand you can discard', 2],
  ]);
  expect(calculator().summary).toContain('until Fiend Hunter brings it back');
});

test('the first two trips take 1 life each, and a card or 2 more life', () => {
  expect(run(calculator())).toEqual({
    headline: { label: 'Life you lose to get going', value: '2', caption: 'and 2 cards from your hand' },
    verdict: { tone: 'good', title: 'You can go off', detail: 'Your life bottoms out at 38.' },
    meter: { have: 40, need: 3, unit: 'life' },
    stats: [{ label: 'Back to your starting life', value: 'Trip 6' }],
    charts: expect.any(Array),
  });
  const headline = (hand: number) => run(calculator(), { numbers: { hand } }).headline;
  expect(headline(1)).toEqual({
    label: 'Life you lose to get going',
    value: '4',
    caption: 'and 1 card from your hand',
  });
  expect(headline(0)).toEqual({ label: 'Life you lose to get going', value: '6', caption: 'with no card to discard' });
  expect(run(calculator(), { numbers: { hand: 0 } }).stats).toEqual([
    { label: 'Back to your starting life', value: 'Trip 8' },
  ]);
  expectSaneAtExtremes(calculator());
});

test('you have to end the unpaid trips at 1 life or more', () => {
  const result = (numbers: Record<string, number>) => run(calculator(), { numbers });
  expect(result({ life: 3, hand: 2 }).verdict).toEqual({
    tone: 'good',
    title: 'You can go off',
    detail: 'Your life bottoms out at 1.',
  });
  expect(result({ life: 2, hand: 2 })).toMatchObject({
    verdict: { tone: 'bad', title: 'You need 1 more life' },
    meter: { have: 2, need: 3, unit: 'life' },
    stats: [],
  });
  expect(result({ life: 3, hand: 0 }).verdict).toEqual({
    tone: 'bad',
    title: 'You need 4 more life',
    detail: 'Each card you can discard saves 2 life, up to two.',
  });
});

test('charts the life you lose by cards in hand, the same from two on', () => {
  const chart = run(calculator(), { numbers: { life: 5, hand: 1 } }).charts![0];
  expect(chart).toMatchObject({ title: 'Life you lose by cards in hand', selects: 'hand', steadyFrom: 2 });
  expect(chart.dots).toEqual([
    { x: 0, y: 6, label: '0 cards: 6 life', tone: 'bad' },
    { x: 1, y: 4, label: '1 card: 4 life', tone: 'good' },
    { x: 2, y: 2, label: '2 or more cards: 2 life', tone: 'good' },
  ]);
  expectSteadyFrom(calculator(), 'hand', 2);
});

test('charts your life trip by trip, down for two trips and back up once the Lost Mine pays', () => {
  const chart = run(calculator()).charts![1];
  expect(chart).toMatchObject({ title: 'Your life, trip by trip', xLabel: 'Trips to the Sandfall Cell' });
  expect(chart.dots.map((dot) => dot.y)).toEqual([40, 39, 38, 38, 38, 39, 40, 42, 44, 47, 50, 54, 58]);
  expect(chart.dots.slice(0, 4).map((dot) => dot.label)).toEqual([
    'To start: 40 life',
    'Trip 1: 39 life',
    'Trip 2: 38 life',
    'Trip 3: 38 life after 1 run through the Lost Mine',
  ]);
  expect(chart.dots[5].label).toBe('Trip 5: 39 life after 2 runs through the Lost Mine');
  expect(run(calculator(), { numbers: { life: 5, hand: 0 } }).charts![1].dots).toEqual([
    { x: 0, y: 5, label: 'To start: 5 life' },
    { x: 1, y: 2, label: 'Trip 1: 2 life' },
    { x: 2, y: -1, label: 'Trip 2: -1 life', tone: 'bad' },
  ]);
});

test('the trips work out as the combo played trigger by trigger', () => {
  for (const hand of [0, 1, 2, 3, 7]) {
    const trips = playTrips(60, 40, hand);
    trips.forEach(({ runs, life }, i) => {
      expect(lostMineRuns(i + 1), `runs on trip ${i + 1}`).toBe(runs);
      expect(lifeAfter(i + 1, 40, hand), `life after trip ${i + 1} with ${hand} cards`).toBe(life);
    });
    expect(lifeAfter(0, 40, hand)).toBe(40);
    const lives = trips.map((trip) => trip.life);
    expect(lifeLost(hand), `life lost with ${hand} cards`).toBe(40 - Math.min(...lives));
    expect(tripBackToStart(hand), `back to 40 with ${hand} cards`).toBe(lives.findIndex((life) => life >= 40) + 1);
  }
});
