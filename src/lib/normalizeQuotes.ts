// Typographic quotation marks, as produced by mobile keyboards, word processors and text copied
// from chat clients. They are folded to their ASCII equivalent on input, so that a pasted card name
// such as `Urza’s Saga` matches the plain apostrophe stored in the database, and a pasted query
// such as `card:“breath of”` is understood by the search syntax.
//
// Guillemets (« » ‹ ›) and the backtick are deliberately left alone: guillemets are punctuation in
// their own right rather than a stand-in for a quote, and the backtick is already ASCII.

// “ ” „ ‟ ″ ‶ ❝ ❞ 〝 〞 〟 ＂ ʺ ˮ
const DOUBLE_QUOTES = /[“”„‟″‶❝❞〝〞〟＂ʺˮ]/gu;

// ‘ ’ ‚ ‛ ′ ‵ ❛ ❜ ＇ ʹ ʻ ʼ ʽ ʾ ʿ ˈ ՚ ꞌ
const SINGLE_QUOTES = /[‘’‚‛′‵❛❜＇ʹʻʼʽʾʿˈ՚ꞌ]/gu;

/**
 * Replaces every typographic quotation mark with its ASCII equivalent, leaving the rest untouched.
 * Every replacement is a single character, so the text keeps its length and the caret does not move.
 */
export default function normalizeQuotes(value: string): string {
  return value.replaceAll(DOUBLE_QUOTES, '"').replaceAll(SINGLE_QUOTES, "'");
}
