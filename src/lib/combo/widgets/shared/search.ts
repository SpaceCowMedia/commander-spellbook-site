/* The smallest integer in [low, high] that passes a test which keeps passing once it does, or
   Infinity when even `high` fails. */
export function lowestPassing(test: (n: number) => boolean, low: number, high: number): number {
  if (!test(high)) {
    return Infinity;
  }
  let from = low;
  let to = high;
  while (from < to) {
    const middle = from + Math.floor((to - from) / 2);
    if (test(middle)) {
      to = middle;
    } else {
      from = middle + 1;
    }
  }
  return from;
}

/* The largest integer in [low, high] that passes a test which keeps failing once it does, or
   low - 1 when even `low` fails. */
export function highestPassing(test: (n: number) => boolean, low: number, high: number): number {
  const firstFailure = lowestPassing((n) => !test(n), low, high);
  return Number.isFinite(firstFailure) ? firstFailure - 1 : high;
}
