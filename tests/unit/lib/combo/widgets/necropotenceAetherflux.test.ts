import { expect, test } from 'vitest';
import { necropotenceAetherflux } from 'lib/combo/widgets/necropotenceAetherflux';
import { calculatorFor, detects, expectSaneAtExtremes, expectSteadyFrom, run } from './testing/widgetTesting';

test('names the card that plays from the top of the library, and when it does', () => {
  expect(calculatorFor(necropotenceAetherflux, '3591-4740-6900').summary).toMatch(
    /^Once Gwenom has attacked, it lets you play the top card of your library/,
  );
  expect(calculatorFor(necropotenceAetherflux, '2173-3591-4740').summary).toMatch(
    /^Bolas's Citadel lets you play the top card of your library/,
  );
  expect(detects(necropotenceAetherflux, { uses: ['Gwenom, Remorseless', 'Aetherflux Reservoir'] })).toBe(false);
});

test('gives the life left at the end of the library, and what it fires', () => {
  const calculator = calculatorFor(necropotenceAetherflux, '3591-4740-6900');
  /* 20 life, 38 spells: + 741 from the storm, - 114 in mana values, - 22 lands */
  const result = run(calculator);
  expect(result.headline).toEqual({
    label: 'Life at the end of your library',
    value: '625',
    caption: 'on average, if you live through it',
  });
  expect(result.verdict).toEqual({
    tone: 'neutral',
    title: 'Enough to fire Aetherflux Reservoir 12 times',
    detail: 'That leaves you at 25 life.',
  });
  expect(result.stats).toEqual([
    { label: 'Chance you run out of life on the way', value: expect.stringMatching(/%$/) },
  ]);
  /* 10 spells: 20 + 55 - 30 - 5 */
  expect(run(calculator, { numbers: { library: 15, lands: 5 } }).headline.value).toBe('40');
  expect(run(calculator, { numbers: { library: 15, lands: 5 } }).verdict).toEqual({
    tone: 'neutral',
    title: 'Not enough to fire Aetherflux Reservoir',
    detail: 'It takes 51 life.',
  });
  expect(run(calculator, { numbers: { library: 30, lands: 30 } }).verdict).toEqual({
    tone: 'bad',
    title: 'You run out of life before the end of your library',
  });
});

test('adds the lands played with land drops back to the life', () => {
  const calculator = calculatorFor(necropotenceAetherflux, '3591-4740-6900');
  expect(run(calculator, { numbers: { landDrops: 2 } }).headline.value).toBe('627');
  const chance = (landDrops: number) => run(calculator, { numbers: { life: 6, landDrops } }).stats![0].value;
  expect(Number.parseFloat(chance(1))).toBeLessThan(Number.parseFloat(chance(0)));
});

test('charts the life by lands, up to the whole library, and the chance of dying by life', () => {
  const calculator = calculatorFor(necropotenceAetherflux, '3591-4740-6900');
  const [byLands, byLife] = run(calculator, { numbers: { life: 8 } }).charts!;
  expect(byLands).toMatchObject({
    title: 'Life at the end by lands in your library',
    selects: 'lands',
    steadyFrom: 60,
  });
  expect(byLands.dots.map((dot) => dot.x)).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
  expect(byLands.dots.find((dot) => dot.x === 22)).toMatchObject({ y: 613, label: '22 lands: 613 life' });
  expect(byLife).toMatchObject({ title: 'Chance you run out of life by your life total', selects: 'life' });
  expect(byLife.dots[0].label).toMatch(/^1 life: /);
  expect(byLife.dots[0].y).toBeGreaterThan(byLife.dots[9].y);
  expectSteadyFrom(calculator, 'lands', 60, { numbers: { life: 100 } });
});

test('takes an average mana value with a decimal', () => {
  const calculator = calculatorFor(necropotenceAetherflux, '3591-4740-6900');
  expect(calculator.inputs.find((input) => input.key === 'manaValue')).toMatchObject({ step: 0.1 });
  expect(run(calculator, { numbers: { manaValue: 3.1 } }).headline.value).toBe('621');
});

test('stays sane at the extremes', () => {
  expectSaneAtExtremes(calculatorFor(necropotenceAetherflux, '3591-4740-6900'));
});
