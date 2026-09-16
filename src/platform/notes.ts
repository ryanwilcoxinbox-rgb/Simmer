import { deserializeNotes, serializeNotes, type Notes } from '../core/notes'

const STORAGE_KEY = 'simmer.spiceNotes.v1'

export function loadNotes(): Notes {
  try {
    return deserializeNotes(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return {}
  }
}

export function saveNotes(notes: Notes): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeNotes(notes))
  } catch {
    // Storage blocked or full. The note stays on screen for this session.
  }
}
