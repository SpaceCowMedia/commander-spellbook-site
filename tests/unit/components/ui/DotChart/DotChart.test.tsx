import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import DotChart from 'components/ui/DotChart/DotChart';

const DOTS = [
  { x: 0, y: 33, label: '0 spells: 33 life', tone: 'bad' as const },
  { x: 1, y: 26, label: '1 spell: 26 life', tone: 'good' as const },
  { x: 2, y: 20, label: '2 spells: 20 life', tone: 'good' as const },
];

/* jsdom has no AnimationEvent, so React listens for the prefixed event there */
const endAnimation = (element: Element) => {
  fireEvent.animationEnd(element);
  fireEvent(element, new Event('webkitAnimationEnd', { bubbles: true }));
};

/* where each dot sits, in percent of the plot's height */
const heights = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => Number(item.querySelector<HTMLElement>('[style]')!.style.getPropertyValue('--own')));

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
  expect(heights()).toEqual([82.5, 65, 50]);
  rerender(<DotChart title="Chance" xLabel="Roll" dots={DOTS} max={100} />);
  expect(heights()).toEqual([33, 26, 20]);
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
    container
      .querySelector(path.parentElement!.getAttribute('clip-path')!.slice('url('.length, -1))!
      .querySelector('rect')!;
  /* the dashed ends stay in sight a little above the plot, the shading under them stops at its top */
  expect(clipOf(dashed)).toHaveAttribute('y', '-15');
  expect(clipOf(dashed)).toHaveAttribute('height', '115');
  const area = container.querySelector('[class*="area"]')!;
  expect(clipOf(area)).not.toHaveAttribute('y');
  expect(clipOf(area)).toHaveAttribute('height', '100');
  expect(clipOf(area)).toHaveAttribute('width', '3');
});

test('draws the marks across the plot, within the scale, and says them in words', () => {
  render(
    <DotChart title="Life" xLabel="Step" dots={DOTS} marks={[{ y: 60, label: 'Aetherflux can fire', tone: 'good' }]} />,
  );
  const mark = screen.getByText('Aetherflux can fire').parentElement!;
  expect(mark.style.getPropertyValue('--own')).toBe('100');
  /* the scale goes up to the mark: 33, 26 and 20 of 60 */
  expect(heights().map(Math.round)).toEqual([55, 43, 33]);
  expect(screen.getByText('Aetherflux can fire: 60.')).toHaveClass('sr-only');
});

test('turns the page of steps with the arrows past the ends, from the keyboard too', async () => {
  const user = userEvent.setup();
  const onPage = vi.fn();
  const { rerender } = render(
    <DotChart title="Goblins" xLabel="Step" dots={DOTS} after={{ x: 3, y: 15 }} page={0} onPage={onPage} />,
  );
  expect(screen.queryByRole('button', { name: 'Earlier steps' })).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Later steps' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(onPage).toHaveBeenLastCalledWith(1);
  rerender(<DotChart title="Goblins" xLabel="Step" dots={DOTS} before={{ x: -1, y: 40 }} page={1} onPage={onPage} />);
  expect(screen.queryByRole('button', { name: 'Later steps' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Earlier steps' }));
  expect(onPage).toHaveBeenLastCalledWith(0);
});

test('turns the page with a sideways swipe of a finger, but not of a mouse', () => {
  const onPage = vi.fn();
  render(
    <DotChart
      title="Goblins"
      xLabel="Step"
      dots={DOTS}
      before={{ x: -1, y: 40 }}
      after={{ x: 3, y: 15 }}
      page={2}
      onPage={onPage}
    />,
  );
  const plot = screen.getByRole('figure').querySelector('[class*="plot"]')!;
  const swipe = (pointerType: string, from: number, to: number, down = 0) => {
    fireEvent.pointerDown(plot, { pointerType, pointerId: 1, clientX: from, clientY: 100 });
    fireEvent.pointerUp(plot, { pointerType, pointerId: 1, clientX: to, clientY: 100 + down });
  };
  swipe('touch', 200, 100);
  expect(onPage).toHaveBeenLastCalledWith(3);
  swipe('pen', 100, 200);
  expect(onPage).toHaveBeenLastCalledWith(1);
  swipe('touch', 200, 170);
  swipe('touch', 200, 100, 60);
  swipe('mouse', 200, 100);
  expect(onPage).toHaveBeenCalledTimes(2);
});

test('keeps the old page beside the new one as it turns, both drawn to a scale going from one to the other', async () => {
  const user = userEvent.setup();
  const Paged = () => {
    const [page, setPage] = useState(0);
    return page === 0 ? (
      <DotChart
        title="Goblins"
        xLabel="Step"
        dots={[
          { x: 0, y: 10, label: 'Step 0: 10' },
          { x: 1, y: 20, label: 'Step 1: 20' },
        ]}
        after={{ x: 2, y: 40 }}
        page={0}
        onPage={setPage}
      />
    ) : (
      <DotChart
        title="Goblins"
        xLabel="Step"
        dots={[
          { x: 2, y: 40, label: 'Step 2: 40' },
          { x: 3, y: 80, label: 'Step 3: 80' },
        ]}
        before={{ x: 1, y: 20 }}
        page={1}
        onPage={setPage}
      />
    );
  };
  const { container } = render(<Paged />);
  await user.click(screen.getByRole('button', { name: 'Later steps' }));
  const old = container.querySelector<HTMLElement>('[inert]')!;
  expect(old).toHaveAttribute('aria-hidden', 'true');
  expect(within(old).getByText('Step 1: 20', { ignore: '.sr-only' })).toBeInTheDocument();
  const items = screen.getAllByRole('listitem');
  expect(items).toHaveLength(2);
  expect(within(items[1]).getByText('Step 3: 80', { selector: '.sr-only' })).toBeInTheDocument();
  const plot = old.closest<HTMLElement>('[style]')!;
  /* from 0 to 20, to 0 to 80 */
  expect(Number(plot.style.getPropertyValue('--zoom'))).toBeCloseTo(Math.log(20 / 80));
  const ticks = (kind: string) =>
    [...container.querySelectorAll(`[class*="scaleTick"][class*="${kind}"]`)].map((tick) => tick.textContent);
  expect(ticks('leaving')).toEqual(['5', '10', '15']);
  expect(ticks('entering')).toEqual(['40', '60', '80']);

  endAnimation(old);
  expect(container.querySelector('[inert]')).toBeNull();
  expect(plot.style.getPropertyValue('--zoom')).toBe('');
  expect(ticks('leaving')).toEqual([]);
  expect(ticks('entering')).toEqual([]);
});
