// Results that have been renamed. A query using an old name silently returns nothing, so queries
// are rewritten to the current name and the user is redirected there: existing links keep working,
// and the new name shows up in the URL and the search bar instead of the rename being hidden.
//
// Keys are lowercase because the search syntax is case insensitive; values use the canonical
// spelling of the result, so the rewritten query matches what the database actually stores.
const RENAMED_RESULTS: Record<string, string> = {
  'infinite etb': 'Infinite creature ETB',
  'infinite ltb': 'Infinite creature LTB',
  'infinite sacrifice triggers': 'Infinite creature sacrifice triggers',
  'near-infinite etb': 'Near-infinite creature ETB',
  'near-infinite ltb': 'Near-infinite creature LTB',
  'near-infinite sacrifice triggers': 'Near-infinite creature sacrifice triggers',
};

// The `result`/`results` keyword followed by `:` or `=` and a double quoted value. Only the keyword
// and the operator are captured, so any `-`, `all-` or `@` prefix sits outside the match and comes
// through the rewrite untouched. The value allows backslash escapes, matching the search syntax.
const RESULT_TERM = /\bresults?[:=]"(?:\\.|[^"\\])*"/gi;
const RESULT_TERM_VALUE = /"((?:\\.|[^"\\])*)"$/;

/**
 * Returns the current name of a renamed result, or null when the value does not name one.
 *
 * The renames all inserted a word in the middle of a family of results, so they are matched as a
 * prefix: `Infinite ETB for opponents` is renamed along with `Infinite ETB`. The prefix has to be
 * followed by a space to count, so only whole words match, and the rest of the value is kept as the
 * user wrote it.
 */
function renameResult(value: string): string | null {
  const trimmed = value.trim();
  const lowercase = trimmed.toLowerCase();
  for (const [oldName, currentName] of Object.entries(RENAMED_RESULTS)) {
    if (lowercase === oldName) {
      return currentName;
    }
    if (lowercase.startsWith(`${oldName} `)) {
      return `${currentName}${trimmed.slice(oldName.length)}`;
    }
  }
  return null;
}

/**
 * Rewrites every result term naming a renamed result so that it names the current result instead.
 * Returns the query unchanged when it does not mention any of them.
 */
export default function rewriteRenamedResults(query: string): string {
  return query.replace(RESULT_TERM, (term) => {
    const value = RESULT_TERM_VALUE.exec(term);
    if (!value) {
      return term;
    }
    const renamed = renameResult(value[1]);
    return renamed ? term.replace(RESULT_TERM_VALUE, `"${renamed}"`) : term;
  });
}
