import { expect, test } from 'vitest';
import { angelOfDestinyCombats } from 'lib/combo/widgets/angelOfDestinyCombats';
import { angelOfDestinyMyriad } from 'lib/combo/widgets/angelOfDestinyMyriad';
import { calculatorFor, expectSaneAtExtremes, run } from './testing/widgetTesting';

const myriad = () => calculatorFor(angelOfDestinyMyriad, '2790-4836-5361');
const combats = () => calculatorFor(angelOfDestinyCombats, '2481-2790');

test('asks for your starting life, your current life and the opponents', () => {
  expect(myriad().inputs.map(({ key, label, initial }) => [key, label, initial])).toEqual([
    ['start', 'Your starting life total', 40],
    ['life', 'Your current life total', 40],
    ['opponents', 'Opponents', 3],
  ]);
  expect(combats().inputs.map((input) => input.key)).toEqual(['start', 'life', 'combats']);
});

test('myriad gains 4 life per Angel per hit: 4 × opponents²', () => {
  expect(run(myriad())).toEqual({
    headline: { label: 'Life at your end step', value: '76', caption: '55 needed' },
    verdict: { tone: 'good', title: 'Each attacked opponent dies', detail: '21 life to spare.' },
    meter: { have: 76, need: 55, unit: 'life' },
    stats: [{ label: 'Life you gain', value: '36' }],
  });
  expectSaneAtExtremes(myriad());
});

test('each combat gains 4 life', () => {
  expect(run(combats())).toEqual({
    headline: { label: 'Life at your end step', value: '52', caption: '55 needed' },
    verdict: { tone: 'bad', title: 'No attacked opponent dies', detail: '3 life short.' },
    meter: { have: 52, need: 55, unit: 'life' },
    stats: [{ label: 'Life you gain', value: '12' }],
  });
  expectSaneAtExtremes(combats());
});

test('the attacked opponents die once you end 15 life above your starting total', () => {
  const verdict = (numbers: Record<string, number>) => run(myriad(), { numbers }).verdict;
  expect(verdict({ life: 18 })).toEqual({ tone: 'bad', title: 'No attacked opponent dies', detail: '1 life short.' });
  expect(verdict({ life: 19 })).toEqual({
    tone: 'good',
    title: 'Each attacked opponent dies',
    detail: 'Exactly enough life.',
  });
  expect(verdict({ start: 20, life: 19 })?.detail).toBe('20 life to spare.');
  expect(verdict({ opponents: 1 })?.detail).toBe('11 life short.');
});
