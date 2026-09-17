/**
 * Matching what someone typed against reference entries.
 *
 * Accents are stripped on both sides, which matters more here than it looks.
 * The BBQ cuts are named as they are sold in Spain, so "Picaña" and "Chuletón"
 * carry marks that nobody types in a hurry with one hand. Searching "picana"
 * has to find it, or the search is worse than no search.
 */

export function normalise(text: string): string {
  return text
    .normalize('NFD')
    // Strip the combining accent marks that NFD just separated out.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * True when every word typed appears somewhere in the given fields.
 *
 * Every word rather than any word, so "chicken breast" narrows to the breast
 * instead of returning every chicken entry plus everything mentioning breast.
 * An empty query matches everything, which is what makes it safe to run the
 * filter unconditionally.
 */
export function matchesQuery(
  query: string,
  fields: readonly (string | undefined)[],
): boolean {
  const terms = normalise(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = fields.filter(Boolean).map((f) => normalise(f!)).join(' ')
  return terms.every((term) => haystack.includes(term))
}
