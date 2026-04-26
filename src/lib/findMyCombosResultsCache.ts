import { EstimateBracketResult, Variant } from '@space-cow-media/spellbook-client';

const SESSION_STORAGE_RESULTS_KEY = 'commander-spellbook-combo-finder-results';

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
    return null;
  }
};

export const mergeResultsCache = (patch: Partial<ResultsCache>): void => {
  try {
    const existing = readResultsCache();
    sessionStorage.setItem(SESSION_STORAGE_RESULTS_KEY, JSON.stringify({ ...existing, ...patch }));
  } catch {
    // sessionStorage is best-effort; if it fails (quota, private mode) the page still works.
  }
};

export const clearResultsCache = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_RESULTS_KEY);
  } catch {
    // ignore
  }
};
