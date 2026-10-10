import { createContext, useContext, useSyncExternalStore } from 'react';

const SESSION_STORAGE_KEY = 'commander-spellbook-show-spoilers';
// every alias of the spoiler tag, and the featured tabs showing off upcoming sets, unless negated with a leading "-"
const SPOILER_TAG_SEARCH = /(?:^|[\s(])is:["']?(?:spoiler|spoiled|preview|previewed|featured(?:-\d+)?)\b/i;

/* True where unreleased cards are what one came to see: a spoiler combo, or a search for them or for featured ones. */
export const SpoilerContext = createContext(false);

export function searchesForSpoilers(query?: string): boolean {
  return !!query && SPOILER_TAG_SEARCH.test(query);
}

const revealedCards = new Set<string>();
const listeners = new Set<() => void>();
let allRevealed: boolean | undefined;

// sessionStorage access is best-effort: without it, revealing every spoiler lasts until the page is reloaded.
function areAllRevealed(): boolean {
  if (allRevealed === undefined) {
    try {
      allRevealed = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    } catch {
      allRevealed = false;
    }
  }
  return allRevealed;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function revealSpoiler(name: string) {
  revealedCards.add(name);
  notify();
}

export function revealAllSpoilers() {
  allRevealed = true;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  } catch {
    /* see areAllRevealed */
  }
  notify();
}

export function useSpoilerFogged(card?: { name: string; spoiler: boolean }): boolean {
  const name = card?.name ?? '';
  const expected = useContext(SpoilerContext);
  const revealed = useSyncExternalStore(
    subscribe,
    () => areAllRevealed() || revealedCards.has(name),
    () => false,
  );
  return !!card?.spoiler && !expected && !revealed;
}
