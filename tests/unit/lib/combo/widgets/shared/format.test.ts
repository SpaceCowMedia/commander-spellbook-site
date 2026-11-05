import { describe, expect, test } from 'vitest';
import {
  decimalsToTellApart,
  formatCompact,
  formatLog10,
  formatNumber,
  formatPercent,
  formatPowerOfTen,
  formatReachable,
  plural,
  signed,
} from 'lib/combo/widgets/shared/format';

describe('formatNumber', () => {
  test('groups thousands and rounds', () => {
    expect(formatNumber(1234567.4)).toBe('1,234,567');
  });

  test('switches to powers of ten past a trillion', () => {
    expect(formatNumber(2.42e24)).toBe('2.42 × 10²⁴');
    expect(formatNumber(-3e15)).toBe('-3.00 × 10¹⁵');
  });

  test('marks unbounded values', () => {
    expect(formatNumber(Infinity)).toBe('∞');
    expect(formatReachable(Infinity)).toBe('Out of reach');
    expect(formatReachable(12)).toBe('12');
  });
});

describe('huge values', () => {
  test('rounds the mantissa up into the next power', () => {
    expect(formatPowerOfTen(Math.log10(9.999e20))).toBe('1.00 × 10²¹');
  });

  test('keeps exponents readable when they are long', () => {
    expect(formatPowerOfTen(1_234_567.3)).toBe('2.00 × 10^1,234,567');
    expect(formatLog10(5)).toBe('100,000');
    expect(formatLog10(4567.1)).toBe('1.26 × 10⁴⁵⁶⁷');
  });
});

test('formatCompact shortens what would not fit on a bar', () => {
  expect(formatCompact(9_999)).toBe('9,999');
  expect(formatCompact(12_345)).toBe('12.3K');
  expect(formatCompact(1_000_000_000)).toBe('1B');
  expect(formatCompact(5e20)).toBe('5.00 × 10²⁰');
});

describe('formatPercent', () => {
  test('keeps the extremes honest', () => {
    expect(formatPercent(1)).toBe('100%');
    expect(formatPercent(0.9999)).toBe('>99.9%');
    expect(formatPercent(0.0001)).toBe('<0.1%');
    expect(formatPercent(0)).toBe('0%');
  });

  test('shows a decimal only below 10%', () => {
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(0.0525)).toBe('5.3%');
  });

  test('shows the decimals a chance has, up to the ones asked for', () => {
    expect([0.8, 0.775, 0.764656, 0.05, 0.0525].map((chance) => formatPercent(chance, 3))).toEqual([
      '80%',
      '77.5%',
      '76.466%',
      '5.0%',
      '5.25%',
    ]);
    expect(formatPercent(0.99999, 2)).toBe('>99.99%');
    expect(formatPercent(0.99985, 2)).toBe('99.99%');
    expect(formatPercent(0.00001, 2)).toBe('<0.01%');
    expect(formatPercent(1, 4)).toBe('100%');
    expect(formatPercent(0, 4)).toBe('0%');
  });
});

test('counts the decimals that tell chances apart', () => {
  expect(decimalsToTellApart([0.5, 0.333, 0.25])).toBe(0);
  expect(decimalsToTellApart([0.8, 0.775, 0.7675])).toBe(0);
  expect(decimalsToTellApart([0.764656, 0.763445])).toBe(1);
  expect(decimalsToTellApart([0.763445, 0.762893])).toBe(2);
  expect(decimalsToTellApart([0.8, 0.762437, 0.762403])).toBe(3);
  expect(decimalsToTellApart([0.76236601, 0.762366])).toBe(4);
  expect(decimalsToTellApart([0.5, 0.5])).toBe(4);
  expect(decimalsToTellApart([0.5])).toBe(0);
});

test('plural and signed', () => {
  expect(plural(1, 'loop')).toBe('1 loop');
  expect(plural(2000, 'Pegasus', 'Pegasi')).toBe('2,000 Pegasi');
  expect(signed(3)).toBe('+3');
  expect(signed(-3)).toBe('-3');
  expect(signed(0)).toBe('0');
});
