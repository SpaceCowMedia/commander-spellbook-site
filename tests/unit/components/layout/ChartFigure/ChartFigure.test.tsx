import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import ChartFigure from 'components/layout/ChartFigure/ChartFigure';

test('is a figure captioned by its title, with the x label under the plot for sighted readers only', () => {
  render(
    <ChartFigure title="Your life, loop by loop" xLabel="Loops">
      <svg data-testid="plot" />
    </ChartFigure>,
  );
  const figure = screen.getByRole('figure');
  const [caption, plot, xLabel] = figure.children;
  expect(caption.tagName).toBe('FIGCAPTION');
  expect(caption).toHaveTextContent('Your life, loop by loop');
  expect(plot).toBe(within(figure).getByTestId('plot'));
  expect(xLabel).toHaveTextContent('Loops');
  expect(xLabel).toHaveAttribute('aria-hidden', 'true');
});

test('is a group of controls when the plot has something to pick', () => {
  render(
    <ChartFigure title="Minimum life" xLabel="Spells cast" pickable>
      <input type="radio" aria-label="0 spells" />
    </ChartFigure>,
  );
  const group = screen.getByRole('group', { name: 'Minimum life' });
  expect(within(group).getByRole('radio', { name: '0 spells' })).toBeInTheDocument();
  expect(screen.queryByRole('figure')).not.toBeInTheDocument();
});
