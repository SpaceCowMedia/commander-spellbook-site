/* Just enough mana arithmetic for costs written as symbols, like "{3}{G}{G}". */

export interface ManaCost {
  generic: number;
  /* every non numeric symbol, in the order it was written: "G", "B/P", "W/B", "C", "X"... */
  symbols: string[];
}

const SYMBOL = /\{([^}]+)\}/g;
const ONLY_SYMBOLS = /^(\s*\{[^}]+\}\s*)+$/;

/* A cost made only of symbols, or null for anything with words in it. */
export function parseMana(text: string): ManaCost | null {
  if (!ONLY_SYMBOLS.test(text)) {
    return null;
  }
  const cost: ManaCost = { generic: 0, symbols: [] };
  for (const [, symbol] of text.matchAll(SYMBOL)) {
    const upper = symbol.toUpperCase();
    if (/^\d+$/.test(upper)) {
      cost.generic += Number(upper);
    } else {
      cost.symbols.push(upper);
    }
  }
  return cost;
}

export function formatMana(cost: ManaCost): string {
  const generic = cost.generic > 0 || cost.symbols.length === 0 ? `{${cost.generic}}` : '';
  return generic + cost.symbols.map((symbol) => `{${symbol}}`).join('');
}

export function addMana(a: ManaCost, b: ManaCost): ManaCost {
  return { generic: a.generic + b.generic, symbols: [...a.symbols, ...b.symbols] };
}

export function scaleMana(cost: ManaCost, times: number): ManaCost {
  const n = Math.max(0, Math.floor(times));
  return { generic: cost.generic * n, symbols: Array.from({ length: n }, () => cost.symbols).flat() };
}

/* A reduction removes matching symbols first. Whatever it can't match comes off the generic part,
   so "{2}" minus "{1}{G}{G}" is "{0}" rather than a negative green pip. */
export function subtractMana(cost: ManaCost, reduction: ManaCost): ManaCost {
  const symbols = [...cost.symbols];
  let generic = cost.generic - reduction.generic;
  for (const symbol of reduction.symbols) {
    const index = symbols.indexOf(symbol);
    if (index >= 0) {
      symbols.splice(index, 1);
    } else {
      generic--;
    }
  }
  return { generic: Math.max(0, generic), symbols };
}

/* X counts as 0, like on a card in any zone but the stack. */
export function manaValue(cost: ManaCost): number {
  return cost.generic + cost.symbols.filter((symbol) => symbol !== 'X' && symbol !== 'Y' && symbol !== 'Z').length;
}
