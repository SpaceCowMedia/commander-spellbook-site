import type { Input, Result } from './shared/calculator';
import { formatNumber, formatReachable, plural, signed } from './shared/format';
import { LIFE, OPPONENT_LIFE, numberInput } from './shared/inputs';
import {
  LifeLoop,
  drainMinimumLife,
  drainNetPerLoop,
  drainPerOpponent,
  drainRun,
  hasStep,
  lifeAtLoop,
} from './shared/lifeLoop';
import { defineWidget } from './shared/widget';
import { loopChoices, loopInputs, readLifeLoop } from './lifeLoop';

const POINTS = 40;

export const drainLoop = defineWidget<'drain-loop', LifeLoop>('drain-loop', {
  detect: (variant) => readLifeLoop(variant, 'drain'),
  calculator(spec) {
    const inputs: Input[] = [LIFE];
    if ([...spec.setup, ...spec.loop].some((step) => step.kind === 'drain' && step.perOpponent === 'devotion')) {
      inputs.push(numberInput('devotion', 'Your devotion to black', 9));
    }
    if (hasStep(spec, 'extort')) {
      inputs.push(numberInput('extorters', 'Creatures with extort', 8));
    }
    return {
      category: 'drain',
      title: 'Can you drain the table before your life runs out?',
      summary:
        'Plays the loop against every opponent. Every payment has to leave you at 1 life or more, and an opponent who dies stops feeding the drain.',
      inputs: [...inputs, ...loopChoices(spec)],
      opponents: { fields: [OPPONENT_LIFE] },
      compute(values): Result {
        const life = values.numbers.life;
        const lives = values.opponents.map((opponent) => opponent.life);
        const loopValues = loopInputs(values);
        const run = drainRun(spec, loopValues, lives, life);
        const needed = drainMinimumLife(spec, loopValues, lives);
        const dead = run.deaths.filter((death) => death !== null).length;
        const step = Math.max(1, Math.ceil(run.loops / POINTS));
        const points = [];
        for (let n = 0; n <= run.loops; n += step) {
          points.push({ x: n, y: lifeAtLoop(run, n) ?? life });
        }
        if (points[points.length - 1].x !== run.loops && run.loops > 0) {
          points.push({ x: run.loops, y: lifeAtLoop(run, run.loops) ?? life });
        }
        return {
          headline: {
            label: 'Life needed to kill the table',
            value: formatReachable(needed),
            caption: `against ${plural(lives.length, 'opponent')}`,
          },
          verdict:
            run.end === 'table-dead'
              ? { tone: 'good', title: `Every opponent dies in loop ${formatNumber(run.loops)}` }
              : run.end === 'stuck'
                ? {
                    tone: 'bad',
                    title:
                      run.loops > 0
                        ? `You run out of life after ${plural(run.loops, 'loop')}`
                        : "You can't pay for the first loop",
                    detail: dead > 0 ? `${plural(dead, 'opponent')} dead by then.` : 'No opponent dies before that.',
                  }
                : {
                    tone: 'warn',
                    title: 'The loop goes on, but nobody dies',
                    detail: 'With these numbers each loop drains nothing.',
                  },
          ...(Number.isFinite(needed) && { meter: { have: life, need: needed, unit: 'life' } }),
          stats: [
            {
              label: 'Net life per loop',
              value: signed(drainNetPerLoop(spec, loopValues, lives)),
              caption: 'while every opponent is alive',
            },
            { label: 'Each opponent loses', value: `${formatNumber(drainPerOpponent(spec, loopValues))} per loop` },
          ],
          outcomes: run.remaining.map((remaining, i) =>
            run.deaths[i] !== null
              ? { tone: 'good', text: `Dies in loop ${formatNumber(run.deaths[i]!)}` }
              : { tone: 'bad', text: `Survives at ${formatNumber(remaining)}` },
          ),
          charts:
            points.length > 1
              ? [
                  {
                    kind: 'line',
                    title: 'Your life, loop by loop',
                    xLabel: 'Loops',
                    yLabel: 'Life',
                    points,
                    marks: [{ y: 1, label: 'Lowest you can go', tone: 'bad' }],
                    summary: `Your life goes from ${formatNumber(points[0].y)} to ${formatNumber(points[points.length - 1].y)} over ${plural(run.loops, 'loop')}.`,
                  },
                ]
              : undefined,
        };
      },
    };
  },
});
