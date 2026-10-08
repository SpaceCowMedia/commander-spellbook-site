import { LifeLoopSpec, LifeStep } from '../spec';
import { LoopInputs, LoopRun, hasStep, minimumLife, runLifeLoop } from '../lifeLoop';
import {
  BarChart,
  Calculator,
  Input,
  LIFE_INPUT,
  LineChart,
  OPPONENT_LIFE,
  Result,
  Stat,
  Values,
  formatNumber,
  numberInput,
  plural,
} from '../calculator';

const STORM_LOOPS = 60;
const DRAIN_LOOPS = 500;
const STORM_CHART = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type PayChoice = Extract<LifeStep, { kind: 'pay-choice' }>;

function sharedInputs(spec: LifeLoopSpec): Input[] {
  const inputs: Input[] = [];
  const choice = [...spec.setup, ...spec.loop].find((step): step is PayChoice => step.kind === 'pay-choice');
  if (choice) {
    inputs.push({
      kind: 'choice',
      key: 'choice',
      label: 'The first time',
      options: choice.options.map((option, index) => ({ value: String(index), label: option.label })),
      initial: '0',
    });
  }
  if (spec.variable) {
    inputs.push({ kind: 'number', ...spec.variable });
  }
  return inputs;
}

function loopInputs(values: Values, opponents: number[]): LoopInputs {
  return {
    storm: values.numbers.storm ?? 0,
    devotion: values.numbers.devotion ?? 0,
    extorters: values.numbers.extorters ?? 0,
    x: values.numbers.x ?? 0,
    choice: Number(values.choices.choice ?? 0),
    opponents,
    mana: values.numbers.mana ?? 0,
  };
}

function signed(value: number): string {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

/* The first loop (1-based) whose end passes the test, comparing with the end of the one before. */
function firstLoopWhere(loopEnds: number[], test: (life: number, previous: number) => boolean): number | undefined {
  const index = loopEnds.findIndex((life, i) => i > 0 && test(life, loopEnds[i - 1]));
  return index > 0 ? index : undefined;
}

/* Your life after every step, with loops on the x axis, up to `loops` loops. */
function lifeCurve(spec: LifeLoopSpec, run: LoopRun, start: number, loops: number): LineChart['points'] {
  const perLoop = Math.max(1, spec.loop.length);
  const stepsSeen = new Map<number, number>();
  const points = [{ x: 0, y: start }];
  for (const { loop, life } of run.trace.slice(1)) {
    const step = (stepsSeen.get(loop) ?? 0) + 1;
    stepsSeen.set(loop, step);
    const x = loop === 0 ? 0 : loop - 1 + step / perLoop;
    if (x <= loops) {
      points.push({ x, y: life });
    }
  }
  return points;
}

function curveSummary(points: LineChart['points']): string {
  const lowest = points.reduce((low, point) => (point.y < low.y ? point : low), points[0]);
  const last = points[points.length - 1];
  return `Starting at ${formatNumber(points[0].y)} life, your life is lowest at ${formatNumber(lowest.y)} and reaches ${formatNumber(last.y)} after ${plural(Math.round(last.x), 'loop')}.`;
}

export function stormLifeLoopCalculator(spec: LifeLoopSpec): Calculator {
  const optionalPayments = hasStep(spec, 'pay-or-mana');
  const payoff = spec.payoff;
  const inputs: Input[] = [
    numberInput('storm', 'Spells you cast this turn before the loop', 0, 40, 0),
    LIFE_INPUT,
    ...sharedInputs(spec),
  ];
  if (optionalPayments) {
    inputs.push(numberInput('mana', 'Mana you can spend instead of life', 0, 40, 0));
  }
  return {
    title: 'How much life you need to go off',
    summary: `Plays the loop step by step. Every payment has to leave you at 1 life or more, and ${payoff?.name ?? 'the payoff'} gains 1 life for each spell cast this turn, the one that triggered it included.`,
    inputs,
    compute(values): Result {
      const life = values.numbers.life;
      const base = loopInputs(values, []);
      const needed = minimumLife(spec, base, STORM_LOOPS);
      const canStart = life >= needed;
      const start = canStart ? life : needed;
      const run = Number.isFinite(start) ? runLifeLoop(spec, base, start, { maxLoops: 40, traceLoops: 40 }) : undefined;
      const loopEnds = run?.loopEnds ?? [];
      const ready = payoff && firstLoopWhere(loopEnds, (end) => end > payoff.life);
      const firstNet = loopEnds.length > 1 ? loopEnds[1] - loopEnds[0] : 0;
      const positiveFrom = firstLoopWhere(loopEnds, (end, previous) => end > previous);
      const withMana = optionalPayments
        ? runLifeLoop(spec, { ...base, mana: Infinity }, life, { maxLoops: STORM_LOOPS })
        : undefined;
      const manaNeeded = withMana?.end === 'loops' ? withMana.manaUsed : undefined;

      const stats: Stat[] = [{ label: 'Net life, first loop', value: signed(firstNet) }];
      if (positiveFrom && positiveFrom > 1) {
        stats.push({ label: 'Life goes up from', value: `Loop ${positiveFrom}` });
      }
      if (ready) {
        stats.push({ label: `Loops until ${payoff!.name} can fire`, value: formatNumber(ready) });
      }
      if (manaNeeded !== undefined) {
        stats.push({ label: 'Mana needed at your life', value: `{${manaNeeded}}`, mana: true });
      }

      const bars: BarChart = {
        kind: 'bars',
        title: 'Minimum life by spells already cast',
        xLabel: 'Spells cast before the loop',
        yLabel: 'Minimum life',
        selects: 'storm',
        bars: STORM_CHART.map((storm) => {
          const need = minimumLife(spec, { ...base, storm }, STORM_LOOPS);
          return {
            x: String(storm),
            y: Number.isFinite(need) ? need : 0,
            label: `${plural(storm, 'spell')} cast: ${Number.isFinite(need) ? `${formatNumber(need)} life` : 'out of reach'}`,
            tone: need <= life ? 'good' : 'bad',
            selected: storm === base.storm,
          };
        }),
      };
      const charts: Result['charts'] = [bars];
      if (run) {
        const points = lifeCurve(spec, run, start, Math.min(14, Math.max(4, (ready ?? positiveFrom ?? 4) + 2)));
        charts.push({
          kind: 'line',
          title: `Your life, starting from ${formatNumber(start)}`,
          xLabel: 'Loops',
          yLabel: 'Life',
          points,
          marks: [
            { y: 1, label: 'Lowest you can go', tone: 'bad' },
            ...(payoff ? [{ y: payoff.life + 1, label: `${payoff.name} can fire`, tone: 'good' as const }] : []),
          ],
          summary: curveSummary(points),
        });
      }

      return {
        headline: {
          label: 'Minimum life to start',
          value: Number.isFinite(needed) ? formatNumber(needed) : 'Out of reach',
          caption: `with ${plural(base.storm, 'spell')} already cast this turn`,
        },
        verdict: canStart
          ? {
              tone: 'good',
              title: 'You can go off',
              detail: ready
                ? `${payoff!.name} can deal its first ${payoff!.damage} damage after ${plural(ready, 'loop')}.`
                : 'Every step leaves you with at least 1 life.',
            }
          : {
              tone: 'bad',
              title: Number.isFinite(needed)
                ? `You need ${formatNumber(needed - life)} more life`
                : "This loop can't sustain itself",
              detail:
                manaNeeded !== undefined
                  ? `Or have {${manaNeeded}} to pay for the steps your life can't cover.`
                  : 'Casting more spells before the loop lowers the requirement.',
            },
        stats,
        charts,
      };
    },
  };
}

/* How much each opponent loses in one loop. */
function drainPerLoop(spec: LifeLoopSpec, devotion: number, extorters: number): number {
  return spec.loop.reduce((total, step) => {
    if (step.kind === 'drain') {
      return total + (step.perOpponent === 'devotion' ? devotion : step.perOpponent);
    }
    return step.kind === 'extort' ? total + extorters : total;
  }, 0);
}

export function drainLoopCalculator(spec: LifeLoopSpec): Calculator {
  const devotion = [...spec.setup, ...spec.loop].some(
    (step) => step.kind === 'drain' && step.perOpponent === 'devotion',
  );
  const extort = hasStep(spec, 'extort');
  const inputs: Input[] = [LIFE_INPUT];
  if (devotion) {
    inputs.push(numberInput('devotion', 'Your devotion to black', 0, 60, 9));
  }
  if (extort) {
    inputs.push(numberInput('extorters', 'Creatures with extort', 0, 60, 8));
  }
  inputs.push(...sharedInputs(spec));
  return {
    title: 'Can you drain the table before your life runs out?',
    summary:
      'Plays the loop step by step against every opponent. Every payment has to leave you at 1 life or more, and an opponent who dies stops feeding the drain.',
    inputs,
    opponents: { fields: [OPPONENT_LIFE] },
    compute(values): Result {
      const life = values.numbers.life;
      const lives = values.opponents.map((opponent) => opponent.life);
      const base = loopInputs(values, lives);
      const run = runLifeLoop(spec, base, life, { maxLoops: DRAIN_LOOPS });
      const needed = minimumLife(spec, base, DRAIN_LOOPS, 'kill');
      const perOpponent = drainPerLoop(spec, base.devotion, base.extorters);
      // One loop against opponents who can't die yet, from enough life to play it
      const sample = runLifeLoop(spec, { ...base, opponents: lives.map(() => Infinity) }, 4096, { maxLoops: 1 });
      const net = sample.loopEnds.length > 1 ? sample.loopEnds[1] - sample.loopEnds[0] : 0;
      const dead = run.deaths.filter((death) => death !== null).length;
      const shown = run.loopEnds.slice(0, 41);
      return {
        headline: {
          label: 'Life needed to kill the table',
          value: Number.isFinite(needed) ? formatNumber(needed) : 'Out of reach',
          caption: `against ${plural(lives.length, 'opponent')}`,
        },
        verdict:
          run.end === 'table-dead'
            ? { tone: 'good', title: `Every opponent dies in loop ${run.loops}` }
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
        stats: [
          { label: 'Net life per loop', value: signed(net), caption: 'while every opponent is alive' },
          { label: 'Each opponent loses', value: `${formatNumber(perOpponent)} per loop` },
        ],
        outcomes: run.opponents.map((remaining, i) =>
          run.deaths[i] !== null
            ? { tone: 'good', text: `Dies in loop ${run.deaths[i]}` }
            : { tone: 'bad', text: `Survives at ${formatNumber(remaining)}` },
        ),
        charts:
          shown.length > 1
            ? [
                {
                  kind: 'line',
                  title: 'Your life, loop by loop',
                  xLabel: 'Loops',
                  yLabel: 'Life',
                  points: shown.map((y, x) => ({ x, y })),
                  marks: [{ y: 1, label: 'Lowest you can go', tone: 'bad' }],
                  summary: `Your life goes from ${formatNumber(shown[0])} to ${formatNumber(shown[shown.length - 1])} over ${plural(shown.length - 1, 'loop')}.`,
                },
              ]
            : undefined,
      };
    },
  };
}
