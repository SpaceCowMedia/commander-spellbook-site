import { logNormalCdf, normalCdf } from './probability';

/* A walk that moves each step by a uniformly random whole number from `low` to `high`, like a die roll
   minus a cost, and stops for good the first time a step ends below zero. */
export interface UniformWalk {
  low: number;
  high: number;
}

export interface Survival {
  /* the chance the walk is still going after this many steps */
  at(steps: number): number;
  /* the chance it never stops */
  forever: number;
  /* how many steps `at` is exact for: past them it is an estimate good to the percent, and so is
     `forever` unless this is endless */
  exactFor: number;
}

const NEGLIGIBLE = 1e-13;
const WORK_LIMIT = 30_000_000;
const MOST_HEIGHTS = 1_000_000;

function moments({ low, high }: UniformWalk) {
  const size = high - low + 1;
  return { mean: (low + high) / 2, variance: (size * size - 1) / 12 };
}

/* The θ > 0 with E[e^(-θ·step)] = 1. From a height h, the chance of ever falling below zero is at most
   e^(-θ·h) (Lundberg's bound), so far enough up the walk is safe for good. */
function adjustmentCoefficient(walk: UniformWalk): number {
  const size = walk.high - walk.low + 1;
  const excess = (theta: number) => {
    let sum = 0;
    for (let step = walk.low; step <= walk.high; step++) {
      sum += Math.exp(-theta * step);
    }
    return sum / size - 1;
  };
  let high = 1;
  while (excess(high) < 0) {
    high *= 2;
  }
  let low = 0;
  for (let i = 0; i < 100; i++) {
    const middle = (low + high) / 2;
    if (excess(middle) < 0) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return high;
}

/* The walk as a drifting Brownian motion, for when it is too big to follow exactly. The start moves up
   by half a step and by the expected overshoot of the barrier, which brings it close to the exact answer. */
export function approximateSurvival(walk: UniformWalk, start: number): Survival {
  const { mean, variance } = moments(walk);
  const deviation = Math.sqrt(variance);
  const height = start + 0.5 + 0.5826 * deviation;
  return {
    at(steps) {
      if (steps <= 0) {
        return 1;
      }
      const spread = deviation * Math.sqrt(steps);
      const reaching = normalCdf((height + mean * steps) / spread);
      const reflected = Math.exp((-2 * mean * height) / variance + logNormalCdf((mean * steps - height) / spread));
      return Math.min(1, Math.max(0, reaching - reflected));
    },
    forever: mean > 0 ? 1 - Math.exp((-2 * mean * height) / variance) : 0,
    exactFor: 0,
  };
}

const always: Survival = { at: () => 1, forever: 1, exactFor: Infinity };

/* Exact for every step it can afford to follow, then the Brownian approximation. Steps are followed with
   prefix sums, so each costs one pass over the heights the walk can be at, whatever the die. */
export function walkSurvival(walk: UniformWalk, start: number, horizon: number): Survival {
  if (walk.low >= 0) {
    return always;
  }
  const { mean } = moments(walk);
  const fallback = approximateSurvival(walk, start);
  const largestFall = -walk.low;
  let safeFrom = Infinity;
  if (mean > 0) {
    safeFrom = Math.ceil(Math.log(1 / NEGLIGIBLE) / adjustmentCoefficient(walk)) + walk.high + 1;
    if (start >= safeFrom) {
      return always;
    }
  }
  if ((mean <= 0 && start >= largestFall * horizon) || start >= MOST_HEIGHTS) {
    const certainFor = Math.floor(start / largestFall);
    return {
      at: (steps) => (steps <= certainFor ? 1 : fallback.at(steps)),
      forever: fallback.forever,
      exactFor: certainFor,
    };
  }

  const size = walk.high - walk.low + 1;
  let heights = new Float64Array(start + 1);
  heights[start] = 1;
  let safe = 0;
  let work = 0;
  const curve = [1];
  let settled: number | undefined;
  for (let step = 1; ; step++) {
    const prefix = new Float64Array(heights.length + 1);
    for (let h = 0; h < heights.length; h++) {
      prefix[h + 1] = prefix[h] + heights[h];
    }
    const alive = prefix[heights.length];
    const length = Math.min(safeFrom, heights.length + Math.max(0, walk.high));
    const next = new Float64Array(length);
    let kept = 0;
    for (let h = 0; h < length; h++) {
      const from = Math.max(0, h - walk.high);
      const to = Math.min(heights.length - 1, h - walk.low);
      if (to >= from) {
        next[h] = (prefix[to + 1] - prefix[from]) / size;
        kept += next[h];
      }
    }
    let fell = 0;
    for (let h = 0; h < Math.min(heights.length, largestFall); h++) {
      fell += (heights[h] * Math.min(size, largestFall - h)) / size;
    }
    if (Number.isFinite(safeFrom)) {
      safe += Math.max(0, alive - kept - fell);
    }
    heights = next;
    curve.push(kept + safe);
    work += length;
    if (kept < NEGLIGIBLE) {
      settled = safe;
      break;
    }
    if ((mean <= 0 && step >= horizon) || work > WORK_LIMIT) {
      break;
    }
  }
  const last = curve.length - 1;
  return {
    at(steps) {
      if (steps <= last) {
        return curve[Math.max(0, steps)];
      }
      return settled ?? fallback.at(steps);
    },
    forever: settled ?? (mean > 0 ? fallback.forever : 0),
    exactFor: settled === undefined ? last : Infinity,
  };
}
