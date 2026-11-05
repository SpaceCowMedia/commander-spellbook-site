import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import TextWithMagicSymbol from 'components/symbols/TextWithMagicSymbol/TextWithMagicSymbol';

const names = () =>
  screen.getAllByRole('img').map((symbol) => symbol.getAttribute('alt') ?? symbol.getAttribute('aria-label'));

test('draws generic amounts without a symbol of their own', () => {
  const { container } = render(<TextWithMagicSymbol text="Pay {23}{23}{R}, then {1,234}." />);
  expect(names()).toEqual(['23 generic mana', '23 generic mana', 'one red mana', '1,234 generic mana']);
  expect(container).toHaveTextContent('Pay 2323, then 1,234.');
});

test('keeps the official symbols where they exist', () => {
  render(<TextWithMagicSymbol text="{20} and {100}" />);
  expect(names()).toEqual(['twenty generic mana', 'one hundred generic mana']);
});

test('leaves braces it cannot read as text', () => {
  const { container } = render(<TextWithMagicSymbol text="{1.5} or {nothing}" />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(container).toHaveTextContent('{1.5} or {nothing}');
});
