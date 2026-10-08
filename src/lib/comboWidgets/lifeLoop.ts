import { LifeLoopSpec, LifeStep } from './spec';

/*
 * Plays a life loop step by step. Paying or losing life down to 0 loses the game at the next state
 * based action check, before any pending trigger can give it back, so every payment has to leave
 * at least 1 life.
 */

export interface LoopInputs {
  /* spells already cast this turn */
  storm: number;
  devotion: number;
  /* creatures with extort */
  extorters: number;
  /* what pay-x steps pay */
  x: number;
  /* which way the first pay-choice step is paid */
  choice: number;
  /* the opponents' life totals, when the loop should stop once they are all dead */
  opponents: number[];
  /* mana you can spend instead of life on pay-or-mana steps */
  mana: number;
}

/* every loop played, everyone dead, or a step you can't pay for */
export type LoopEnd = 'loops' | 'table-dead' | 'stuck';

export interface LoopRun {
  end: LoopEnd;
  /* loops completed, not counting the setup */
  loops: number;
  /* your life after every step of the traced loops, loop 0 being the setup */
  trace: { loop: number; life: number }[];
  /* your life after the setup (index 0) and after each completed loop */
  loopEnds: number[];
  /* mana spent where the life couldn't be paid */
  manaUsed: number;
  opponents: number[];
  /* the loop each opponent died in, if they did */
  deaths: (number | null)[];
}

interface RunOptions {
  maxLoops: number;
  traceLoops?: number;
}

export function hasStep(spec: Pick<LifeLoopSpec, 'setup' | 'loop'>, kind: LifeStep['kind']): boolean {
  return [...spec.setup, ...spec.loop].some((step) => step.kind === kind);
}

export function runLifeLoop(
  spec: Pick<LifeLoopSpec, 'setup' | 'loop'>,
  inputs: LoopInputs,
  startLife: number,
  { maxLoops, traceLoops = 0 }: RunOptions,
): LoopRun {
  let life = startLife;
  let storm = inputs.storm;
  let manaUsed = 0;
  let firstChoice = true;
  const opponents = [...inputs.opponents];
  const deaths: (number | null)[] = opponents.map(() => null);
  const tracking = opponents.length > 0;
  const trace: LoopRun['trace'] = [{ loop: 0, life }];
  const loopEnds: number[] = [];

  const living = () => opponents.filter((opponent) => opponent > 0).length;
  const drainEach = (amount: number, loop: number) => {
    const alive = living();
    opponents.forEach((opponentLife, i) => {
      if (opponentLife > 0) {
        opponents[i] -= amount;
        if (opponents[i] <= 0) {
          deaths[i] = loop;
        }
      }
    });
    life += amount * alive;
  };

  /* Plays one step; false when it can't be paid without dying. */
  const play = (step: LifeStep, loop: number): boolean => {
    const pay = (amount: number) => {
      if (life - amount < 1) {
        return false;
      }
      life -= amount;
      return true;
    };
    switch (step.kind) {
      case 'pay':
        return pay(step.life);
      case 'pay-x':
        return pay(inputs.x);
      case 'pay-half':
        return pay(Math.ceil(life / 2));
      case 'pay-or-mana':
        if (life - step.life >= 1) {
          life -= step.life;
          return true;
        }
        manaUsed += step.mana;
        return manaUsed <= inputs.mana;
      case 'pay-choice': {
        const option = firstChoice ? step.options[inputs.choice] : undefined;
        firstChoice = false;
        return pay(option?.life ?? Math.max(...step.options.map((o) => o.life)));
      }
      case 'gain':
        life += step.life;
        return true;
      case 'cast':
        storm++;
        return true;
      case 'storm-gain':
        life += storm;
        return true;
      case 'drain':
        drainEach(step.perOpponent === 'devotion' ? inputs.devotion : step.perOpponent, loop);
        return true;
      case 'extort':
        for (let i = 0; i < inputs.extorters; i++) {
          if (!pay(step.life)) {
            return false;
          }
          drainEach(1, loop);
        }
        return true;
    }
  };

  const playAll = (steps: LifeStep[], loop: number): LoopEnd | undefined => {
    for (const step of steps) {
      if (!play(step, loop)) {
        return 'stuck';
      }
      if (loop <= traceLoops) {
        trace.push({ loop, life });
      }
      if (tracking && living() === 0) {
        return 'table-dead';
      }
    }
    return undefined;
  };

  const finish = (end: LoopEnd, loops: number): LoopRun => ({
    end,
    loops,
    trace,
    loopEnds,
    manaUsed,
    opponents,
    deaths,
  });

  const setupEnd = playAll(spec.setup, 0);
  if (setupEnd) {
    return finish(setupEnd, 0);
  }
  loopEnds.push(life);
  for (let loop = 1; loop <= maxLoops; loop++) {
    const end = playAll(spec.loop, loop);
    if (end) {
      return finish(end, end === 'table-dead' ? loop : loop - 1);
    }
    loopEnds.push(life);
  }
  return finish('loops', maxLoops);
}

const LIFE_CAP = 4096;

/* The least life that gets through the loop: forever (maxLoops stands for that), or until the table
   is dead when the opponents are tracked and the goal is to kill them. Infinity when even a huge
   life total isn't enough. */
export function minimumLife(
  spec: Pick<LifeLoopSpec, 'setup' | 'loop'>,
  inputs: LoopInputs,
  maxLoops: number,
  goal: 'survive' | 'kill' = 'survive',
): number {
  const survives = (life: number) => {
    const end = runLifeLoop(spec, inputs, life, { maxLoops }).end;
    return goal === 'kill' ? end === 'table-dead' : end !== 'stuck';
  };
  if (!survives(LIFE_CAP)) {
    return Infinity;
  }
  let low = 1;
  let high = LIFE_CAP;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (survives(middle)) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }
  return low;
}
