import { EstimateBracketResult, Variant } from '@space-cow-media/spellbook-client';

const SESSION_STORAGE_RESULTS_KEY = 'commander-spellbook-combo-finder-results';

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
  format: string;
  results: ResultType;
  bracketInfo: EstimateBracketResult | undefined;
  scrollY: number;
};

export const readResultsCache = (): ResultsCache | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_RESULTS_KEY);
    if (!raw) {
      return null;
    }
    const parsed: ResultsCache = JSON.parse(raw);
    return parsed;
  } catch {
    /* see file header */
    return null;
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
