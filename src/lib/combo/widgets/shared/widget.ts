import type { Variant } from '@space-cow-media/spellbook-client';
import type { Calculator } from './calculator';

type Falsy = false | null | undefined | '' | 0;

/* One calculator: how to recognize the combos it helps with, and what it computes for them. The
   params `detect` returns are plain data, so they could come from anywhere else too. */
export interface Widget<Id extends string = string, Params extends object = object> {
  id: Id;
  detect(variant: Variant): Params | undefined;
  calculator(params: Params): Calculator;
}

export type SpecOf<W> = W extends Widget<infer Id, infer Params> ? { widget: Id } & Params : never;

export function defineWidget<Id extends string, Params extends object>(
  id: Id,
  parts: { detect(variant: Variant): Params | Falsy; calculator(params: Params): Calculator },
): Widget<Id, Params> {
  return {
    id,
    detect: (variant) => parts.detect(variant) || undefined,
    calculator: parts.calculator,
  };
}
