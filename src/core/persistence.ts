/**
 * Turning timers into text and back again. Pure: it takes and returns
 * strings, so it can be tested without a browser, and the localStorage call
 * itself lives in src/platform/storage.ts.
 *
 * Everything here assumes saved data may be damaged, hand-edited, or written
 * by an older version of the app. A cooking timer that refuses to open
 * because of one bad field is worse than one that quietly drops it.
 */

import type { Timer, TimerMode } from './timers'
import { clampDuration } from './timers'

/** Bump when the saved shape changes, and add a branch to migrate(). */
export const SCHEMA_VERSION = 1

interface SavedState {
  version: number
  timers: Timer[]
}

export function serializeTimers(timers: readonly Timer[]): string {
  const state: SavedState = { version: SCHEMA_VERSION, timers: [...timers] }
  return JSON.stringify(state)
}

const MODES: readonly TimerMode[] = ['countdown', 'stopwatch']

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function nullableNumber(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null
}

/**
 * Validate one saved timer. Returns null if the record is too broken to trust,
 * which makes the caller drop that row rather than the whole set.
 */
function reviveTimer(value: unknown): Timer | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>

  if (typeof raw.id !== 'string' || raw.id === '') return null
  if (typeof raw.mode !== 'string' || !MODES.includes(raw.mode as TimerMode)) {
    return null
  }

  return {
    id: raw.id,
    label: typeof raw.label === 'string' ? raw.label : '',
    mode: raw.mode as TimerMode,
    durationMs: clampDuration(isFiniteNumber(raw.durationMs) ? raw.durationMs : 0),
    accumulatedMs: Math.max(
      0,
      isFiniteNumber(raw.accumulatedMs) ? raw.accumulatedMs : 0,
    ),
    runningSince: nullableNumber(raw.runningSince),
    acknowledgedAt: nullableNumber(raw.acknowledgedAt),
  }
}

/**
 * Read saved timers back. Returns null when there is nothing usable, which
 * the caller treats as "first run" and fills with a fresh set of rows.
 */
export function deserializeTimers(raw: string | null): Timer[] | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) return null
  const state = parsed as Record<string, unknown>

  // Data written by a future version of the app is not safe to guess at.
  if (!isFiniteNumber(state.version) || state.version > SCHEMA_VERSION) {
    return null
  }
  if (!Array.isArray(state.timers)) return null

  const timers = state.timers
    .map(reviveTimer)
    .filter((timer): timer is Timer => timer !== null)

  return timers.length > 0 ? timers : null
}
