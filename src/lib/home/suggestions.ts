import type { SpellbookIcon } from 'components/ui/Icon/Icon';

const SESSION_STORAGE_SHOWN_KEY = 'commander-spellbook-suggestions-shown';

export interface SuggestionContext {
  loggedIn: boolean;
}

export interface Suggestion {
  id: string;
  icon: SpellbookIcon;
  title: string;
  message: string;
  href: string;
  action: string;
  chance: (_context: SuggestionContext) => number;
}

function suggestionsShown(): number {
  try {
    return Number(sessionStorage.getItem(SESSION_STORAGE_SHOWN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function rememberSuggestionShown(): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_SHOWN_KEY, `${suggestionsShown() + 1}`);
  } catch {
    // sessionStorage is best-effort: without it, suggestions keep their full chance for the whole session
  }
}

// Every suggestion shown in the session halves the chance of the next one, whatever its kind.
export function pickSuggestion(suggestions: Suggestion[], context: SuggestionContext): Suggestion | null {
  const decay = 0.5 ** suggestionsShown();
  const winners = suggestions.filter((suggestion) => Math.random() < suggestion.chance(context) * decay);
  return winners.length > 0 ? winners[Math.floor(Math.random() * winners.length)] : null;
}
