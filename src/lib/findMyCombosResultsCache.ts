import { EstimateBracketResult, Variant } from '@space-cow-media/spellbook-client';

const SESSION_STORAGE_RESULTS_KEY = 'commander-spellbook-combo-finder-results';
const DEFAULT_FIND_MY_COMBOS_QUERY = 'legal:commander';

// sessionStorage access is best-effort: every call below swallows errors so that
// quota limits, private-mode restrictions, or malformed entries can't break the page.

export interface ResultType {
  identity: string;
  included: Variant[];
  includedByChangingCommanders: Variant[];
  almostIncluded: Variant[];
  almostIncludedByChangingCommanders: Variant[];
  almostIncludedByAddingColors: Variant[];
  almostIncludedByAddingColorsAndChangingCommanders: Variant[];
}

export type ResultsCache = {
  deckJson: string;
  query: string;
  results: ResultType;
  bracketInfo: EstimateBracketResult | undefined;
  scrollY: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object';

export const readResultsCache = (): ResultsCache | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_RESULTS_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.deckJson !== 'string' || !isRecord(parsed.results)) {
      return null;
    }

    const query =
      typeof parsed.query === 'string'
        ? parsed.query
        : typeof parsed.format === 'string'
          ? `legal:${parsed.format}`
          : DEFAULT_FIND_MY_COMBOS_QUERY;

    return {
      deckJson: parsed.deckJson,
      query,
      results: parsed.results as unknown as ResultType,
      bracketInfo: parsed.bracketInfo as EstimateBracketResult | undefined,
      scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : 0,
    };
  } catch {
    /* see file header */
    return null;
  }
};

export const hasResultsCache = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_RESULTS_KEY) !== null;
  } catch {
    /* see file header */
    return false;
  }
};

export const mergeResultsCache = (patch: Partial<ResultsCache>): void => {
  try {
    const existing = readResultsCache();
    sessionStorage.setItem(SESSION_STORAGE_RESULTS_KEY, JSON.stringify({ ...existing, ...patch }));
  } catch {
    /* see file header */
  }
};

export const clearResultsCache = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_RESULTS_KEY);
  } catch {
    /* see file header */
  }
};
