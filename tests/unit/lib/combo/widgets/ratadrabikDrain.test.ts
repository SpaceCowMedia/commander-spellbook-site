import { expect, test } from 'vitest';
import { Chain, Order, kills, ratadrabikDrain } from 'lib/combo/widgets/ratadrabikDrain';
import { calculatorFor, detects, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

const KAMBAL = '2523-5468-8252--219';
const AYARA = '884-2523-6787--219';

/* The chain played out one trigger at a time, counting the creatures on the battlefield */
function playedOut({ tokens, eachCreature, order }: Chain) {
  let drain = eachCreature ? tokens : 1;
  let payoffs = 1;
  let zombies = 0;
  let legendary = true;
  const afterEach: number[] = [];
  const zombiesEnter = (count: number) => {
    for (let zombie = 0; zombie < count; zombie++) {
      zombies++;
      drain += payoffs;
    }
  };
  const killRatadrabik = () => {
    legendary = false;
    zombiesEnter(zombies);
    afterEach.push(drain);
  };
  const killPayoff = () => {
    const ratadrabiks = zombies + (legendary ? 1 : 0);
    payoffs--;
    for (let copy = 0; copy < ratadrabiks; copy++) {
      payoffs++;
      drain += payoffs;
    }
    afterEach.push(drain);
  };
  /* the Ratadrabik kept sees every copy die, and each copy sees the other copies die */
  zombiesEnter(tokens + tokens * (tokens - 1));
  if (order === 'ratadrabikThenPayoff') {
    killRatadrabik();
    killPayoff();
  } else {
    killPayoff();
    if (order === 'payoffThenRatadrabik') {
      killRatadrabik();
    }
  }
  return { drained: afterEach, zombies: zombies + payoffs };
}

test('recognizes every variant of the Kambal and Ayara groups, naming their cards', () => {
  for (const id of ['2523-5468-6787--219', KAMBAL, AYARA, '884-2523-8252--219'] as const) {
    expect(calculatorFor(ratadrabikDrain, id).title).toBe('How much life does each opponent lose?');
  }
  expect(calculatorFor(ratadrabikDrain, KAMBAL).summary).toMatch(
    /^Mirrormind Crown turns the tokens you create at once into copies of Ratadrabik.* Kambal drains 1 as the copies enter together/,
  );
  expect(calculatorFor(ratadrabikDrain, AYARA).summary).toMatch(/^Moonlit Meditation .* Ayara drains 1 for each copy/);
  expect(calculatorFor(ratadrabikDrain, AYARA).summary).toMatch(
    /Ayara can sacrifice it herself if she can tap; killed after/,
  );
  expect(detects(ratadrabikDrain, { uses: ['Ratadrabik of Urborg', 'Kambal, Profiteering Mayor'] })).toBe(false);
});

test('adds up the drains just as playing the chain out one trigger at a time does', () => {
  const orders: Order[] = ['payoff', 'payoffThenRatadrabik', 'ratadrabikThenPayoff'];
  for (let tokens = 2; tokens <= 12; tokens++) {
    for (const eachCreature of [false, true]) {
      for (const order of orders) {
        expect(kills({ tokens, eachCreature, order })).toEqual(playedOut({ tokens, eachCreature, order }));
      }
    }
  }
});

test('gives the life each opponent loses', () => {
  const kambal = calculatorFor(ratadrabikDrain, KAMBAL);
  /* 1 for the copies, 9 Zombies, then 1 + 2 + … + 10 */
  const result = run(kambal);
  expect(result.headline).toEqual({ label: 'Life each opponent loses', value: '65', caption: 'you gain as much' });
  expect(result.verdict).toBeUndefined();
  expect(result.stats).toEqual([{ label: '2/2 Zombie tokens left', value: '19' }]);
  expect(run(kambal, { numbers: { tokens: 2 } }).headline.value).toBe('20');
  expect(run(kambal, { numbers: { tokens: 4 } }).headline.value).toBe('170');
  const ayara = calculatorFor(ratadrabikDrain, AYARA);
  expect(run(ayara).headline.value).toBe('67');
  expect(run(ayara, { numbers: { tokens: 4 } }).headline.value).toBe('173');
});

test('shows what the first of two kills locks in, and what both drain', () => {
  const kambal = calculatorFor(ratadrabikDrain, KAMBAL);
  expect(kambal.inputs[1]).toMatchObject({
    key: 'order',
    label: 'Kill order',
    options: [
      { value: 'payoff', label: 'Only Kambal' },
      { value: 'payoffThenRatadrabik', label: 'Kambal, then Ratadrabik' },
      { value: 'ratadrabikThenPayoff', label: 'Ratadrabik, then Kambal' },
    ],
    initial: 'payoff',
  });
  /* 65, then each of the 9 new Zombies drains once for each of the 10 copies of Kambal */
  const kambalFirst = run(kambal, { choices: { order: 'payoffThenRatadrabik' } });
  expect(kambalFirst.headline.value).toBe('155');
  expect(kambalFirst.stats).toEqual([
    { label: 'After the first kill', value: '65', caption: 'if Ratadrabik survives' },
    { label: '2/2 Zombie tokens left', value: '28' },
  ]);
  /* 1 + 18 Zombies, then 1 + 2 + … + 18 */
  const ratadrabikFirst = run(kambal, { choices: { order: 'ratadrabikThenPayoff' } });
  expect(ratadrabikFirst.headline.value).toBe('190');
  expect(ratadrabikFirst.stats).toEqual([
    { label: 'After the first kill', value: '19', caption: 'if Kambal survives' },
    { label: '2/2 Zombie tokens left', value: '36' },
  ]);
  const ayara = run(calculatorFor(ratadrabikDrain, AYARA), { choices: { order: 'ratadrabikThenPayoff' } });
  expect(ayara.headline.value).toBe('192');
  expect(ayara.stats![0]).toEqual({ label: 'After the first kill', value: '21', caption: 'if Ayara survives' });
});

test('charts the drain by tokens created at once', () => {
  const kambal = calculatorFor(ratadrabikDrain, KAMBAL);
  const charts = run(kambal).charts!;
  expect(charts).toHaveLength(1);
  expect(charts[0]).toMatchObject({ title: 'Life drained by tokens created at once', selects: 'tokens' });
  expect(charts[0].dots.map((dot) => dot.x)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(charts[0].dots[1]).toMatchObject({ y: 65, label: '3 tokens: 65 life' });
  expectSteadyFrom(kambal, 'tokens', undefined);
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(ratadrabikDrain, KAMBAL));
  expectSaneAtExtremes(calculatorFor(ratadrabikDrain, AYARA));
});
