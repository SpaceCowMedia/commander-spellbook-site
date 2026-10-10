import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import Stepper, { parseNumber } from 'components/ui/Stepper/Stepper';

interface ControlledProps {
  initial?: number;
  max?: number;
  orMore?: boolean;
  onValue?: (value: number) => void;
}

function ControlledStepper({ initial = 5, max = 1_000_000_000, orMore, onValue = vi.fn() }: ControlledProps) {
  const [value, setValue] = useState(initial);
  return (
    <Stepper
      label="Life"
      value={value}
      min={0}
      max={max}
      orMore={orMore}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

describe('parseNumber', () => {
  test('reads separators and exponents', () => {
    expect(parseNumber('1,000,000')).toBe(1_000_000);
    expect(parseNumber('1 000')).toBe(1000);
    expect(parseNumber('1_000')).toBe(1000);
    expect(parseNumber('1e9')).toBe(1_000_000_000);
    expect(parseNumber('2.6')).toBe(3);
    expect(parseNumber('5+')).toBe(5);
  });

  test('rejects anything else', () => {
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber('abc')).toBeUndefined();
    expect(parseNumber('1e')).toBeUndefined();
    expect(parseNumber('+')).toBeUndefined();
  });
});

describe('Stepper', () => {
  test('is a spinbutton showing its value with separators', () => {
    render(<ControlledStepper initial={1_000_000} />);
    const field = screen.getByRole('spinbutton', { name: 'Life' });
    expect(field).toHaveValue('1,000,000');
    expect(field).toHaveAttribute('aria-valuenow', '1000000');
    expect(field).toHaveAttribute('aria-valuemax', '1000000000');
  });

  test('takes a typed number as soon as it is valid, and tidies it up on blur', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledStepper onValue={onValue} />);
    const field = screen.getByRole('spinbutton');
    await user.clear(field);
    await user.type(field, '1e9');
    expect(onValue).toHaveBeenLastCalledWith(1_000_000_000);
    await user.tab();
    expect(field).toHaveValue('1,000,000,000');
  });

  test('flags a number out of range and clamps it on blur', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledStepper max={100} onValue={onValue} />);
    const field = screen.getByRole('spinbutton');
    await user.clear(field);
    await user.type(field, '500');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(onValue).not.toHaveBeenCalledWith(500);
    await user.tab();
    expect(field).toHaveValue('100');
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  test('steps with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ControlledStepper max={100} />);
    const field = screen.getByRole('spinbutton');
    await user.click(field);
    await user.keyboard('{ArrowUp}');
    expect(field).toHaveValue('6');
    await user.keyboard('{PageUp}');
    expect(field).toHaveValue('16');
    await user.keyboard('{PageDown}{ArrowDown}');
    expect(field).toHaveValue('5');
    await user.keyboard('{End}');
    expect(field).toHaveValue('100');
    await user.keyboard('{Home}');
    expect(field).toHaveValue('0');
  });

  test('keeps its buttons out of the tab order and stops them at the limits', async () => {
    const user = userEvent.setup();
    render(<ControlledStepper initial={0} max={1} />);
    const decrease = screen.getByRole('button', { name: 'Decrease Life' });
    const increase = screen.getByRole('button', { name: 'Increase Life' });
    expect(decrease).toHaveAttribute('tabindex', '-1');
    expect(decrease).toBeDisabled();
    await user.click(increase);
    expect(screen.getByRole('spinbutton')).toHaveValue('1');
    expect(increase).toBeDisabled();
    await user.tab();
    expect(screen.getByRole('spinbutton')).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  test('shows its top as "or more" when the top stands for everything above it', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<ControlledStepper initial={3} max={4} orMore onValue={onValue} />);
    const field = screen.getByRole('spinbutton');
    expect(field).toHaveValue('3');
    await user.click(screen.getByRole('button', { name: 'Increase Life' }));
    expect(field).toHaveValue('4+');
    expect(field).toHaveAttribute('aria-valuetext', '4 or more');
    await user.clear(field);
    await user.type(field, '12');
    expect(field).not.toHaveAttribute('aria-invalid');
    expect(onValue).toHaveBeenLastCalledWith(4);
    await user.tab();
    expect(field).toHaveValue('4+');
  });
});
