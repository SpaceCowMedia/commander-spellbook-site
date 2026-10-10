/* Mana costs as counts, so that a billion green pips is one number rather than a billion symbols. */
export interface ManaCost {
  generic: number;
  /* every non numeric symbol with how many of it, in the order first written: "G", "B/P", "X"... */
  pips: Record<string, number>;
}

const SYMBOL = /\{([^}]+)\}/g;
const ONLY_SYMBOLS = /^(\s*\{[^}]+\}\s*)+$/;
const VARIABLE = new Set(['X', 'Y', 'Z']);
const LONGEST_RUN = 8;

/* A cost made only of symbols, or null for anything with words in it. */
export function parseMana(text: string): ManaCost | null {
  if (!ONLY_SYMBOLS.test(text)) {
    return null;
  }
  const cost: ManaCost = { generic: 0, pips: {} };
  for (const [, symbol] of text.matchAll(SYMBOL)) {
    const upper = symbol.toUpperCase();
    if (/^\d+$/.test(upper)) {
      cost.generic += Number(upper);
    } else {
      cost.pips[upper] = (cost.pips[upper] ?? 0) + 1;
    }
  }
  return cost;
}

export function addMana(a: ManaCost, b: ManaCost): ManaCost {
  const pips = { ...a.pips };
  for (const [symbol, count] of Object.entries(b.pips)) {
    pips[symbol] = (pips[symbol] ?? 0) + count;
  }
  return { generic: a.generic + b.generic, pips };
}

export function scaleMana(cost: ManaCost, times: number): ManaCost {
  const n = Math.max(0, Math.floor(times));
  const pips: Record<string, number> = {};
  if (n > 0) {
    for (const [symbol, count] of Object.entries(cost.pips)) {
      pips[symbol] = count * n;
    }
  }
  return { generic: cost.generic * n, pips };
}

/* A reduction removes matching pips first. Whatever it can't match comes off the generic part,
   so "{2}" minus "{1}{G}{G}" is "{0}" rather than a negative green pip. */
export function subtractMana(cost: ManaCost, reduction: ManaCost): ManaCost {
  const matched = (symbol: string) => Math.min(cost.pips[symbol] ?? 0, reduction.pips[symbol] ?? 0);
  const pips: Record<string, number> = {};
  for (const [symbol, count] of Object.entries(cost.pips)) {
    if (count > matched(symbol)) {
      pips[symbol] = count - matched(symbol);
    }
  }
  const unmatched = Object.entries(reduction.pips).reduce(
    (total, [symbol, count]) => total + count - matched(symbol),
    0,
  );
  return { generic: Math.max(0, cost.generic - reduction.generic - unmatched), pips };
}

/* X counts as 0, like on a card in any zone but the stack. */
export function manaValue(cost: ManaCost): number {
  return Object.entries(cost.pips).reduce(
    (total, [symbol, count]) => (VARIABLE.has(symbol) ? total : total + count),
    cost.generic,
  );
}

export function isFree(cost: ManaCost): boolean {
  return cost.generic === 0 && Object.keys(cost.pips).length === 0;
}

export interface ManaRun {
  symbol: string;
  count: number;
}

/* The symbols to draw, one by one, except a pip that repeats too often to write out, which comes
   as a single run like {G} × 1,000,000. */
export function manaRuns(cost: ManaCost): ManaRun[] {
  const generic = cost.generic > 0 || isFree(cost) ? [{ symbol: String(cost.generic), count: 1 }] : [];
  const pips = Object.entries(cost.pips).flatMap(([symbol, count]) =>
    count <= LONGEST_RUN ? Array.from({ length: count }, () => ({ symbol, count: 1 })) : [{ symbol, count }],
  );
  return [...generic, ...pips];
}

/* "{3}{G}{G}", or "{G} × 1,000,000" when a pip repeats too often to write out. */
export function formatMana(cost: ManaCost): string {
  return manaRuns(cost)
    .map(({ symbol, count }) => (count === 1 ? `{${symbol}}` : ` {${symbol}} × ${count.toLocaleString('en-US')} `))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
