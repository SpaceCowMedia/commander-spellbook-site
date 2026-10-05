import type { Variant } from '@space-cow-media/spellbook-client';

const SESSION_STORAGE_SEEN_KEY = 'commander-spellbook-salt-voting-seen';
const SESSION_STORAGE_RESUME_KEY = 'commander-spellbook-salt-voting-resume';

export function readSeenCombos(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_SEEN_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function rememberSeenCombo(id: string): void {
  try {
    const seen = readSeenCombos();
    seen.add(id);
    sessionStorage.setItem(SESSION_STORAGE_SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // sessionStorage is best-effort: without it, skipped combos can come back within the session
  }
}

// The queue is drawn at random, so the combo shown when leaving to log in is kept to be shown again on return.
export function rememberComboToResume(combo: Variant): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_RESUME_KEY, JSON.stringify(combo));
  } catch {
    // sessionStorage is best-effort: without it, the queue starts from a new combo after logging in
  }
}

export function takeComboToResume(): Variant | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_RESUME_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_RESUME_KEY);
    const combo: Variant | null = stored ? JSON.parse(stored) : null;
    return combo && !readSeenCombos().has(combo.id) ? combo : null;
  } catch {
    return null;
  }
}
