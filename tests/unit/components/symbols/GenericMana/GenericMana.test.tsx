import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import GenericMana from 'components/symbols/GenericMana/GenericMana';

function drawn(amount: number) {
  const { unmount } = render(<GenericMana amount={amount} />);
  const text = screen.getByRole('img').querySelector('text')!;
  const lines = text.getAttribute('y')!.split(' ').map(Number);
  const fontSize = Number(text.getAttribute('font-size'));
  const characters = [...text.textContent!];
  unmount();
  return { lines, fontSize, characters };
}

test('stands the figures where Scryfall stands its own', () => {
  const circle = drawn(77);
  const pill = drawn(123);
  expect(new Set(circle.lines).size).toBe(1);
  expect(circle.lines[0]).toBeGreaterThan(78);
  expect(circle.lines[0]).toBeLessThan(79);
  expect(new Set(pill.lines).size).toBe(1);
  expect(pill.lines[0]).toBeGreaterThan(86);
  expect(pill.lines[0]).toBeLessThan(87);
});

test('lifts the commas so their tails stay inside the pill', () => {
  const { lines, fontSize, characters } = drawn(1_234_567);
  const figures = lines.filter((_, i) => characters[i] !== ',');
  const commas = lines.filter((_, i) => characters[i] === ',');
  expect(commas).toHaveLength(2);
  expect(new Set(figures).size).toBe(1);
  commas.forEach((line) => {
    expect(line).toBeLessThan(figures[0]);
    /* a comma's tail hangs about 0.14em below its line */
    expect(line + 0.14 * fontSize).toBeLessThan(95);
  });
});

test('draws figures as tall as the nearest symbol of Scryfall', () => {
  expect(drawn(123).fontSize).toBeLessThan(drawn(1_234).fontSize);
  expect(drawn(1_234).fontSize).toBe(drawn(1_234_567).fontSize);
});
