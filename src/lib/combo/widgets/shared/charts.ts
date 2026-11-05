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

/* Dots one step apart, added in the order a loop goes through them */
export function stepDots(): { dots: Dot[]; add(y: number, label: string, tone?: Tone): void } {
  const dots: Dot[] = [];
  return {
    dots,
    add: (y, label, tone) => {
      dots.push({ x: dots.length, y, label, ...(tone && { tone }) });
    },
  };
}

/* A page of a loop played step by step. The first page starts with the `lead` dots before the loop
   proper, like where it starts, and each page shows `size` steps after those, the steps on either
   side of a page being where its line heads. The loop ends where `play`, which gives its first
   `count` dots placed by their step, gives no more, or where a number grows past what one can hold. */
export function stepPage(
  play: (count: number) => Dot[],
  page: number,
  size: number,
  lead = 1,
): Pick<DotChart, 'dots' | 'before' | 'after' | 'page'> {
  const played = play(lead + 1 + (page + 1) * size);
  const end = played.findIndex((dot) => !Number.isFinite(dot.y));
  const steps = end < 0 ? played : played.slice(0, end);
  const shown = Math.max(0, Math.min(page, Math.ceil((steps.length - lead) / size) - 1));
  const from = shown === 0 ? 0 : lead + shown * size;
  const to = lead + (shown + 1) * size;
  const point = ({ x, y }: Dot) => ({ x, y });
  return {
    dots: steps.slice(from, to),
    ...(from > 0 && { before: point(steps[from - 1]) }),
    ...(to < steps.length && { after: point(steps[to]) }),
    page: shown,
  };
}

export function chanceTone(chance: number): Tone {
  return chance >= 0.9 ? 'good' : chance >= 0.5 ? 'warn' : 'bad';
}
