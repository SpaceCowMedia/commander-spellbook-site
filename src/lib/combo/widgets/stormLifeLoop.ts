import type { DotChart, LineChart, Result, Stat } from './shared/calculator';
import { sweptDots } from './shared/charts';
import { formatNumber, formatReachable, plural, signed } from './shared/format';
import { LIFE, numberInput } from './shared/inputs';
import {
  LifeLoop,
  NO_LOOP_INPUTS,
  firstRisingLoop,
  hasStep,
  lifeTrace,
  loopsUntilAbove,
  manaToGoOff,
  stormMinimumLife,
} from './shared/lifeLoop';
import { moreLife } from './shared/outcomes';
import { defineWidget } from './shared/widget';
import { loopChoices, loopInputs, readLifeLoop } from './lifeLoop';
import { uses } from './parse/variant';

interface Payoff {
  name: string;
  life: number;
  damage: number;
}

const STORM = numberInput('storm', 'Spells you cast this turn before the loop', 0);
const MANA = numberInput('mana', 'Mana you can spend instead of life', 0);

export const stormLifeLoop = defineWidget<'storm-life-loop', LifeLoop & { payoff?: Payoff }>('storm-life-loop', {
  detect(variant) {
    const loop = readLifeLoop(variant, 'storm');
    const inputs = { ...NO_LOOP_INPUTS, x: loop?.variable?.initial ?? 0 };
    if (!loop || !Number.isFinite(stormMinimumLife(loop, inputs))) {
      return undefined;
    }
    return uses(variant, 'Aetherflux Reservoir')
      ? { ...loop, payoff: { name: 'Aetherflux Reservoir', life: 50, damage: 50 } }
      : loop;
  },
  calculator(spec) {
    const payingWithMana = hasStep(spec, 'pay-or-mana');
    const payoff = spec.payoff;
    return {
      category: 'storm-life',
      title: 'How much life you need to go off',
      summary: `Plays the loop step by step. Every payment has to leave you at 1 life or more, and ${payoff?.name ?? 'the payoff'} gains 1 life for each spell cast this turn, the one that triggered it included.`,
      inputs: [STORM, LIFE, ...loopChoices(spec), ...(payingWithMana ? [MANA] : [])],
      compute(values): Result {
        const life = values.numbers.life;
        const inputs = loopInputs(values);
        const needed = stormMinimumLife(spec, inputs);
        const reachable = Number.isFinite(needed);
        const canStart = life >= needed;
        const start = canStart ? life : needed;
        const ready = payoff && reachable ? loopsUntilAbove(spec, inputs, start, payoff.life) : undefined;
        const risingFrom = reachable ? firstRisingLoop(spec, inputs, start) : undefined;
        const manaNeeded = payingWithMana ? manaToGoOff(spec, inputs, life) : undefined;

        const stats: Stat[] = [];
        if (reachable) {
          const firstLoop = lifeTrace(spec, inputs, start, 1);
          const afterSetup = firstLoop.filter((point) => point.x === 0).pop()!.y;
          stats.push({ label: 'Net life, first loop', value: signed(firstLoop[firstLoop.length - 1].y - afterSetup) });
        }
        if (risingFrom && risingFrom > 1) {
          stats.push({ label: 'Life goes up from', value: `Loop ${formatNumber(risingFrom)}` });
        }
        if (payoff && ready !== undefined) {
          stats.push({ label: `Loops until ${payoff.name} can fire`, value: formatNumber(ready) });
        }
        if (manaNeeded !== undefined) {
          stats.push({
            label: 'Mana needed at your life',
            value: `{${manaNeeded}}`,
            mana: { generic: manaNeeded, pips: {} },
          });
        }

        const byStorm: DotChart = {
          kind: 'dots',
          title: 'Minimum life by spells already cast',
          xLabel: 'Spells cast before the loop',
          yLabel: 'Minimum life',
          selects: STORM.key,
          ...sweptDots(STORM, inputs.storm, (storm) => {
            const need = stormMinimumLife(spec, { ...inputs, storm });
            return {
              y: Number.isFinite(need) ? need : 0,
              label: `${plural(storm, 'spell')} cast: ${Number.isFinite(need) ? `${formatNumber(need)} life` : 'out of reach'}`,
              tone: need <= life ? 'good' : 'bad',
            };
          }),
        };
        const charts: Result['charts'] = [byStorm];
        if (reachable) {
          const loops = Math.min(14, Math.max(4, (ready ?? risingFrom ?? 4) + 2));
          const points = lifeTrace(spec, inputs, start, loops);
          const lowest = points.reduce((low, point) => (point.y < low.y ? point : low), points[0]);
          const curve: LineChart = {
            kind: 'line',
            title: `Your life, starting from ${formatNumber(start)}`,
            xLabel: 'Loops',
            yLabel: 'Life',
            points,
            marks: [
              { y: 1, label: 'Lowest you can go', tone: 'bad' },
              ...(payoff ? [{ y: payoff.life + 1, label: `${payoff.name} can fire`, tone: 'good' as const }] : []),
            ],
            summary: `Starting at ${formatNumber(start)} life, your life is lowest at ${formatNumber(lowest.y)} and reaches ${formatNumber(points[points.length - 1].y)} after ${plural(loops, 'loop')}.`,
          };
          charts.push(curve);
        }

        return {
          headline: {
            label: 'Minimum life to start',
            value: formatReachable(needed),
            caption: `with ${plural(inputs.storm, 'spell')} already cast this turn`,
          },
          verdict: canStart
            ? {
                tone: 'good',
                title: 'You can go off',
                detail:
                  payoff && ready !== undefined
                    ? `${payoff.name} can deal its first ${payoff.damage} damage ${ready === 0 ? 'right away' : `after ${plural(ready, 'loop')}`}.`
                    : 'Every step leaves you with at least 1 life.',
              }
            : reachable
              ? moreLife(
                  needed - life,
                  manaNeeded !== undefined
                    ? `Or have {${manaNeeded}} to pay for the steps your life can't cover.`
                    : 'Casting more spells before the loop lowers the requirement.',
                )
              : { tone: 'bad', title: "This loop can't sustain itself" },
          ...(reachable && { meter: { have: life, need: needed, unit: 'life' } }),
          stats,
          charts,
        };
      },
    };
  },
});
