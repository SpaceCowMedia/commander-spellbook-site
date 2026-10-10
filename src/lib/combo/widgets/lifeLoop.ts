import type { Variant } from '@space-cow-media/spellbook-client';
import type { Input, Values } from './shared/calculator';
import { LifeLoop, LifeStep, LoopInputs, hasStep } from './shared/lifeLoop';
import { parseLifeLoop } from './parse/lifeLoop';

/* What the storm life loop and the drain loop widgets share: reading the loop and its inputs. */

const PAYMENTS: LifeStep['kind'][] = ['pay', 'pay-x', 'pay-half', 'pay-or-mana', 'pay-choice', 'extort'];

/* The loop of a variant whose life goes up with the storm count, or down with drains, never both. */
export function readLifeLoop(variant: Variant, kind: 'storm' | 'drain'): LifeLoop | undefined {
  const loop = parseLifeLoop(variant.description);
  if (!loop || !loop.loop.some((step) => PAYMENTS.includes(step.kind))) {
    return undefined;
  }
  const storm = hasStep(loop, 'storm-gain');
  const drain = hasStep(loop, 'drain') || hasStep(loop, 'extort');
  return storm !== drain && (kind === 'storm' ? storm : drain) ? loop : undefined;
}

/* The inputs every loop with a choice of payment or a variable cost asks for. */
export function loopChoices(loop: LifeLoop): Input[] {
  const inputs: Input[] = [];
  const choice = [...loop.setup, ...loop.loop].find((step) => step.kind === 'pay-choice');
  if (choice) {
    inputs.push({
      kind: 'choice',
      key: 'choice',
      label: 'The first time',
      options: choice.options.map((option, index) => ({ value: String(index), label: option.label })),
      initial: '0',
    });
  }
  if (loop.variable) {
    inputs.push(loop.variable);
  }
  return inputs;
}

export function loopInputs(values: Values): LoopInputs {
  return {
    storm: values.numbers.storm ?? 0,
    devotion: values.numbers.devotion ?? 0,
    extorters: values.numbers.extorters ?? 0,
    x: values.numbers.x ?? 0,
    choice: Number(values.choices.choice ?? 0),
    mana: values.numbers.mana ?? 0,
  };
}
