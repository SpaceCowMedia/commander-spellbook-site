/* 1, 2 or 5 times a power of ten, the smallest that splits the span into at most about `count` steps */
function niceStep(low: number, high: number, count: number, smallest: number): number {
  const rough = Math.max((high - low) / count, smallest);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 5, 10].map((multiple) => multiple * magnitude).find((candidate) => candidate >= rough)!;
}

const round = (value: number) => Number(value.toPrecision(12));

/* Round numbers to mark an axis with, about `count` of them, in steps of 1, 2 or 5 times a power of ten. */
export function niceTicks(low: number, high: number, count: number): number[] {
  if (!Number.isFinite(low) || !Number.isFinite(high) || high < low || count < 1) {
    return [];
  }
  if (high === low) {
    return [low];
  }
  const step = niceStep(low, high, count, 0);
  const first = Math.ceil(low / step);
  const last = Math.floor(high / step);
  return Array.from({ length: last - first + 1 }, (_, i) => round((first + i) * step));
}

/* Like niceTicks, but reaching past the span when it doesn't start and end on a tick, so the ticks
   can be the whole scale: with `count` steps or a couple more, whichever wastes the least room.
   Steps are never smaller than `smallest`, like 1 for whole numbers. */
export function niceScale(low: number, high: number, count: number, smallest = 0): number[] {
  if (!Number.isFinite(low) || !Number.isFinite(high) || high < low || count < 1) {
    return [];
  }
  const scales = [count, count + 1, count + 2].map((steps) => {
    const step = niceStep(low, Math.max(high, low + (smallest || 1)), steps, smallest);
    const first = Math.floor(low / step);
    const last = Math.max(first + 1, Math.ceil(high / step));
    return Array.from({ length: last - first + 1 }, (_, i) => round((first + i) * step));
  });
  const span = (scale: number[]) => scale[scale.length - 1] - scale[0];
  return scales.reduce((best, scale) => (span(scale) < span(best) ? scale : best));
}
