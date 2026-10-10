import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import DotChart from 'components/ui/DotChart/DotChart';

const DOTS = [
  { x: 0, y: 33, label: '0 spells: 33 life', tone: 'bad' as const },
  { x: 1, y: 26, label: '1 spell: 26 life', tone: 'good' as const },
  { x: 2, y: 20, label: '2 spells: 20 life', tone: 'good' as const },
];

/* where each dot sits, in percent of the plot's height */
const heights = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => item.querySelector<HTMLElement>('[style]')!.style.getPropertyValue('--at'));

test('doubles as radio buttons when picking a dot sets something', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<DotChart title="Minimum life" xLabel="Spells cast" dots={DOTS} selected={1} onSelect={onSelect} />);
  const group = screen.getByRole('group', { name: 'Minimum life' });
  const radios = within(group).getAllByRole('radio');
  expect(radios).toHaveLength(3);
  expect(screen.getByRole('radio', { name: '1 spell: 26 life, good' })).toBeChecked();
  await user.click(screen.getByRole('radio', { name: '0 spells: 33 life, bad' }));
  expect(onSelect).toHaveBeenCalledWith(0);
});

test('says each dot in words when it is only a picture', () => {
  render(<DotChart title="Minimum life" xLabel="Spells cast" dots={DOTS} />);
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(3);
  expect(within(items[0]).getByText('0 spells: 33 life, bad')).toHaveClass('sr-only');
  expect(within(items[2]).getByText('2 spells: 20 life, good')).toHaveClass('sr-only');
});

test('scales the dots to a round step above the highest one, or to the top it is given', () => {
  const { rerender } = render(<DotChart title="Chance" xLabel="Roll" dots={DOTS} />);
  expect(heights()).toEqual(['82.5%', '65%', '50%']);
  rerender(<DotChart title="Chance" xLabel="Roll" dots={DOTS} max={100} />);
  expect(heights()).toEqual(['33%', '26%', '20%']);
  expect(screen.getByText('50')).toBeInTheDocument();
});

test('shows each dot in a tooltip and the picked one beside its dot', () => {
  render(<DotChart title="Minimum life" xLabel="Spells cast" dots={DOTS} selected={1} onSelect={vi.fn()} />);
  const column = screen.getByRole('radio', { name: '0 spells: 33 life, bad' }).closest('label')!;
  expect(within(column).getByText('0 spells: 33 life', { ignore: '.sr-only' })).toBeInTheDocument();
  expect(screen.getByText('26')).toBeInTheDocument();
  expect(screen.queryByText('33')).not.toBeInTheDocument();
});

test('ticks the dot that stands for everything above it with a plus, its line going on flat', () => {
  const { container } = render(
    <DotChart title="Minimum life" xLabel="Spells cast" dots={DOTS} selected={2} onSelect={vi.fn()} orMore={2} />,
  );
  expect(screen.getByText('2+')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  const paths = [...container.querySelectorAll('path')].map((path) => path.getAttribute('d'));
  expect(paths).toContain('M2.5 50 L3 50');
  expect(container.querySelectorAll('button')).toHaveLength(0);
});

test('points past the ends where there is more, shading under that too, and steps there when picked', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  const { container, rerender } = render(
    <DotChart title="Minimum life" xLabel="Spells cast" dots={DOTS} selected={1} onSelect={onSelect} />,
  );
  expect(container.querySelectorAll('button')).toHaveLength(0);
  const area = () => container.querySelector('path')!.getAttribute('d');
  expect(area()).toMatch(/^M0\.5 \S+ L1\.5 \S+ L2\.5 \S+ L2\.5 100 L0\.5 100 Z$/);
  rerender(
    <DotChart
      title="Minimum life"
      xLabel="Spells cast"
      dots={DOTS}
      selected={1}
      onSelect={onSelect}
      before={{ x: -1, y: 40 }}
      after={{ x: 3, y: 15 }}
    />,
  );
  const buttons = container.querySelectorAll('button');
  expect(buttons).toHaveLength(2);
  expect(buttons[0]).toHaveAttribute('tabindex', '-1');
  await user.click(buttons[1]);
  expect(onSelect).toHaveBeenCalledWith(3);
  const paths = [...container.querySelectorAll('path')].map((path) => path.getAttribute('d'));
  expect(paths).toContainEqual(expect.stringMatching(/ L0 \S+ M2\.5 \S+ L3 /));
  expect(area()).toMatch(/^M0 \S+ L0\.5 .* L3 \S+ L3 100 L0 100 Z$/);
});

test('keeps the scale to the dots shown, the dashed ends leaving the plot where the line heads past it', () => {
  const { container, rerender } = render(<DotChart title="Goblins" xLabel="Step" dots={DOTS} />);
  const shown = heights();
  const ticks = () => [...container.querySelectorAll('[class*="scaleTick"]')].map((tick) => tick.textContent);
  const scale = ticks();
  rerender(<DotChart title="Goblins" xLabel="Step" dots={DOTS} before={{ x: -1, y: 400 }} after={{ x: 3, y: 100 }} />);
  expect(heights()).toEqual(shown);
  expect(ticks()).toEqual(scale);
  const dashed = container.querySelector('[class*="beyond"]')!;
  /* 33 of 40 and 400 of 40 meet halfway far above the plot; 20 of 40 and 100 of 40 at 150% */
  expect(dashed.getAttribute('d')).toBe('M0.5 17.5 L0 -441.25 M2.5 50 L3 -50');
  const clipOf = (path: Element) =>
    container.querySelector(path.getAttribute('clip-path')!.slice('url('.length, -1))!.querySelector('rect')!;
  /* the dashed ends stay in sight a little above the plot, the shading under them stops at its top */
  expect(clipOf(dashed)).toHaveAttribute('y', '-15');
  expect(clipOf(dashed)).toHaveAttribute('height', '115');
  const area = container.querySelector('[class*="area"]')!;
  expect(clipOf(area)).not.toHaveAttribute('y');
  expect(clipOf(area)).toHaveAttribute('height', '100');
  expect(clipOf(area)).toHaveAttribute('width', '3');
});
