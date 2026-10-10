import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import ChoiceField from 'components/ui/ChoiceField/ChoiceField';

const OPTIONS = [
  { value: 'life', label: 'Pay 2 life' },
  { value: 'mana', label: 'Pay {B}' },
  { value: 'skip', label: 'Skip it' },
];

function ControlledChoice() {
  const [value, setValue] = useState('life');
  return <ChoiceField label="Each loop" options={OPTIONS} value={value} onChange={setValue} />;
}

test('is a group of native radio buttons named by its legend', () => {
  render(<ControlledChoice />);
  const group = screen.getByRole('group', { name: 'Each loop' });
  expect(group).toBeInTheDocument();
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByRole('radio', { name: 'Pay 2 life' })).toBeChecked();
});

test('picks an option by click or with the arrow keys', async () => {
  const user = userEvent.setup();
  render(<ControlledChoice />);
  await user.click(screen.getByText('Pay {B}'));
  expect(screen.getByRole('radio', { name: 'Pay {B}' })).toBeChecked();
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('radio', { name: 'Skip it' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Skip it' })).toHaveFocus();
});

test('describes the group with its hint and keeps its icon out of the name', () => {
  render(
    <ChoiceField
      label="Complete"
      icon="complete"
      hint="Complete combos don't need additional cards."
      options={OPTIONS}
      value="skip"
      onChange={() => {}}
    />,
  );
  const group = screen.getByRole('group', { name: 'Complete' });
  expect(group).toHaveAccessibleDescription("Complete combos don't need additional cards.");
});

test('follows the value it is given', () => {
  const { rerender } = render(<ChoiceField label="Each loop" options={OPTIONS} value="life" onChange={() => {}} />);
  rerender(<ChoiceField label="Each loop" options={OPTIONS} value="skip" onChange={() => {}} />);
  expect(screen.getByRole('radio', { name: 'Skip it' })).toBeChecked();
});
