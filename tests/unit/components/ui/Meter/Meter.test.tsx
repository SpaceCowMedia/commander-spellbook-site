import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Meter from 'components/ui/Meter/Meter';

test('reads as how much of what you need you have', () => {
  render(<Meter label="Life" have={15} need={33} unit="life" />);
  const meter = screen.getByRole('meter', { name: 'Life' });
  expect(meter).toHaveAttribute('aria-valuenow', '15');
  expect(meter).toHaveAttribute('aria-valuemax', '33');
  expect(meter).toHaveAttribute('aria-valuetext', '15 of 33 life');
});

test('stays within its range when you have more than enough', () => {
  render(<Meter label="Life" have={1_000_000_000} need={33} unit="life" />);
  const meter = screen.getByRole('meter');
  expect(meter).toHaveAttribute('aria-valuenow', '33');
  expect(meter).toHaveAttribute('aria-valuetext', '1,000,000,000 of 33 life');
});
