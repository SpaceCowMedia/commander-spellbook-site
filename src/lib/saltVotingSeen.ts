const SESSION_STORAGE_SEEN_KEY = 'commander-spellbook-salt-voting-seen';

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
