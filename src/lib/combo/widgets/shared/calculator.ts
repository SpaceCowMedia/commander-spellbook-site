import type { Tone } from 'lib/tone';
import type { ManaCost } from 'lib/symbols/mana';

/* What a calculator asks for, and what it answers with. Every widget speaks this language, so they
   all look and behave alike. */

export type Category =
  'storm-life' | 'lethal' | 'drain' | 'stats' | 'board' | 'finite' | 'table' | 'commander-tax' | 'chance';

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

export interface Values {
  numbers: Record<string, number>;
  choices: Record<string, string>;
  /* one record per opponent, keyed like the opponent fields */
  opponents: Record<string, number>[];
}

export interface Stat {
  label: string;
  value: string;
  /* the value as mana, drawn with symbols */
  mana?: ManaCost;
  caption?: string;
}

export interface Verdict {
  tone: Tone;
  title: string;
  detail?: string;
}

/* How far what you have goes toward what you need */
export interface Meter {
  have: number;
  need: number;
  unit: string;
}

export interface Outcome {
  tone: Tone;
  text: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Dot extends Point {
  label: string;
  tone?: Tone;
}

/* one answer per x, as dots on a line */
export interface DotChart {
  kind: 'dots';
  title: string;
  xLabel: string;
  yLabel: string;
  dots: Dot[];
  /* the answers just past the first and last dots, where the x goes on that way */
  before?: Point;
  after?: Point;
  /* the number input that picking a dot sets to the dot's x */
  selects?: string;
  /* the answer stays the same from this x on: the dots end at it, its dot stands for every x above
     too, and the input the chart selects goes no higher */
  steadyFrom?: number;
  percent?: boolean;
}

export interface LineChart {
  kind: 'line';
  title: string;
  xLabel: string;
  yLabel: string;
  points: Point[];
  marks?: { y: number; label: string; tone?: Tone }[];
  /* the curve in words */
  summary: string;
}

export interface Result {
  headline: Stat;
  verdict?: Verdict;
  meter?: Meter;
  stats?: Stat[];
  /* one per opponent, in the same order */
  outcomes?: Outcome[];
  charts?: (DotChart | LineChart)[];
}

export interface Calculator {
  category: Category;
  /* the question the widget answers */
  title: string;
  /* how it gets there, in a sentence */
  summary: string;
  inputs: Input[];
  opponents?: { fields: NumberInput[] };
  compute(values: Values): Result;
}
