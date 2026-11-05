import type { Input, Result } from './shared/calculator';
import { formatNumber, formatReachable, plural, signed } from './shared/format';
import { LIFE, OPPONENT_LIFE, numberInput } from './shared/inputs';
import {
  LifeLoop,
  drainCannotRunOut,
  drainMinimumLife,
  drainNetPerLoop,
  drainPerOpponent,
  drainRun,
  hasStep,
  lifeAtLoop,
  lifePage,
} from './shared/lifeLoop';
import { defineWidget } from './shared/widget';
import { loopChoices, loopInputs, readLifeLoop } from './lifeLoop';

/* the most loops the chart of a long run shows */
const POINTS = 24;
/* from how many loops a run also gets a chart loop by loop */
const LONG_RUN = 12;
const LOWEST = [{ y: 1, label: 'Lowest you can go', tone: 'bad' as const }];

export const drainLoop = defineWidget<'drain-loop', LifeLoop>('drain-loop', {
  /* a loop your life can't run out in leaves nothing to work out */
  detect: (variant) => {
    const loop = readLifeLoop(variant, 'drain');
    return loop && !drainCannotRunOut(loop) && loop;
  },
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
        const every = Math.max(1, Math.ceil(run.loops / POINTS));
        const loops = [];
        for (let n = 0; n <= run.loops; n += every) {
          loops.push(n);
        }
        if (loops[loops.length - 1] !== run.loops && run.loops > 0) {
          loops.push(run.loops);
        }
        const dots = loops.map((n) => {
          const at = lifeAtLoop(run, n) ?? life;
          return {
            x: n,
            y: at,
            label: `${n === 0 ? 'To start' : `Loop ${formatNumber(n)}`}: ${formatNumber(at)} life`,
          };
        });
        const steps = lifePage(spec, loopValues, life, values.page ?? 0, { lives, checked: true });
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
          charts: [
            ...(steps.dots.length > 1
              ? [{ title: 'Your life, step by step', xLabel: 'Step', marks: LOWEST, ...steps }]
              : []),
            ...(run.loops > LONG_RUN && dots.length > 1
              ? [{ title: 'Your life, loop by loop', xLabel: 'Loop', marks: LOWEST, dots }]
              : []),
          ],
        };
      },
    };
  },
});
