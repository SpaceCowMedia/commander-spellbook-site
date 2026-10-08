/*
 * A calculator asks for a few numbers and answers with a headline, a verdict and, where it helps,
 * a chart. Every widget is one of these, so they all look and behave alike.
 */

export interface NumberInput {
  kind: 'number';
  key: string;
  label: string;
  min: number;
  max: number;
  initial: number;
  hint?: string;
}

export interface ChoiceInput {
  kind: 'choice';
  key: string;
  label: string;
  options: { value: string; label: string }[];
  initial: string;
}

export type Input = NumberInput | ChoiceInput;

export interface OpponentField {
  key: string;
  label: string;
  min: number;
  max: number;
  initial: number;
}

export interface Values {
  numbers: Record<string, number>;
  choices: Record<string, string>;
  /* one record per opponent, keyed like the opponent fields */
  opponents: Record<string, number>[];
}

/* good: what the combo wants happens (an opponent dies, the loop goes on); bad: it doesn't */
export type Tone = 'good' | 'bad' | 'warn' | 'neutral';

export interface Stat {
  label: string;
  value: string;
  /* the value is a mana cost like "{2}{R}", to show as symbols */
  mana?: boolean;
  caption?: string;
}

export interface Verdict {
  tone: Tone;
  title: string;
  detail?: string;
}

export interface Outcome {
  tone: Tone;
  text: string;
}

export interface BarChart {
  kind: 'bars';
  title: string;
  xLabel: string;
  yLabel: string;
  bars: { x: string; y: number; label: string; tone?: Tone; selected?: boolean }[];
  /* clicking a bar sets this number input to the bar's x */
  selects?: string;
  percent?: boolean;
}

export interface LineChart {
  kind: 'line';
  title: string;
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
  marks?: { y: number; label: string; tone?: Tone }[];
  /* the curve in words, for people who can't see it */
  summary: string;
}

export interface Table {
  caption: string;
  columns: string[];
  rows: string[][];
}

export interface Result {
  headline: Stat;
  stats?: Stat[];
  verdict?: Verdict;
  /* one per opponent row, in the same order */
  outcomes?: Outcome[];
  charts?: (BarChart | LineChart)[];
  table?: Table;
  notes?: string[];
}

export interface Calculator {
  /* the question the widget answers */
  title: string;
  /* how it gets there, in a sentence */
  summary: string;
  inputs: Input[];
  opponents?: { fields: OpponentField[]; count?: number };
  compute(values: Values): Result;
}

/* ---------- Shared inputs and formatting ---------- */

export const STARTING_LIFE = 40;

export function numberInput(
  key: string,
  label: string,
  min: number,
  max: number,
  initial: number,
  hint?: string,
): NumberInput {
  return { kind: 'number', key, label, min, max, initial, ...(hint && { hint }) };
}

export const LIFE_INPUT = numberInput('life', 'Your life total', 1, 999, STARTING_LIFE);
export const OPPONENT_LIFE = { key: 'life', label: 'Life', min: 1, max: 999, initial: STARTING_LIFE };

const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/* 1,234 or, past a trillion, 2.42 × 10²⁴ */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '∞';
  }
  if (Math.abs(value) < 1e12) {
    return Math.round(value).toLocaleString('en-US');
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  const superscript = String(exponent)
    .split('')
    .map((digit) => SUPERSCRIPTS[Number(digit)])
    .join('');
  return `${mantissa.toFixed(2)} × 10${superscript}`;
}

/* 2 ** exponent, written out while it fits */
export function formatPowerOfTwo(exponent: number): string {
  return exponent <= 40
    ? formatNumber(2 ** exponent)
    : `2${String(exponent).replace(/\d/g, (d) => SUPERSCRIPTS[Number(d)])}`;
}

export function formatPercent(probability: number): string {
  if (probability >= 1) {
    return '100%';
  }
  if (probability <= 0) {
    return '0%';
  }
  const percent = probability * 100;
  if (percent >= 99.95) {
    return '>99.9%';
  }
  if (percent < 0.05) {
    return '<0.1%';
  }
  return `${percent.toFixed(percent >= 10 ? 0 : 1)}%`;
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

export function opponentName(index: number): string {
  return `Opponent ${index + 1}`;
}

/* The tone and words for an opponent at the given life after the combo. */
export function lifeOutcome(remaining: number): { tone: Tone; text: string } {
  return remaining <= 0
    ? { tone: 'good', text: 'Dies' }
    : { tone: 'bad', text: `Survives at ${formatNumber(remaining)}` };
}
