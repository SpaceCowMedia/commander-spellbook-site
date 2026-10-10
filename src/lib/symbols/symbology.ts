import symbology from 'assets/symbology.json';

export type CardSymbol = (typeof symbology)[number];

const SEPARATOR = /[/\\]/;

function sortedParts(code: string): string {
  return (SEPARATOR.test(code) ? code.split(SEPARATOR) : [...code]).sort().join('/');
}

const symbolsByCode = new Map<string, CardSymbol>();
const hybridSymbolsByParts = new Map<string, CardSymbol>();
symbology.forEach((symbol) => {
  const code = symbol.symbol.slice(1, -1);
  symbolsByCode.set(code, symbol);
  symbolsByCode.set(symbol.file.replace(/\.svg$/, ''), symbol);
  if (SEPARATOR.test(code)) {
    hybridSymbolsByParts.set(sortedParts(code), symbol);
  }
});

/* Hybrid halves may come in any order and without slashes, so W/P, WP and P/W are the same symbol,
   while PW stays the planeswalker symbol. */
export function findCardSymbol(code: string): CardSymbol | undefined {
  const upperCode = code.toUpperCase();
  return symbolsByCode.get(upperCode) ?? hybridSymbolsByParts.get(sortedParts(upperCode));
}

export function getCardSymbolUrl(symbol: CardSymbol): string {
  return `/images/scryfall/symbols/${symbol.file}`;
}
