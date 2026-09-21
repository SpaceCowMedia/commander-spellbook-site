import { Template } from '@space-cow-media/spellbook-client';
import TemplateReplacementsService from 'services/template-replacements.service';
import { ReplacementsPage } from 'lib/types';

const STORAGE_KEY_PREFIX = 'commander-spellbook-template-replacements:';
/* Bumped when pages change source or size, so older pages are never read back; they keep the
   prefix, so pruning still clears them. */
const STORAGE_KEY_VERSION = 'v7';
const TTL_MS = 24 * 60 * 60 * 1000;
/* A page of replacements trimmed to what a preview shows costs ~190 bytes a card, so even the
   175 card page of a Scryfall query drafted in the submission form stays around 32KB: this keeps
   the cache near 1MB of the origin's storage at its very worst, well clear of the quota the rest of
   the site shares. */
const MAX_ENTRIES = 32;

// localStorage access is best-effort: every call below swallows errors so that quota limits,
// private-mode restrictions, server-side rendering, or malformed entries can't break the page.

interface StoredEntry {
  storedAt: number;
  page: ReplacementsPage;
}

/* Requests still in flight, so that a tooltip, a wheel, a modal and the bracket estimate asking for
   the same page at once share one request instead of racing each other to the cache. */
const pendingPages = new Map<string, Promise<ReplacementsPage>>();

/* The query is part of the key: a template whose query has been edited, or a draft one being
   typed in the submission form, must never be served the replacements of the query it replaced. */
const cacheKey = (template: Template, page: number): string =>
  `${STORAGE_KEY_PREFIX}${STORAGE_KEY_VERSION}:${template.id}:${template.scryfallQuery ?? ''}:${page}`;

const storedKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

const readEntry = (template: Template, page: number): ReplacementsPage | null => {
  try {
    const key = cacheKey(template, page);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const entry: StoredEntry = JSON.parse(raw);
    if (Date.now() - entry.storedAt < TTL_MS) {
      return entry.page;
    }
    localStorage.removeItem(key);
    return null;
  } catch {
    /* see file header */
    return null;
  }
};

/* Drops what has expired, then the oldest of what is left, so that a session spent hovering over
   templates cannot grow the cache without bound. */
const prune = (roomFor: number): void => {
  const living: { key: string; storedAt: number }[] = [];
  storedKeys().forEach((key) => {
    try {
      const entry: StoredEntry = JSON.parse(localStorage.getItem(key) ?? '');
      if (Date.now() - entry.storedAt >= TTL_MS) {
        localStorage.removeItem(key);
      } else {
        living.push({ key, storedAt: entry.storedAt });
      }
    } catch {
      localStorage.removeItem(key);
    }
  });
  living
    .sort((a, b) => a.storedAt - b.storedAt)
    .slice(0, Math.max(0, living.length + roomFor - MAX_ENTRIES))
    .forEach(({ key }) => localStorage.removeItem(key));
};

const writeEntry = (template: Template, page: number, result: ReplacementsPage): void => {
  const entry: StoredEntry = {
    storedAt: Date.now(),
    page: result,
  };
  try {
    prune(1);
    localStorage.setItem(cacheKey(template, page), JSON.stringify(entry));
  } catch {
    /* Out of room (or no storage at all): the memory layer still serves this session. */
    clearTemplateReplacementsCache();
  }
};

export function clearTemplateReplacementsCache(): void {
  try {
    storedKeys().forEach((key) => localStorage.removeItem(key));
  } catch {
    /* see file header */
  }
}

/* The replacements of a template, from memory, then from storage, then from the network. */
export function cachedTemplateReplacements(template: Template, page: number): Promise<ReplacementsPage> {
  const key = cacheKey(template, page);
  const pending = pendingPages.get(key);
  if (pending) {
    return pending;
  }
  const request = (async () => {
    const stored = readEntry(template, page);
    if (stored) {
      return stored;
    }
    const result = await TemplateReplacementsService.templateReplacements(template, page);
    writeEntry(template, page, result);
    return result;
  })().catch((error) => {
    // a failed fetch must not be remembered as the answer: the next hover gets to try again
    pendingPages.delete(key);
    throw error;
  });
  pendingPages.set(key, request);
  return request;
}

export default cachedTemplateReplacements;
