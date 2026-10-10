import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import type { Outcome } from 'lib/combo/widgets/shared/calculator';
import { OPPONENT_LIBRARY, OPPONENT_LIFE } from 'lib/combo/widgets/shared/inputs';
import OpponentList, { MAX_OPPONENTS } from 'components/combo/ComboWidget/OpponentList/OpponentList';

function ControlledList({ lives = [40, 30, 20], outcomes }: { lives?: number[]; outcomes?: Outcome[] }) {
  const [rows, setRows] = useState<Record<string, number>[]>(lives.map((life) => ({ life, library: 60 })));
  return <OpponentList fields={[OPPONENT_LIFE, OPPONENT_LIBRARY]} rows={rows} outcomes={outcomes} onChange={setRows} />;
}

const lifeFields = () => screen.getAllByRole('spinbutton', { name: 'Life' });

test('shows a group of fields for each opponent, with what happens to them', () => {
  render(
    <ControlledList
      lives={[40, 1]}
      outcomes={[
        { tone: 'bad', text: 'Survives at 3' },
        { tone: 'good', text: 'Dies' },
      ]}
    />,
  );
  expect(screen.getByRole('group', { name: 'Opponent 1' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Opponent 2' })).toHaveTextContent('Dies');
  expect(lifeFields().map((field) => field.getAttribute('aria-valuenow'))).toEqual(['40', '1']);
});

test('focuses the new opponent’s first field after adding one', async () => {
  const user = userEvent.setup();
  render(<ControlledList />);
  await user.click(screen.getByRole('button', { name: 'Add an opponent' }));
  expect(lifeFields()).toHaveLength(4);
  expect(lifeFields()[3]).toHaveFocus();
  expect(lifeFields()[3]).toHaveValue('20');
});

test('focuses the next remove button after removing an opponent, or the add button', async () => {
  const user = userEvent.setup();
  render(<ControlledList />);
  await user.click(screen.getByRole('button', { name: 'Remove opponent 1' }));
  expect(lifeFields().map((field) => field.getAttribute('aria-valuenow'))).toEqual(['30', '20']);
  expect(screen.getByRole('button', { name: 'Remove opponent 1' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Remove opponent 2' }));
  expect(screen.getByRole('button', { name: 'Add an opponent' })).toHaveFocus();
  expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
});

test('keeps between one opponent and the most a table seats', () => {
  render(<ControlledList lives={Array.from({ length: MAX_OPPONENTS }, () => 40)} />);
  expect(screen.queryByRole('button', { name: 'Add an opponent' })).not.toBeInTheDocument();
});
