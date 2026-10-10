import type { NumberInput } from './calculator';
import { lowestPassing } from './search';

export type LifeStep =
  /* pay or lose a fixed amount of life */
  | { kind: 'pay'; life: number }
  /* pay life equal to the loop's variable, like the mana value of the creature recast each time */
  | { kind: 'pay-x' }
  /* pay half your life, rounded up */
  | { kind: 'pay-half' }
  /* pay life when you can afford it, mana otherwise ("if needed, activate Treasonous Ogre…") */
  | { kind: 'pay-or-mana'; life: number; mana: number }
  /* the first time, one of several ways to pay; every later time the most expensive one */
  | { kind: 'pay-choice'; options: { label: string; life: number }[] }
  | { kind: 'gain'; life: number }
  /* a spell is cast, so the storm count grows */
  | { kind: 'cast' }
  /* gain life equal to the number of spells cast this turn, like Aetherflux Reservoir */
  | { kind: 'storm-gain' }
  /* each opponent loses this much, and you gain the total */
  | { kind: 'drain'; perOpponent: number | 'devotion' }
  /* every creature with extort pays this much life to drain each opponent for 1 */
  | { kind: 'extort'; life: number };

export interface LifeLoop {
  /* done once, before the repeated steps */
  setup: LifeStep[];
  loop: LifeStep[];
  /* what pay-x steps pay */
  variable?: NumberInput;
}

export interface LoopInputs {
  /* spells already cast this turn */
  storm: number;
  devotion: number;
  /* creatures with extort */
  extorters: number;
  x: number;
  /* which way the first pay-choice step is paid */
  choice: number;
  /* mana pay-or-mana steps can spend instead of life */
  mana: number;
}

export const NO_LOOP_INPUTS: LoopInputs = { storm: 0, devotion: 0, extorters: 0, x: 0, choice: 0, mana: 0 };

/* How many loops stand for "forever" when the life a step pays depends on the life you have */
const HORIZON = 60;

const stepsOf = (loop: LifeLoop) => [...loop.setup, ...loop.loop];

export function hasStep(loop: LifeLoop, kind: LifeStep['kind']): boolean {
  return stepsOf(loop).some((step) => step.kind === kind);
}

function dependsOnLife(loop: LifeLoop): boolean {
  return hasStep(loop, 'pay-half') || hasStep(loop, 'pay-or-mana');
}

/* The first pay-choice differs from every later one, so its loop is played on its own. */
function choiceInFirstLoop(loop: LifeLoop): boolean {
  return !loop.setup.some((step) => step.kind === 'pay-choice') && loop.loop.some((step) => step.kind === 'pay-choice');
}

/* ---------- Playing steps ---------- */

interface Play {
  life: number;
  /* whether a payment has to leave at least 1 life, or life is just an offset from an unknown start */
  checked: boolean;
  storm: number;
  choiceMade: boolean;
  manaUsed: number;
  /* the lowest life right after a payment */
  lowest: number;
  opponents: number[];
  deaths: (number | null)[];
  loop: number;
}

function newPlay(life: number, checked: boolean, inputs: LoopInputs, opponents: number[] = []): Play {
  return {
    life,
    checked,
    storm: inputs.storm,
    choiceMade: false,
    manaUsed: 0,
    lowest: Infinity,
    opponents: [...opponents],
    deaths: opponents.map(() => null),
    loop: 0,
  };
}

const copyPlay = (play: Play): Play => ({ ...play, opponents: [...play.opponents], deaths: [...play.deaths] });

/* Paying down to 0 loses the game at the next state-based action check, before a pending trigger can
   give the life back, so every payment has to leave at least 1 life. */
function pay(play: Play, amount: number): boolean {
  play.life -= amount;
  play.lowest = Math.min(play.lowest, play.life);
  return !play.checked || play.life >= 1;
}

function alive(play: Play): number {
  return play.opponents.filter((remaining) => remaining > 0).length;
}

function drain(play: Play, amount: number): void {
  let drained = 0;
  play.opponents.forEach((remaining, i) => {
    if (remaining > 0) {
      drained++;
      play.opponents[i] = remaining - amount;
      if (play.opponents[i] <= 0) {
        play.deaths[i] = play.loop;
      }
    }
  });
  play.life += amount * drained;
}

/* `count` extort triggers, each paying `life` to drain every opponent for 1, worked out a stretch at a
   time between deaths rather than trigger by trigger. */
function extort(play: Play, life: number, count: number): boolean {
  let left = count;
  while (left > 0) {
    const living = play.opponents.filter((remaining) => remaining > 0);
    const stretch = Math.min(left, living.length > 0 ? Math.min(...living) : Infinity);
    const net = living.length - life;
    const lowest = play.life - life + Math.min(0, (stretch - 1) * net);
    if (play.checked && lowest < 1) {
      const affordable = play.life - life < 1 ? 0 : Math.ceil((play.life - life) / -net);
      play.lowest = Math.min(play.lowest, play.life + affordable * net - life);
      play.opponents = play.opponents.map((remaining) => (remaining > 0 ? remaining - affordable : remaining));
      play.life += affordable * net - life;
      return false;
    }
    play.lowest = Math.min(play.lowest, lowest);
    play.life += stretch * net;
    play.opponents.forEach((remaining, i) => {
      if (remaining > 0) {
        play.opponents[i] = remaining - stretch;
        if (play.opponents[i] <= 0) {
          play.deaths[i] = play.loop;
        }
      }
    });
    left -= stretch;
  }
  return true;
}

function playStep(play: Play, step: LifeStep, inputs: LoopInputs): boolean {
  switch (step.kind) {
    case 'pay':
      return pay(play, step.life);
    case 'pay-x':
      return pay(play, inputs.x);
    case 'pay-half':
      return pay(play, Math.ceil(play.life / 2));
    case 'pay-choice': {
      const most = Math.max(...step.options.map((option) => option.life));
      const chosen = play.choiceMade ? most : (step.options[inputs.choice]?.life ?? most);
      play.choiceMade = true;
      return pay(play, chosen);
    }
    case 'pay-or-mana':
      if (play.life - step.life >= 1) {
        return pay(play, step.life);
      }
      play.manaUsed += step.mana;
      return !play.checked || play.manaUsed <= inputs.mana;
    case 'gain':
      play.life += step.life;
      return true;
    case 'cast':
      play.storm++;
      return true;
    case 'storm-gain':
      play.life += play.storm;
      return true;
    case 'drain':
      drain(play, step.perOpponent === 'devotion' ? inputs.devotion : step.perOpponent);
      return true;
    case 'extort':
      return extort(play, step.life, inputs.extorters);
  }
}

function playSteps(play: Play, steps: LifeStep[], inputs: LoopInputs, afterEach?: () => void): boolean {
  for (const step of steps) {
    const ok = playStep(play, step, inputs);
    afterEach?.();
    if (!ok) {
      return false;
    }
  }
  return true;
}

/* ---------- Storm loops ---------- */

/* The lowest value over whole numbers u ≥ 0 of c0 + c1·u + c2·u², or -Infinity when it falls forever. */
function lowestOfParabola(c0: number, c1: number, c2: number): number {
  if (c2 === 0) {
    return c1 < 0 ? -Infinity : c0;
  }
  const vertex = -c1 / (2 * c2);
  if (vertex <= 0) {
    return c0;
  }
  const at = (u: number) => c0 + c1 * u + c2 * u * u;
  return Math.min(at(Math.floor(vertex)), at(Math.ceil(vertex)));
}

interface Regular {
  /* life after setup and the first loop when it is special, and how many loops that took */
  play: Play;
  loopsDone: number;
  /* the life each step of the next loop adds, and how much more it adds every later loop */
  deltas: number[];
  growth: number[];
  payments: boolean[];
}

/* After the setup (and the first loop when its choice is special), every loop changes your life the
   same way, except that storm gains grow by the number of casts per loop each time. */
function regularLoops(loop: LifeLoop, inputs: LoopInputs, start: number, checked: boolean): Regular | undefined {
  const play = newPlay(start, checked, inputs);
  if (!playSteps(play, loop.setup, inputs)) {
    return undefined;
  }
  let loopsDone = 0;
  if (choiceInFirstLoop(loop)) {
    play.loop = 1;
    if (!playSteps(play, loop.loop, inputs)) {
      return undefined;
    }
    loopsDone = 1;
  }
  const casts = loop.loop.filter((step) => step.kind === 'cast').length;
  const probe = copyPlay(play);
  probe.checked = false;
  const deltas: number[] = [];
  const payments: boolean[] = [];
  for (const step of loop.loop) {
    const before = probe.life;
    playStep(probe, step, inputs);
    deltas.push(probe.life - before);
    payments.push(step.kind.startsWith('pay'));
  }
  const growth = loop.loop.map((step) => (step.kind === 'storm-gain' ? casts : 0));
  return { play, loopsDone, deltas, growth, payments };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/* The least life at the start that gets through the loop forever, or Infinity. */
export function stormMinimumLife(loop: LifeLoop, inputs: LoopInputs): number {
  if (dependsOnLife(loop)) {
    return lowestPassing((life) => survives(loop, inputs, life), 1, 2 ** 52);
  }
  const regular = regularLoops(loop, inputs, 0, false)!;
  const perLoop = sum(regular.deltas);
  const growthPerLoop = sum(regular.growth);
  let lowest = regular.play.lowest;
  let prefix = 0;
  let prefixGrowth = 0;
  regular.deltas.forEach((delta, j) => {
    prefix += delta;
    prefixGrowth += regular.growth[j];
    if (regular.payments[j]) {
      lowest = Math.min(
        lowest,
        lowestOfParabola(regular.play.life + prefix, perLoop + prefixGrowth - growthPerLoop / 2, growthPerLoop / 2),
      );
    }
  });
  return lowest === -Infinity ? Infinity : Math.max(1, 1 - lowest);
}

function survives(loop: LifeLoop, inputs: LoopInputs, life: number): boolean {
  const play = newPlay(life, true, inputs);
  if (!playSteps(play, loop.setup, inputs)) {
    return false;
  }
  for (let i = 1; i <= HORIZON; i++) {
    if (!playSteps(play, loop.loop, inputs)) {
      return false;
    }
  }
  return true;
}

/* Your life after every step, with loops on the x axis: the setup sits at 0 and loop n ends at n. */
export function lifeTrace(
  loop: LifeLoop,
  inputs: LoopInputs,
  start: number,
  loops: number,
): { x: number; y: number }[] {
  const play = newPlay(start, false, inputs);
  const points = [{ x: 0, y: start }];
  playSteps(play, loop.setup, inputs, () => points.push({ x: 0, y: play.life }));
  const perLoop = Math.max(1, loop.loop.length);
  for (let n = 1; n <= loops; n++) {
    let step = 0;
    playSteps(play, loop.loop, inputs, () => points.push({ x: n - 1 + ++step / perLoop, y: play.life }));
  }
  return points;
}

/* The fewest loops after which your life is above `threshold`, or undefined if it never gets there. */
export function loopsUntilAbove(
  loop: LifeLoop,
  inputs: LoopInputs,
  start: number,
  threshold: number,
): number | undefined {
  if (dependsOnLife(loop)) {
    const play = newPlay(start, false, inputs);
    playSteps(play, loop.setup, inputs);
    for (let n = 0; n <= HORIZON; n++) {
      if (play.life > threshold) {
        return n;
      }
      playSteps(play, loop.loop, inputs);
    }
    return undefined;
  }
  const afterSetup = newPlay(start, false, inputs);
  playSteps(afterSetup, loop.setup, inputs);
  if (afterSetup.life > threshold) {
    return 0;
  }
  const regular = regularLoops(loop, inputs, start, false)!;
  if (regular.loopsDone === 1 && regular.play.life > threshold) {
    return 1;
  }
  const perLoop = sum(regular.deltas);
  const growth = sum(regular.growth);
  const lifeAfter = (u: number) => regular.play.life + perLoop * u + (growth * u * (u - 1)) / 2;
  if (lifeAfter(1) > threshold) {
    return regular.loopsDone + 1;
  }
  if (growth === 0 && perLoop <= 0) {
    return undefined;
  }
  /* past its lowest point the life only rises, so the first loop above the threshold comes after it */
  const rising = growth > 0 ? Math.max(1, Math.ceil(0.5 - perLoop / growth)) : 1;
  let high = rising;
  while (lifeAfter(high) <= threshold) {
    high *= 2;
  }
  return regular.loopsDone + lowestPassing((u) => lifeAfter(u) > threshold, rising, high);
}

/* The first loop that ends with more life than it started with, or undefined. */
export function firstRisingLoop(loop: LifeLoop, inputs: LoopInputs, start: number): number | undefined {
  if (dependsOnLife(loop)) {
    const play = newPlay(start, false, inputs);
    playSteps(play, loop.setup, inputs);
    for (let n = 1; n <= HORIZON; n++) {
      const before = play.life;
      playSteps(play, loop.loop, inputs);
      if (play.life > before) {
        return n;
      }
    }
    return undefined;
  }
  const regular = regularLoops(loop, inputs, start, false)!;
  if (regular.loopsDone === 1) {
    const afterSetup = newPlay(start, false, inputs);
    playSteps(afterSetup, loop.setup, inputs);
    if (regular.play.life > afterSetup.life) {
      return 1;
    }
  }
  const perLoop = sum(regular.deltas);
  const growth = sum(regular.growth);
  if (perLoop > 0) {
    return regular.loopsDone + 1;
  }
  return growth > 0 ? regular.loopsDone + Math.floor(-perLoop / growth) + 2 : undefined;
}

/* The mana that pay-or-mana steps need, starting from `start` life, over loops enough to go off. */
export function manaToGoOff(loop: LifeLoop, inputs: LoopInputs, start: number): number | undefined {
  const unlimited = { ...inputs, mana: Infinity };
  const play = newPlay(start, true, unlimited);
  if (!playSteps(play, loop.setup, unlimited)) {
    return undefined;
  }
  for (let n = 1; n <= HORIZON; n++) {
    if (!playSteps(play, loop.loop, unlimited)) {
      return undefined;
    }
  }
  return play.manaUsed;
}

/* ---------- Drain loops ---------- */

export interface DrainRun {
  /* everyone dead, a payment you couldn't make, or a loop that goes on without killing anyone */
  end: 'table-dead' | 'stuck' | 'stalled';
  /* the loops done: the loop the table died in, or the loops completed before getting stuck */
  loops: number;
  remaining: number[];
  /* the loop each opponent died in */
  deaths: (number | null)[];
  /* the lowest life right after a payment, as an offset from the start when the start is unknown */
  lowest: number;
  /* life at the end of each loop, as straight stretches */
  stretches: { from: number; to: number; life: number; perLoop: number }[];
}

function drainPerLoop(steps: LifeStep[], inputs: LoopInputs): number {
  return steps.reduce((total, step) => {
    if (step.kind === 'drain') {
      return total + (step.perOpponent === 'devotion' ? inputs.devotion : step.perOpponent);
    }
    return step.kind === 'extort' ? total + inputs.extorters : total;
  }, 0);
}

/* What one loop does to your life with the opponents alive now, if none of them dies during it. */
function loopProfile(play: Play, steps: LifeStep[], inputs: LoopInputs): { net: number; dip: number } {
  const probe = copyPlay(play);
  probe.checked = false;
  probe.lowest = Infinity;
  probe.opponents = probe.opponents.map((remaining) => (remaining > 0 ? Infinity : remaining));
  const before = probe.life;
  playSteps(probe, steps, inputs);
  return { net: probe.life - before, dip: probe.lowest - before };
}

/* Plays a drain loop until the table is dead. The loops between two deaths are all alike, so they are
   skipped in one go: only the loop where someone dies, or where a payment fails, is played step by
   step. That takes as long for a billion life as for forty. Without a start life, life is an offset
   and payments never fail, which gives the lowest point the loop goes through. */
export function drainRun(loop: LifeLoop, inputs: LoopInputs, lives: number[], start?: number): DrainRun {
  const play = newPlay(start ?? 0, start !== undefined, inputs, lives);
  const stretches: DrainRun['stretches'] = [];
  const finish = (end: DrainRun['end'], loops: number): DrainRun => ({
    end,
    loops,
    remaining: play.opponents,
    deaths: play.deaths,
    lowest: play.lowest,
    stretches,
  });
  const playLoop = (): DrainRun | undefined => {
    const before = play.life;
    play.loop++;
    if (!playSteps(play, loop.loop, inputs)) {
      return finish('stuck', play.loop - 1);
    }
    stretches.push({ from: play.loop - 1, to: play.loop, life: before, perLoop: play.life - before });
    return alive(play) === 0 ? finish('table-dead', play.loop) : undefined;
  };

  if (!playSteps(play, loop.setup, inputs)) {
    return finish('stuck', 0);
  }
  if (alive(play) === 0) {
    return finish('table-dead', 0);
  }
  if (choiceInFirstLoop(loop)) {
    const ended = playLoop();
    if (ended) {
      return ended;
    }
  }
  const perOpponent = drainPerLoop(loop.loop, inputs);
  const alike = !dependsOnLife(loop);
  for (;;) {
    if (!alike) {
      if (play.loop >= HORIZON) {
        return finish('stalled', play.loop);
      }
      const ended = playLoop();
      if (ended) {
        return ended;
      }
      continue;
    }
    const { net, dip } = loopProfile(play, loop.loop, inputs);
    const weakest = Math.min(...play.opponents.filter((remaining) => remaining > 0));
    const beforeDeath = perOpponent > 0 ? Math.floor((weakest - 1) / perOpponent) : Infinity;
    let beforeStuck = Infinity;
    if (play.checked) {
      const low = play.life + dip;
      beforeStuck = low < 1 ? 0 : net < 0 ? Math.ceil(low / -net) : Infinity;
    }
    const skip = Math.min(beforeDeath, beforeStuck);
    if (skip === Infinity) {
      return finish('stalled', play.loop);
    }
    if (skip > 0) {
      stretches.push({ from: play.loop, to: play.loop + skip, life: play.life, perLoop: net });
      play.lowest = Math.min(play.lowest, play.life + dip + Math.min(0, (skip - 1) * net));
      play.life += skip * net;
      play.opponents = play.opponents.map((remaining) => (remaining > 0 ? remaining - skip * perOpponent : remaining));
      play.loop += skip;
    }
    const ended = playLoop();
    if (ended) {
      return ended;
    }
  }
}

/* Your life at the end of a loop of a run, from its stretches. */
export function lifeAtLoop(run: DrainRun, n: number): number | undefined {
  const stretch = run.stretches.find((s) => n >= s.from && n <= s.to);
  return stretch && stretch.life + (n - stretch.from) * stretch.perLoop;
}

/* The least life that kills the whole table, or Infinity when the table never dies. */
export function drainMinimumLife(loop: LifeLoop, inputs: LoopInputs, lives: number[]): number {
  if (dependsOnLife(loop)) {
    return lowestPassing((life) => drainRun(loop, inputs, lives, life).end === 'table-dead', 1, 2 ** 52);
  }
  const run = drainRun(loop, inputs, lives);
  return run.end === 'table-dead' ? Math.max(1, 1 - run.lowest) : Infinity;
}

/* What one loop does to your life while every opponent is alive. */
export function drainNetPerLoop(loop: LifeLoop, inputs: LoopInputs, lives: number[]): number {
  const play = newPlay(0, false, inputs, lives);
  playSteps(play, loop.setup, inputs);
  return loopProfile(play, loop.loop, inputs).net;
}

export function drainPerOpponent(loop: LifeLoop, inputs: LoopInputs): number {
  return drainPerLoop(loop.loop, inputs);
}
