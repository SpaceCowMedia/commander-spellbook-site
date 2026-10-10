import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { expect, test, vi } from 'vitest';
import { fakeVariant, fixtureVariant } from '../../../lib/combo/widgets/testing/fakeVariant';
import ComboWidget from 'components/combo/ComboWidget/ComboWidget';

async function accessibilityViolations(container: HTMLElement): Promise<string[]> {
  const { violations } = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(' | ')}`);
}

test('renders nothing for a combo without a calculator', () => {
  const { container } = render(<ComboWidget combo={fakeVariant({ uses: ['Sol Ring'] })} />);
  expect(container).toBeEmptyDOMElement();
});

test('renders nothing for a combo whose answer no input can change', () => {
  const { container } = render(<ComboWidget combo={fixtureVariant('1283-1537-2440-4183')} />);
  expect(container).toBeEmptyDOMElement();
});

test('answers for the combo and answers again as the inputs change', async () => {
  const user = userEvent.setup();
  render(<ComboWidget combo={fixtureVariant('2903-3260-4740')} />);
  expect(screen.getByRole('heading', { level: 2, name: 'Widget' })).toBeInTheDocument();
  const widget = screen.getByRole('region', { name: 'How much life you need to go off' });
  expect(widget).toHaveAttribute('data-widget', 'storm-life-loop');
  expect(screen.getByRole('heading', { level: 3, name: 'How much life you need to go off' })).toBeInTheDocument();
  expect(widget).toHaveTextContent('Storm life loop calculator');
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Minimum life to start33');
  expect(status).toHaveTextContent('You can go off');

  const life = screen.getByRole('spinbutton', { name: 'Your life total' });
  await user.clear(life);
  await user.type(life, '20');
  expect(status).toHaveTextContent('You need 13 more life');

  await user.click(screen.getByRole('radio', { name: /^2 spells cast: 20 life/ }));
  expect(screen.getByRole('spinbutton', { name: 'Spells you cast this turn before the loop' })).toHaveValue('2');
  expect(status).toHaveTextContent('You can go off');
});

test('stops the input where the answer stops changing', async () => {
  const user = userEvent.setup();
  render(<ComboWidget combo={fixtureVariant('2-3771')} />);
  const counters = screen.getByRole('spinbutton', { name: '+1/+1 counters on Animar' });
  expect(counters).toHaveAttribute('aria-valuemax', '4');
  await user.click(screen.getByRole('radio', { name: /^4 or more/ }));
  expect(counters).toHaveValue('4+');
  expect(screen.getByRole('radio', { name: /^4 or more/ })).toBeChecked();
  expect(screen.getByRole('button', { name: 'Increase +1/+1 counters on Animar' })).toBeDisabled();
});

test('draws the mana in the title as symbols', () => {
  render(<ComboWidget combo={fixtureVariant('182-6907-6908')} />);
  const title = screen.getByRole('heading', { level: 3 });
  expect(within(title).getByRole('img', { name: 'one red mana' })).toBeInTheDocument();
  expect(title).toHaveTextContent('How much does Cosmogoyf need?');
  expect(screen.getByRole('region', { name: /^How much\s*one red mana\s*does Cosmogoyf need\?$/ })).toBeInTheDocument();
});

test("draws the mana in a chart's labels as symbols, amounts without an official one included", async () => {
  const user = userEvent.setup();
  render(<ComboWidget combo={fixtureVariant('38-659-1288')} />);
  const goblins = screen.getByRole('spinbutton', { name: 'Goblins you control, Krenko included' });
  const casts = screen.getByRole('spinbutton', { name: 'Times Krenko was cast from the command zone' });
  await user.clear(goblins);
  await user.type(goblins, '12');
  await user.clear(casts);
  await user.type(casts, '3');
  const chart = screen.getByRole('figure');
  expect(chart).toHaveTextContent('Goblins, step by step');
  expect(await within(chart).findByRole('img', { name: '21 generic mana' })).toBeInTheDocument();
  expect(within(chart).getAllByRole('listitem')).toHaveLength(17);
  expect(within(chart).getAllByRole('img', { name: 'one red mana' })).toHaveLength(16);
  expect(chart).not.toHaveTextContent(/[{}]/);
});

test('resets the inputs to where they started', async () => {
  const user = userEvent.setup();
  render(<ComboWidget combo={fixtureVariant('2903-3260-4740')} />);
  const reset = screen.getByRole('button', { name: 'Reset the inputs' });
  const life = screen.getByRole('spinbutton', { name: 'Your life total' });
  const spells = screen.getByRole('spinbutton', { name: 'Spells you cast this turn before the loop' });
  const start = [(life as HTMLInputElement).value, (spells as HTMLInputElement).value];
  expect(reset).toHaveAttribute('aria-disabled', 'true');

  await user.clear(life);
  await user.type(life, '20');
  await user.click(screen.getByRole('radio', { name: /^2 spells cast: 20 life/ }));
  expect(reset).toHaveAttribute('aria-disabled', 'false');

  await user.click(reset);
  expect(life).toHaveValue(start[0]);
  expect(spells).toHaveValue(start[1]);
  expect(screen.getByRole('status')).toHaveTextContent('Minimum life to start33');
  expect(reset).toHaveAttribute('aria-disabled', 'true');
  expect(reset).toHaveFocus();
});

test('resets the opponents too', async () => {
  const user = userEvent.setup();
  const complaints = vi.spyOn(console, 'error');
  render(<ComboWidget combo={fixtureVariant('328-3260-4078-6798')} />);
  const opponents = () => within(screen.getByRole('region', { name: 'Opponents' })).getAllByRole('group');
  expect(opponents()).toHaveLength(3);
  await user.click(screen.getByRole('button', { name: 'Remove opponent 1' }));
  await user.click(screen.getByRole('button', { name: 'Remove opponent 1' }));
  await user.clear(screen.getByRole('spinbutton', { name: 'Life' }));
  await user.type(screen.getByRole('spinbutton', { name: 'Life' }), '7');
  expect(opponents()).toHaveLength(1);

  await user.click(screen.getByRole('button', { name: 'Reset the inputs' }));
  expect(opponents()).toHaveLength(3);
  for (const field of screen.getAllByRole('spinbutton', { name: 'Life' })) {
    expect(field).toHaveValue('40');
  }

  await user.click(screen.getByRole('button', { name: 'Add an opponent' }));
  expect(opponents()).toHaveLength(4);
  /* React complains about rows left without a key */
  expect(complaints).not.toHaveBeenCalled();
  complaints.mockRestore();
});

test.each([
  ['a storm loop with a chart to pick from', '2903-3260-4740'],
  ['a loop with a choice to make', '4050-4740-6742'],
  ['a drain loop against several opponents', '328-3260-4078-6798'],
  ['chances as percentages', '778-3750'],
  ['mana as the answer', '2024-7308'],
  ['a chart of the steps of a loop', '38-659-1288'],
  ['growth charted upkeep by upkeep', '851-4365-7858'],
  ['opponents with more than their life', '2484-4083'],
  ['mana as a statistic', '2868-4629'],
  ['mana to start a loop that pays itself back', '2440-6873'],
] as const)('has no accessibility violations for %s', async (_, id) => {
  const { container } = render(<ComboWidget combo={fixtureVariant(id)} />);
  expect(container).not.toBeEmptyDOMElement();
  expect(await accessibilityViolations(container)).toEqual([]);
});
