/**
 * Arran's own spice notes. Pure parsing; the storage call lives in
 * src/platform/notes.ts.
 *
 * These are the one piece of content in the app the user writes themselves,
 * so the parser is deliberately forgiving: it would rather return a partial
 * set of notes than lose all of them to one bad entry.
 */

export type Notes = Record<string, string>

export function serializeNotes(notes: Notes): string {
  return JSON.stringify(notes)
}

export function deserializeNotes(raw: string | null): Notes {
  if (!raw) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {}
  }

  const notes: Notes = {}
  for (const [id, note] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof note === 'string' && note !== '') notes[id] = note
  }
  return notes
}
