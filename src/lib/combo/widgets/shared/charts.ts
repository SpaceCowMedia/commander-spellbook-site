import type { Tone } from 'lib/tone';
import type { Dot, DotChart, NumberInput } from './calculator';
import { formatNumber } from './format';

const SPAN = 10;

/* The page of values the current one is on, `step` apart, counting pages from the lowest value whole
   steps below it. The last page ends where the answer stops changing, and backs up to stay full. */
export function sweep(input: NumberInput, current: number, steadyFrom = input.max, step = 1): number[] {
  const last = Math.min(input.max, steadyFrom);
  const at = Math.max(input.min, Math.min(current, last));
  const lowest = input.min + ((at - input.min) % step);
  const steps = (x: number) => Math.floor((x - lowest) / step);
  const first = Math.max(0, Math.min(steps(at) - (steps(at) % SPAN), steps(last) - SPAN + 1));
  const count = Math.max(0, Math.min(SPAN, steps(last) - first + 1));
  return Array.from({ length: count }, (_, i) => lowest + (first + i) * step);
}

/* x in words, where the bar for `steadyFrom` stands for every x from it on */
export function formatSwept(x: number, steadyFrom?: number): string {
  return x === steadyFrom ? `${formatNumber(x)} or more` : formatNumber(x);
}

/* The dots for `xs`. Given the range the x goes over, also the answers one step past both ends where
   the range goes on, so the chart can show which way the answer heads. */
export function dots(
  xs: number[],
  dot: (x: number) => Omit<Dot, 'x'>,
  range?: { min: number; max: number },
): Pick<DotChart, 'dots' | 'before' | 'after'> {
  const step = xs.length > 1 ? xs[1] - xs[0] : 1;
  const point = (x: number) => ({ x, y: dot(x).y });
  const before = xs[0] - step;
  const after = xs[xs.length - 1] + step;
  return {
    dots: xs.map((x) => ({ x, ...dot(x) })),
    ...(range && xs.length > 0 && before >= range.min && { before: point(before) }),
    ...(range && xs.length > 0 && after <= range.max && { after: point(after) }),
  };
}

/* the dots for the page of values the current one is on */
export function sweptDots(
  input: NumberInput,
  current: number,
  dot: (x: number) => Omit<Dot, 'x'>,
  steadyFrom = input.max,
  step = 1,
): Pick<DotChart, 'dots' | 'before' | 'after'> {
  return dots(sweep(input, current, steadyFrom, step), dot, { min: input.min, max: Math.min(input.max, steadyFrom) });
}

export function chanceTone(chance: number): Tone {
  return chance >= 0.9 ? 'good' : chance >= 0.5 ? 'warn' : 'bad';
}
