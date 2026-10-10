import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ResultSummary from 'components/combo/ComboWidget/ResultSummary/ResultSummary';

test('reads out the answer and the verdict together', () => {
  render(
    <ResultSummary
      result={{
        headline: { label: 'Minimum life to start', value: '33' },
        verdict: { tone: 'bad', title: 'You need 13 more life', detail: 'Pay {B} instead.' },
        meter: { have: 20, need: 33, unit: 'life' },
      }}
    />,
  );
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Minimum life to start33');
  expect(status).toHaveTextContent('You need 13 more life Pay');
  expect(screen.getByRole('img', { name: 'one black mana' })).toBeInTheDocument();
  expect(screen.getByRole('meter', { name: 'Life' })).toHaveAttribute('aria-valuetext', '20 of 33 life');
});

test('draws a mana answer with symbols and leaves the meter out when nothing is needed', () => {
  render(
    <ResultSummary
      result={{
        headline: { label: 'Mana needed', value: '{2}{G}', mana: { generic: 2, pips: { G: 1 } } },
        meter: { have: 3, need: 0, unit: 'life' },
      }}
    />,
  );
  expect(screen.getAllByRole('img').map((symbol) => symbol.getAttribute('alt'))).toEqual([
    'two generic mana',
    'one green mana',
  ]);
  expect(screen.queryByRole('meter')).not.toBeInTheDocument();
});
