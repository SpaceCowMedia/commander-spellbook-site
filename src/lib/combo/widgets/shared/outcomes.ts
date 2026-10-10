import type { Meter, Outcome, Stat, Verdict } from './calculator';
import { formatNumber, plural } from './format';

export function lifeOutcome(remaining: number): Outcome {
  return remaining <= 0
    ? { tone: 'good', text: 'Dies' }
    : { tone: 'bad', text: `Survives at ${formatNumber(remaining)}` };
}

export function deaths(outcomes: Outcome[]): number {
  return outcomes.filter((outcome) => outcome.tone === 'good').length;
}

/* Everyone dies, some do, or nobody. */
export function tableVerdict(outcomes: Outcome[], everyone = 'Every opponent dies'): Verdict {
  const dead = deaths(outcomes);
  if (dead === outcomes.length) {
    return { tone: 'good', title: everyone };
  }
  if (dead === 0) {
    return { tone: 'bad', title: 'No opponent dies' };
  }
  return {
    tone: 'warn',
    title: `${formatNumber(dead)} of ${plural(outcomes.length, 'opponent')} ${dead === 1 ? 'dies' : 'die'}`,
  };
}

export function killedHeadline(outcomes: Outcome[]): Stat {
  return { label: 'Opponents killed', value: `${formatNumber(deaths(outcomes))} of ${formatNumber(outcomes.length)}` };
}

export function moreLife(missing: number, detail?: string): Verdict {
  return { tone: 'bad', title: `You need ${formatNumber(missing)} more life`, ...(detail && { detail }) };
}

interface Enough {
  unit: string;
  /* the verdict's title when you have enough */
  enough: string;
  /* the verdict's title when you don't, from how much is missing */
  short?: (missing: number) => string;
}

/* What you have against what you need, as a verdict and a meter. */
export function compare(
  have: number,
  need: number,
  { unit, enough, short }: Enough,
): { verdict: Verdict; meter: Meter } {
  const missing = need - have;
  const meter = { have, need, unit };
  if (missing <= 0) {
    return {
      verdict: {
        tone: 'good',
        title: enough,
        detail: missing < 0 ? `${formatNumber(-missing)} to spare.` : 'Exactly enough.',
      },
      meter,
    };
  }
  return { verdict: { tone: 'bad', title: short ? short(missing) : `${formatNumber(missing)} ${unit} short` }, meter };
}
