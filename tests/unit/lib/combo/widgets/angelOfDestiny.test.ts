import { expect, test } from 'vitest';
import { endStep, lifeGained } from 'lib/combo/widgets/angelOfDestiny';

test('every Angel you control triggers on both hits of every Angel that connects', () => {
  expect(lifeGained(1, 1)).toBe(4);
  expect(lifeGained(3, 3)).toBe(36);
  expect(lifeGained(4, 3)).toBe(48);
});

test('gains nothing when no Angel connects', () => {
  expect(lifeGained(4, 0)).toBe(0);
  expect(lifeGained(4, -2)).toBe(0);
});

test('extra power on one attacker counts on both of its hits, for every Angel', () => {
  expect(lifeGained(1, 1, 1)).toBe(6);
  expect(lifeGained(4, 4, 1)).toBe(72);
});

test('the attacked opponents die once you end 15 life above your starting total', () => {
  expect(endStep(40, 40, 14).verdict).toEqual({
    tone: 'bad',
    title: 'No attacked opponent dies',
    detail: '1 life short.',
  });
  expect(endStep(40, 40, 15).verdict).toEqual({
    tone: 'good',
    title: 'Each attacked opponent dies',
    detail: 'Exactly enough life.',
  });
  expect(endStep(20, 40, 15)).toEqual({
    headline: { label: 'Life at your end step', value: '55', caption: '35 needed' },
    verdict: { tone: 'good', title: 'Each attacked opponent dies', detail: '20 life to spare.' },
    meter: { have: 55, need: 35, unit: 'life' },
    stats: [{ label: 'Life you gain', value: '15' }],
  });
});
