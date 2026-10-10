import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ManaAmount from 'components/symbols/ManaAmount/ManaAmount';

test('draws a cost with the official symbols', () => {
  render(<ManaAmount cost={{ generic: 2, pips: { G: 2, 'W/B': 1 } }} />);
  expect(screen.getAllByRole('img').map((symbol) => symbol.getAttribute('alt'))).toEqual([
    'two generic mana',
    'one green mana',
    'one green mana',
    'one white or black mana',
  ]);
});

test('draws generic amounts without a symbol of their own as a pill', () => {
  render(<ManaAmount cost={{ generic: 1234, pips: { R: 1 } }} />);
  const pill = screen.getByRole('img', { name: '1,234 generic mana' });
  expect(pill).toHaveTextContent('1,234');
  expect(pill.getAttribute('width')).not.toBe('1.000em');
  expect(screen.getByRole('img', { name: 'one red mana' })).toBeInTheDocument();
});

test('draws two figures without a symbol of their own in a circle', () => {
  render(<ManaAmount cost={{ generic: 77, pips: {} }} />);
  const circle = screen.getByRole('img', { name: '77 generic mana' });
  expect(circle).toHaveTextContent('77');
  expect(circle).toHaveAttribute('width', '1.000em');
  expect(circle).toHaveAttribute('height', '1em');
});

test('draws a long run of one pip once, with a count', () => {
  const { container } = render(<ManaAmount cost={{ generic: 0, pips: { G: 1_000_000 } }} />);
  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(container).toHaveTextContent('× 1,000,000');
});
