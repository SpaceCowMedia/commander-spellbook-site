import { ManaCost, addMana, formatMana, manaValue, parseMana } from 'lib/symbols/mana';
import type { Calculator, Category, Dot, NumberInput } from './calculator';
import { formatSwept, stepDots, stepPage, sweptDots } from './charts';
import { formatNumber } from './format';

/* A loop where every activation makes new permanents and gets mana back for each one that counts
   when the refund resolves, so each activation pays back more than the one before: Mana Echoes,
   Simulacrum Synthesizer, Bag End Banquet. */
export interface Payback {
  /* what each activation costs, the last one again and again */
  costs: string[];
  /* mana back per permanent that counts */
  rate: number;
  /* permanents that count besides the ones you add */
  base: number;
  /* new permanents per activation */
  made: number;
  /* refunds per activation, when it isn't one for each new permanent: one Bag End Banquet copy taps
     for every Food */
  refunds?: number;
  /* mana back from each activation that doesn't grow, like a creature flickered along the way */
  bonus: number;
  /* generic mana each activation also costs once its refunds are in, like an equip cost; only for
     loops that don't stack */
  after?: number;
  /* the refunds are colorless, and each colored pip takes this much of them */
  colorRate: number;
  /* activations can go on the stack above the refunds, which then count more permanents */
  stacks: boolean;
}

export interface Start {
  /* the mana of your own the loop needs */
  mana: ManaCost;
  /* activations before each one pays for the next */
  activations: number;
}

const MOST_ACTIVATIONS = 10_000;
const MOST_MANA = 2 ** 30;

const pipCount = (cost: ManaCost) => Object.values(cost.pips).reduce((total, count) => total + count, 0);

/* the refunds it takes to pay for a cost */
const worthOf = (cost: ManaCost, colorRate: number) =>
  cost.generic + (pipCount(cost) > 0 ? pipCount(cost) * colorRate : 0);

/* when any mana pays for colored costs, the pips are as good as generic */
function costsOf(loop: Payback, extra: number): ManaCost[] {
  return loop.costs.map((text) => {
    const cost = parseMana(text)!;
    return loop.colorRate <= 1
      ? { generic: manaValue(cost) + extra, pips: {} }
      : addMana(cost, { generic: extra, pips: {} });
  });
}

/* The refunds pay generic mana first and colored pips at `colorRate`; your own mana pays the rest. */
function split(cost: ManaCost, refunds: number, colorRate: number) {
  const generic = Math.min(cost.generic, refunds);
  let left = refunds - generic;
  const own: ManaCost = { generic: cost.generic - generic, pips: {} };
  for (const [symbol, count] of Object.entries(cost.pips)) {
    const covered = Math.min(count, Math.floor(left / colorRate));
    left -= covered * colorRate;
    if (count > covered) {
      own.pips[symbol] = count - covered;
    }
  }
  return { refundsLeft: left, own };
}

type Move = { kind: 'pay'; cost: ManaCost; pool: number } | { kind: 'refund' | 'after'; amount: number; pool: number };

/* Activate whenever the mana is there, let one refund resolve when it isn't: refunds only grow
   while they wait. Gives up when it runs dry, or once refunds alone keep the loop going, unless
   `watch` asks to go on for that many moves, telling it each one. */
function run(
  loop: Payback,
  costs: ManaCost[],
  counted: number,
  budget: number,
  watch?: { moves: number; move(move: Move): void },
): Start | undefined {
  const each = loop.refunds ?? loop.made;
  const after = loop.after ?? 0;
  let refunds = 0;
  let left = budget;
  let pending = 0;
  let made = 0;
  let spent: ManaCost = { generic: 0, pips: {} };
  const worth = costs.map((cost) => worthOf(cost, loop.colorRate));
  const refund = () => loop.rate * (loop.base + counted + made);
  let moved = 0;
  const tell = (move: Move) => {
    moved++;
    watch?.move(move);
  };
  for (let activations = 0; activations < MOST_ACTIVATIONS;) {
    const next = Math.min(activations, costs.length - 1);
    const dearest = Math.max(...worth.slice(next));
    const payback = loop.bonus + each * loop.rate * (loop.base + counted + made + loop.made);
    /* from here on every activation pays for the next, and refunds still waiting only add to it */
    if (watch ? moved >= watch.moves : payback >= dearest + after && refunds >= dearest) {
      return { mana: spent, activations };
    }
    const { refundsLeft, own } = split(costs[next], refunds, loop.colorRate);
    if (manaValue(own) <= left) {
      refunds = refundsLeft;
      left -= manaValue(own);
      spent = addMana(spent, own);
      activations++;
      made += loop.made;
      tell({ kind: 'pay', cost: costs[next], pool: left + refunds });
      refunds += loop.bonus;
      if (loop.stacks) {
        pending += each;
        if (loop.bonus > 0) {
          tell({ kind: 'refund', amount: loop.bonus, pool: left + refunds });
        }
      } else {
        refunds += each * refund();
        tell({ kind: 'refund', amount: loop.bonus + each * refund(), pool: left + refunds });
        if (after > 0) {
          const fromRefunds = Math.min(refunds, after);
          if (after - fromRefunds > left) {
            return undefined;
          }
          refunds -= fromRefunds;
          left -= after - fromRefunds;
          spent = addMana(spent, { generic: after - fromRefunds, pips: {} });
          tell({ kind: 'after', amount: after, pool: left + refunds });
        }
      }
    } else if (pending > 0) {
      refunds += refund();
      pending--;
      tell({ kind: 'refund', amount: refund(), pool: left + refunds });
    } else {
      return undefined;
    }
  }
  return undefined;
}

/* The least of your own mana that gets the loop paying for itself, found by bisection since more
   never hurts, or undefined when no amount does. `extra` is generic mana every activation also costs. */
export function startFor(loop: Payback, counted: number, extra = 0): Start | undefined {
  const costs = costsOf(loop, extra);
  let low = 0;
  let high = 1;
  const free = run(loop, costs, counted, 0);
  if (free) {
    return free;
  }
  while (!run(loop, costs, counted, high)) {
    low = high;
    high *= 2;
    if (high > MOST_MANA) {
      return undefined;
    }
  }
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (run(loop, costs, counted, middle)) {
      high = middle;
    } else {
      low = middle;
    }
  }
  return run(loop, costs, counted, high);
}

/* From this many counted creatures on, the first refund to resolve pays for any activation, so what
   comes before it no longer depends on the count. Below that the loops it takes go up and down, so
   the count it settles at is found by walking down, a few steps for loops that stack, whose costs
   are small, and for those that don't, whose first refund is the one that counts. */
export function steadyFrom(loop: Payback, counted: NumberInput, extra = 0): number | undefined {
  const dearest = Math.max(...costsOf(loop, extra).map((cost) => worthOf(cost, loop.colorRate)));
  const settled = Math.max(
    counted.min,
    loop.stacks
      ? Math.ceil(dearest / loop.rate) - loop.base - loop.made
      : Math.ceil((dearest + (loop.after ?? 0) - loop.bonus) / ((loop.refunds ?? loop.made) * loop.rate)) -
          loop.base -
          loop.made,
  );
  if (!(settled <= counted.max)) {
    return undefined;
  }
  const answer = (count: number) => {
    const start = startFor(loop, count, extra);
    return start ? `${formatMana(start.mana)} ${start.activations}` : '';
  };
  const settledAnswer = answer(settled);
  let steady = settled;
  while (steady > counted.min && answer(steady - 1) === settledAnswer) {
    steady--;
  }
  return steady;
}

/* steps on a page of the chart */
const PAGE = 24;

/* Your mana move by move for the first `steps` steps, from what the loop needs to start: down for
   each activation, up as its refunds come in. */
export function manaSteps(
  loop: Payback,
  counted: number,
  extra: number,
  start: Start,
  refunded: string,
  steps = 1 + PAGE,
): Dot[] {
  const { dots, add } = stepDots();
  add(manaValue(start.mana), `To start: ${formatMana(start.mana)}`);
  run(loop, costsOf(loop, extra), counted, manaValue(start.mana), {
    moves: steps - 1,
    move(move) {
      const pool = formatNumber(move.pool);
      add(
        move.pool,
        move.kind === 'pay'
          ? `Pay ${formatMana(move.cost)}: ${pool} left`
          : move.kind === 'refund'
            ? `${refunded} ${formatNumber(move.amount)}: ${pool}`
            : `Pay {${formatNumber(move.amount)}} more: ${pool} left`,
      );
    },
  });
  return dots.slice(0, steps);
}

interface Texts {
  category: Category;
  title: string;
  summary: string;
  /* what you add to the permanents that count */
  counted: NumberInput;
  /* generic mana every activation also costs, set by the player */
  extra?: NumberInput;
  /* what brings the refunds in, like "Mana Echoes adds" */
  refunded: string;
}

export function paybackCalculator(
  loop: Payback,
  { category, title, summary, counted, extra, refunded }: Texts,
): Calculator {
  return {
    category,
    title,
    summary,
    inputs: extra ? [counted, extra] : [counted],
    compute(values) {
      const count = values.numbers[counted.key];
      const more = extra ? values.numbers[extra.key] : 0;
      const start = startFor(loop, count, more);
      const steady = steadyFrom(loop, counted, more);
      const each = addMana(parseMana(loop.costs[loop.costs.length - 1])!, {
        generic: more + (loop.after ?? 0),
        pips: {},
      });
      return {
        headline: start
          ? { label: 'Mana to start', value: formatMana(start.mana), mana: start.mana }
          : { label: 'Mana to start', value: 'Out of reach', caption: 'the refunds never cover a loop' },
        stats: [
          { label: 'Each loop costs', value: formatMana(each), mana: each },
          ...(start ? [{ label: 'Loops before it pays for itself', value: formatNumber(start.activations) }] : []),
        ],
        charts: [
          {
            title: 'Mana to start',
            xLabel: counted.label,
            selects: counted.key,
            steadyFrom: steady,
            ...sweptDots(
              counted,
              count,
              (x) => {
                const at = startFor(loop, x, more);
                return {
                  y: at ? manaValue(at.mana) : 0,
                  label: `${formatSwept(x, steady)}: ${at ? formatMana(at.mana) : 'out of reach'}`,
                  ...(!at && { tone: 'bad' as const }),
                };
              },
              steady,
            ),
          },
          ...(start
            ? [
                {
                  title: 'Your mana, step by step',
                  xLabel: 'Step',
                  ...stepPage((steps) => manaSteps(loop, count, more, start, refunded, steps), values.page ?? 0, PAGE),
                },
              ]
            : []),
        ],
      };
    },
  };
}
