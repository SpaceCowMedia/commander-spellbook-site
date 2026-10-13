import { expect, test } from 'vitest';
import { lifeGained } from 'lib/combo/widgets/angelOfDestiny';
import { angelOfDestinyCopies, angelsNeeded } from 'lib/combo/widgets/angelOfDestinyCopies';
import { fixtureVariant } from './testing/fakeVariant';
import { calculatorFor, detects, expectSaneAtExtremes, run, specFor } from './testing/widgetTesting';

const copies = () => calculatorFor(angelOfDestinyCopies, '2790-2990');
const withCounter = () => calculatorFor(angelOfDestinyCopies, '2790-6558');

test('recognizes the creatures turned into Angel of Destiny, and the counter put on the original', () => {
  expect(specFor(angelOfDestinyCopies, '2790-2990')).toEqual({ widget: 'angel-of-destiny-copies', counters: 0 });
  expect(specFor(angelOfDestinyCopies, '2790-6558')).toEqual({ widget: 'angel-of-destiny-copies', counters: 1 });
  expect(angelOfDestinyCopies.detect(fixtureVariant('2790-4836-5361'))).toBeUndefined();
  expect(
    detects(angelOfDestinyCopies, {
      uses: ['Mirrorweave'],
      description: 'Each Angel of Destiny you control triggers for each creature that dealt damage.',
    }),
  ).toBe(false);
});

test('asks for your life totals, the Angels you control and the ones that stay back', () => {
  expect(copies().inputs.map(({ key, label, initial }) => [key, label, initial])).toEqual([
    ['start', 'Your starting life total', 40],
    ['life', 'Your current life total', 40],
    ['angels', 'Angels of Destiny you control', 4],
    ['idle', "Angels that are blocked or can't attack", 0],
  ]);
});

test('gains 4 life for each Angel you control, times the Angels that connect', () => {
  expect(run(copies())).toEqual({
    headline: { label: 'Life at your end step', value: '104', caption: '55 needed' },
    verdict: { tone: 'good', title: 'Each attacked opponent dies', detail: '49 life to spare.' },
    meter: { have: 104, need: 55, unit: 'life' },
    stats: [
      { label: 'Life you gain', value: '64' },
      { label: 'Angels needed', value: '2', caption: 'at your life total, if they all connect' },
    ],
  });
  expect(run(copies(), { numbers: { angels: 1_000_000_000 } }).stats?.[0].value).toBe('4.00 × 10¹⁸');
  expectSaneAtExtremes(copies());
});

test('Angels that stay back still trigger for the ones that connect', () => {
  const gained = (numbers: Record<string, number>) => run(copies(), { numbers }).stats?.[0].value;
  expect(gained({ idle: 1 })).toBe('48');
  expect(gained({ idle: 4 })).toBe('0');
  expect(gained({ idle: 9 })).toBe('0');
});

test('a +1/+1 counter on the original adds 2 life for each Angel you control', () => {
  expect(withCounter().summary).toContain('Each +1/+1 counter on the original adds 2 more');
  expect(copies().summary).not.toContain('counter');
  expect(run(withCounter()).stats?.[0]).toEqual({ label: 'Life you gain', value: '72' });
  expectSaneAtExtremes(withCounter());
});

test('the attacked opponents die once you end 15 life above your starting total', () => {
  const verdict = (numbers: Record<string, number>) => run(copies(), { numbers }).verdict;
  expect(verdict({ angels: 1, life: 50 })).toEqual({
    tone: 'bad',
    title: 'No attacked opponent dies',
    detail: '1 life short.',
  });
  expect(verdict({ angels: 1, life: 51 })?.detail).toBe('Exactly enough life.');
  expect(verdict({ life: 1, idle: 4 })?.detail).toBe('54 life short.');
});

test('the Angels needed are the fewest that gain the life you are missing', () => {
  const needed = (numbers: Record<string, number>) => run(copies(), { numbers }).stats?.[1].value;
  expect(needed({ life: 39 })).toBe('2');
  expect(needed({ life: 38 })).toBe('3');
  expect(needed({ life: 55 })).toBe('1');
  expect(needed({ start: 1_000_000_000, life: 1 })).toBe('15,812');
  for (const extraPower of [0, 1, 2, 5]) {
    for (let life = -5; life <= 600; life++) {
      let fewest = 1;
      while (lifeGained(fewest, fewest, extraPower) < life) {
        fewest++;
      }
      expect(angelsNeeded(life, extraPower), `${life} life with ${extraPower} extra power`).toBe(fewest);
    }
  }
});
