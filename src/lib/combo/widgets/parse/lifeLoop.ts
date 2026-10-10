import type { NumberInput } from 'lib/combo/widgets/shared/calculator';
import { capitalize } from 'lib/combo/widgets/shared/format';
import { numberInput } from 'lib/combo/widgets/shared/inputs';
import type { LifeLoop, LifeStep } from 'lib/combo/widgets/shared/lifeLoop';
import { NUMBER, toNumber } from './variant';

const PAYMENT = new RegExp(`\\b(?:pay|pays|paying|lose|loses|losing)\\b([^.;]*?)\\b${NUMBER} life\\b`, 'gi');
/* someone else losing life: "causing each opponent to lose 1 life" */
const SOMEONE_ELSE = /\b(?:opponents?|players?|they)(?: to)?\s*$/i;
const PHYREXIAN_PAYMENT = /\bby paying ((?:\{[^}]+\})+)/i;
const VARIABLE_PAYMENT = /\bpaying X life, where X is ([^.]+)/i;
const HALF_PAYMENT = /\bpay(?:s|ing)? half (?:of )?your life/i;
const CHOICE = /^(.*?)\bby paying (.+?) or (.+?)\s*\bby paying (.+?)\.?$/i;
const CAST = /(?:^|,\s*)(?:cast|recast)\b/i;
const FIXED_GAIN = new RegExp(`\\b(?:you (?:to )?gain|gaining you|gain) ${NUMBER} life\\b(?! for each)`, 'i');
const DEVOTION_DRAIN = /\beach opponent to lose life equal to your devotion\b/i;
const FIXED_DRAIN = new RegExp(
  `\\beach opponent to lose ${NUMBER} life and (?:causing )?(?:you to gain|gaining you|you gain) (?:life equal to|that much)`,
  'i',
);

function lifePayments(text: string): number[] {
  const payments: number[] = [];
  for (const match of text.matchAll(PAYMENT)) {
    const before = text.slice(Math.max(0, match.index - 30), match.index);
    if (!SOMEONE_ELSE.test(before) && !/\bopponent|\bplayer/i.test(match[1])) {
      payments.push(toNumber(match[2]));
    }
  }
  const phyrexian = text.match(PHYREXIAN_PAYMENT)?.[1].match(/\/P\}/gi)?.length ?? 0;
  if (phyrexian > 0) {
    payments.push(2 * phyrexian);
  }
  return payments;
}

/* How the alternative of a "by paying … or … by paying …" step reads on its own. */
function choiceLabel(how: string, cost: string): string {
  const where = how
    .replace(/^\s*(?:cast|activate)\s+.+?\s+(?=(?:from|for|with|using)\b)/i, '')
    .replace(/^\s*(?:cast|activate)\s+.+$/i, '')
    .trim();
  return capitalize(`${where ? `${where} ` : ''}by paying ${cost}`.trim());
}

interface Line {
  steps: LifeStep[];
  variable?: NumberInput;
  extort?: boolean;
}

function parseLine(line: string, extortSeen: boolean): Line {
  const steps: LifeStep[] = [];
  const isStormGain = /aetherflux/i.test(line) && /\bgain/i.test(line) && !/^\s*activate\b/i.test(line);

  if (/\bextort\b/i.test(line)) {
    const life = lifePayments(line)[0];
    /* only the first extort trigger with a payment stands for all of them, the others are prose */
    return extortSeen || life === undefined ? { steps: [] } : { steps: [{ kind: 'extort', life }], extort: true };
  }

  let variable: NumberInput | undefined;
  const choice = line.match(CHOICE);
  const variablePayment = line.match(VARIABLE_PAYMENT);
  if (HALF_PAYMENT.test(line)) {
    steps.push({ kind: 'pay-half' });
  } else if (variablePayment) {
    steps.push({ kind: 'pay-x' });
    variable = numberInput('x', capitalize(variablePayment[1].trim()), 3);
  } else if (choice) {
    const option = (how: string, cost: string) => ({
      label: choiceLabel(how, cost),
      life: lifePayments(`paying ${cost}`).reduce((a, b) => a + b, 0),
    });
    steps.push({ kind: 'pay-choice', options: [option(choice[1], choice[2]), option(choice[3], choice[4])] });
  } else {
    const payments = lifePayments(line);
    if (/^\s*if needed\b/i.test(line)) {
      const mana = line.match(/\badding ((?:\{[^}]+\})+)/i)?.[1].match(/\{/g)?.length ?? 1;
      payments.forEach((life) => steps.push({ kind: 'pay-or-mana', life, mana }));
    } else {
      payments.forEach((life) => steps.push({ kind: 'pay', life }));
    }
  }

  if (CAST.test(line)) {
    steps.push({ kind: 'cast' });
  }

  const fixedDrain = line.match(FIXED_DRAIN);
  const fixedGain = line.match(FIXED_GAIN);
  if (isStormGain) {
    steps.push({ kind: 'storm-gain' });
  } else if (DEVOTION_DRAIN.test(line) || (/\bgray merchant\b/i.test(line) && /\benters\b/i.test(line))) {
    steps.push({ kind: 'drain', perOpponent: 'devotion' });
  } else if (fixedDrain) {
    steps.push({ kind: 'drain', perOpponent: toNumber(fixedDrain[1]) });
  } else if (fixedGain) {
    steps.push({ kind: 'gain', life: toNumber(fixedGain[1]) });
  }
  return { steps, variable };
}

/* Where the repeated part is: "Repeat." repeats every step above it, "Repeat from step 5." the steps
   from the fifth on, and "Repeat step 5." only that one. "Repeat step 3 for each remaining trigger"
   repeats inside the loop instead, and doesn't end it. */
function loopBounds(lines: string[]): { start: number; end: number } | undefined {
  for (let i = 0; i < lines.length; i++) {
    const rest = lines[i].match(/^repeat\b(.*)$/i)?.[1].trim();
    if (rest === undefined) {
      continue;
    }
    const from = rest.match(/^from step (\d+)\b(.*)$/i);
    if (from && !/\bfor each\b/i.test(from[2])) {
      return { start: Number(from[1]) - 1, end: i };
    }
    const only = rest.match(/^steps? (\d+)(?: (?:through|to|and) (\d+))?\.?$/i);
    if (only) {
      return { start: Number(only[1]) - 1, end: Number(only[2] ?? only[1]) };
    }
    if (
      /^(?:[.,]|$|until\b|(?:an? )?(?:arbitrarily|large|any number)\b|for infinite\b|as (?:many|desired|needed)\b|the (?:above|previous) steps\b)/i.test(
        rest,
      )
    ) {
      return { start: 0, end: i };
    }
  }
  return undefined;
}

/* A storm payoff like Aetherflux Reservoir triggers on every spell, even when the steps only tell
   about some of the triggers, like not about the one from casting a copy of Channel. So each cast
   gains the storm count right away, unless the steps never cast anything and only mention the
   triggers, which then stand for the casts. */
function gainOnEveryCast(steps: LifeStep[]): LifeStep[] {
  if (!steps.some((step) => step.kind === 'cast')) {
    return steps.flatMap((step): LifeStep[] => (step.kind === 'storm-gain' ? [{ kind: 'cast' }, step] : [step]));
  }
  return steps
    .filter((step) => step.kind !== 'storm-gain')
    .flatMap((step): LifeStep[] => (step.kind === 'cast' ? [step, { kind: 'storm-gain' }] : [step]));
}

/* The life a loop costs and gives back, read from its steps. */
export function parseLifeLoop(description: string): LifeLoop | undefined {
  const lines = description
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const bounds = loopBounds(lines);
  if (!bounds || bounds.start < 0 || bounds.start >= bounds.end || bounds.end > lines.length) {
    return undefined;
  }
  const setup: LifeStep[] = [];
  const loop: LifeStep[] = [];
  let variable: NumberInput | undefined;
  let extortSeen = false;
  lines.slice(0, bounds.end).forEach((line, index) => {
    const parsed = parseLine(line, extortSeen);
    extortSeen ||= !!parsed.extort;
    variable ??= parsed.variable;
    (index < bounds.start ? setup : loop).push(...parsed.steps);
  });
  const storm = [...setup, ...loop].some((step) => step.kind === 'storm-gain');
  return {
    setup: storm ? gainOnEveryCast(setup) : setup,
    loop: storm ? gainOnEveryCast(loop) : loop,
    ...(variable && { variable }),
  };
}
