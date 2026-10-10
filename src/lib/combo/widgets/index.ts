import type { Variant } from '@space-cow-media/spellbook-client';
import type { Calculator } from './shared/calculator';
import { valuesFor } from './shared/values';
import type { SpecOf, Widget } from './shared/widget';
import { aatchikLoop } from './aatchikLoop';
import { angelOfDestinyCombats } from './angelOfDestinyCombats';
import { angelOfDestinyMyriad } from './angelOfDestinyMyriad';
import { animar } from './animar';
import { cosmogoyf } from './cosmogoyf';
import { devastatingOnslaughtScourge } from './devastatingOnslaughtScourge';
import { devastatingOnslaughtTerror } from './devastatingOnslaughtTerror';
import { diceResource } from './diceResource';
import { dragonhawk } from './dragonhawk';
import { dragonTempest } from './dragonTempest';
import { drainLoop } from './drainLoop';
import { grayMerchantDevotion } from './grayMerchantDevotion';
import { krenko } from './krenko';
import { maddeningCacophony } from './maddeningCacophony';
import { manaEchoes } from './manaEchoes';
import { manaFormula } from './manaFormula';
import { mayaelsAriaDoubling } from './mayaelsAriaDoubling';
import { nadier } from './nadier';
import { ojerAxonil } from './ojerAxonil';
import { repercussion } from './repercussion';
import { sageOfHours } from './sageOfHours';
import { scepterTurns } from './scepterTurns';
import { siegebreakerFaceBreaker } from './siegebreakerFaceBreaker';
import { simulacrumSynthesizer } from './simulacrumSynthesizer';
import { stormLifeLoop } from './stormLifeLoop';
import { stormsplitterSacrifice } from './stormsplitterSacrifice';
import { stormsplitterTapping } from './stormsplitterTapping';
import { timeSieve } from './timeSieve';
import { tokenGrowth } from './tokenGrowth';

/* Every widget, in the order they are tried: the first that recognizes a variant wins. The generic
   formulas come last, after every widget that knows its combo by name. */
export const WIDGETS = [
  stormLifeLoop,
  drainLoop,
  krenko,
  mayaelsAriaDoubling,
  maddeningCacophony,
  angelOfDestinyCombats,
  angelOfDestinyMyriad,
  ojerAxonil,
  cosmogoyf,
  diceResource,
  repercussion,
  dragonTempest,
  devastatingOnslaughtTerror,
  devastatingOnslaughtScourge,
  dragonhawk,
  tokenGrowth,
  scepterTurns,
  sageOfHours,
  timeSieve,
  animar,
  manaEchoes,
  simulacrumSynthesizer,
  stormsplitterSacrifice,
  stormsplitterTapping,
  aatchikLoop,
  siegebreakerFaceBreaker,
  nadier,
  grayMerchantDevotion,
  manaFormula,
] as const;

export type WidgetSpec = SpecOf<(typeof WIDGETS)[number]>;
export type WidgetId = WidgetSpec['widget'];

const byId = new Map<string, Widget>(WIDGETS.map((widget) => [widget.id, widget as Widget]));

/* The widget that helps with a variant, if any. */
/* Every input pinned where the answer stops changing, so there is nothing to work out. */
export function hasNothingToChange(calculator: Calculator): boolean {
  if (calculator.inputs.length === 0 || calculator.opponents) {
    return false;
  }
  const steadyFrom = new Map(
    (calculator.compute(valuesFor(calculator)).charts ?? []).flatMap((chart) =>
      chart.kind === 'dots' && chart.selects !== undefined ? [[chart.selects, chart.steadyFrom]] : [],
    ),
  );
  return calculator.inputs.every((input) => input.kind === 'number' && steadyFrom.get(input.key) === input.min);
}

/* The first widget that recognizes the variant and leaves the player something to change. */
export function detectWidget(variant: Variant): WidgetSpec | null {
  for (const widget of WIDGETS) {
    const params = widget.detect(variant);
    const spec = params && ({ ...params, widget: widget.id } as WidgetSpec);
    if (spec && !hasNothingToChange(calculatorFor(spec))) {
      return spec;
    }
  }
  return null;
}

export function calculatorFor(spec: WidgetSpec): Calculator {
  return (byId.get(spec.widget) as Widget<string, WidgetSpec>).calculator(spec);
}
