const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SCIENTIFIC_FROM = 1e12;
const LONGEST_SUPERSCRIPT = 6;

function exponent(value: number): string {
  const digits = String(value);
  return digits.length <= LONGEST_SUPERSCRIPT
    ? digits.replace(/\d/g, (digit) => SUPERSCRIPT_DIGITS[Number(digit)])
    : `^${value.toLocaleString('en-US')}`;
}

/* 2.42 × 10²⁴ for a number given as its base 10 logarithm, so it can be far beyond what a double holds */
export function formatPowerOfTen(log10: number): string {
  let power = Math.floor(log10);
  let mantissa = 10 ** (log10 - power);
  if (mantissa >= 9.995) {
    mantissa = 1;
    power++;
  }
  return `${mantissa.toFixed(2)} × 10${exponent(power)}`;
}

/* 1,234 or, past a trillion, 2.42 × 10²⁴ */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? '∞' : '-∞';
  }
  if (Math.abs(value) < SCIENTIFIC_FROM) {
    return Math.round(value).toLocaleString('en-US');
  }
  return `${value < 0 ? '-' : ''}${formatPowerOfTen(Math.log10(Math.abs(value)))}`;
}

const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/* 9,999, 12K, 3.4M: short enough for an axis or the top of a bar */
export function formatCompact(value: number): string {
  const size = Math.abs(value);
  return size < 10_000 || size >= SCIENTIFIC_FROM || !Number.isFinite(value)
    ? formatNumber(value)
    : COMPACT.format(value);
}

/* A positive number given as its logarithm, written out while it is small enough */
export function formatLog10(log10: number): string {
  return log10 < Math.log10(SCIENTIFIC_FROM) ? formatNumber(10 ** log10) : formatPowerOfTen(log10);
}

export function formatReachable(value: number): string {
  return Number.isFinite(value) ? formatNumber(value) : 'Out of reach';
}

const MOST_DECIMALS = 4;

/* 76% or 5.3%, and with decimals to spare as many of them as the chance has: 76.47%, 77.5%, 80% */
export function formatPercent(probability: number, decimals = 0): string {
  if (probability >= 1) {
    return '100%';
  }
  if (probability <= 0) {
    return '0%';
  }
  const percent = probability * 100;
  const fewest = percent >= 10 ? 0 : 1;
  const most = Math.max(fewest, decimals);
  const shown = Math.max(1, most);
  const smallest = 10 ** -shown;
  if (percent >= 100 - smallest / 2) {
    return `>${(100 - smallest).toFixed(shown)}%`;
  }
  if (percent < smallest / 2) {
    return `<${smallest.toFixed(shown)}%`;
  }
  return `${percent.toLocaleString('en-US', { minimumFractionDigits: fewest, maximumFractionDigits: most })}%`;
}

/* The fewest decimals, up to four, at which each chance reads differently from the one before it.
   A run that stays level takes all four. */
export function decimalsToTellApart(chances: number[]): number {
  let decimals = 0;
  while (
    decimals < MOST_DECIMALS &&
    chances.some((chance, i) => i > 0 && formatPercent(chance, decimals) === formatPercent(chances[i - 1], decimals))
  ) {
    decimals++;
  }
  return decimals;
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

export function signed(value: number): string {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
