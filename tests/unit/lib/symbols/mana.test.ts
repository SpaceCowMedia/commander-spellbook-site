import { describe, expect, test } from 'vitest';
import { addMana, formatMana, isFree, manaRuns, manaValue, parseMana, scaleMana, subtractMana } from 'lib/symbols/mana';

const mana = (text: string) => parseMana(text)!;

describe('parseMana', () => {
  test('counts generic mana and each pip', () => {
    expect(parseMana('{3}{G}{G}{B/P}')).toEqual({ generic: 3, pips: { G: 2, 'B/P': 1 } });
  });

  test('rejects costs with words in them', () => {
    expect(parseMana('{2} plus an additional {R}')).toBeNull();
  });
});

describe('arithmetic', () => {
  test('adds and scales counts', () => {
    expect(addMana(mana('{1}{U}{B}'), mana('{2}{U}{B}'))).toEqual({ generic: 3, pips: { U: 2, B: 2 } });
    expect(scaleMana(mana('{2}{U}{B}'), 3)).toEqual({ generic: 6, pips: { U: 3, B: 3 } });
    expect(scaleMana(mana('{2}{U}'), 0)).toEqual({ generic: 0, pips: {} });
  });

  test('scales to a billion without building a billion symbols', () => {
    const cost = scaleMana(mana('{1}{R}'), 1_000_000_000);
    expect(cost).toEqual({ generic: 1_000_000_000, pips: { R: 1_000_000_000 } });
    expect(manaValue(cost)).toBe(2_000_000_000);
  });

  test('takes a reduction off matching pips first and never goes below zero', () => {
    expect(subtractMana(mana('{4}{G}'), mana('{1}{G}'))).toEqual({ generic: 3, pips: {} });
    expect(subtractMana(mana('{2}'), mana('{1}{G}{G}'))).toEqual({ generic: 0, pips: {} });
  });

  test('counts X as zero in the mana value', () => {
    expect(manaValue(mana('{X}{X}{R}'))).toBe(1);
  });
});

describe('manaRuns', () => {
  test('lists symbols one by one and long runs once', () => {
    expect(manaRuns(mana('{2}{G}{G}'))).toEqual([
      { symbol: '2', count: 1 },
      { symbol: 'G', count: 1 },
      { symbol: 'G', count: 1 },
    ]);
    expect(manaRuns({ generic: 0, pips: { R: 9 } })).toEqual([{ symbol: 'R', count: 9 }]);
    expect(manaRuns({ generic: 0, pips: {} })).toEqual([{ symbol: '0', count: 1 }]);
  });
});

describe('formatMana', () => {
  test('writes costs out symbol by symbol', () => {
    expect(formatMana(mana('{3}{G}{G}'))).toBe('{3}{G}{G}');
    expect(formatMana({ generic: 0, pips: {} })).toBe('{0}');
    expect(isFree({ generic: 0, pips: {} })).toBe(true);
  });

  test('writes long runs of a pip once, with a count', () => {
    expect(formatMana({ generic: 2, pips: { G: 1_000_000 } })).toBe('{2} {G} × 1,000,000');
  });
});
