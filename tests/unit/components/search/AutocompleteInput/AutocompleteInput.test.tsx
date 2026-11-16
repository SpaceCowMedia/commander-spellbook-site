import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import AutocompleteInput, { AutoCompleteOption } from 'components/search/AutocompleteInput/AutocompleteInput';
import normalizeStringInput from 'lib/text/normalizeStringInput';

const OPTIONS: AutoCompleteOption[] = ['Ruthless', 'Spicy', 'Powerful'].map((tag) => ({
  value: tag,
  label: tag,
  normalizedValue: normalizeStringInput(tag),
  normalizedLabel: normalizeStringInput(tag),
}));

const LOOKUP_TIMEOUT = { timeout: 3000 };

function renderInput(props: Partial<React.ComponentProps<typeof AutocompleteInput>> = {}) {
  const onSelect = vi.fn();
  render(<AutocompleteInput value="" inputId="tag" autocompleteOptions={OPTIONS} onSelect={onSelect} {...props} />);
  return { onSelect, input: screen.getByRole('textbox') };
}

function suggestions() {
  return screen.queryAllByRole('listitem').map((item) => item.textContent);
}

test('lists the typed text last, after the matching suggestions', async () => {
  const user = userEvent.setup();
  const { input } = renderInput({ acceptsAnyText: true });
  await user.type(input, 'u');
  await waitFor(() => expect(suggestions()).toEqual(['Ruthless', 'Powerful', 'Use "u"']), LOOKUP_TIMEOUT);
});

test('offers only the typed text when nothing matches', async () => {
  const user = userEvent.setup();
  const { input } = renderInput({ acceptsAnyText: true });
  await user.type(input, 'zz');
  await waitFor(() => expect(suggestions()).toEqual(['Use "zz"']), LOOKUP_TIMEOUT);
});

test('keeps the typed text and closes the list when it is chosen', async () => {
  const user = userEvent.setup();
  const { input, onSelect } = renderInput({ acceptsAnyText: true });
  await user.type(input, 'spi');
  await screen.findByText('Use "spi"', undefined, LOOKUP_TIMEOUT);
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  expect(onSelect).toHaveBeenCalledWith('spi');
  expect(input).toHaveValue('spi');
  expect(suggestions()).toEqual([]);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  expect(suggestions()).toEqual([]);
});

test('offers only the suggestions when the input takes nothing else', async () => {
  const user = userEvent.setup();
  const { input } = renderInput();
  await user.type(input, 'u');
  await waitFor(() => expect(suggestions()).toEqual(['Ruthless', 'Powerful']), LOOKUP_TIMEOUT);
});
