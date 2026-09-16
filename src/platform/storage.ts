/**
 * The only place in the app that touches localStorage. Swap this file for
 * AsyncStorage and the rest of the app would not notice.
 *
 * Every call is wrapped, because localStorage throws rather than returning an
 * error in several real situations: Safari private browsing, a full quota, and
 * sites where the user has blocked storage. None of those should stop a timer
 * from running, so a failed save is swallowed and the app carries on with its
 * in-memory state.
 */

import type { Timer } from '../core/timers'
import { deserializeTimers, serializeTimers } from '../core/persistence'

const STORAGE_KEY = 'simmer.timers.v1'

export function loadTimers(): Timer[] | null {
  try {
    return deserializeTimers(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function saveTimers(timers: readonly Timer[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeTimers(timers))
  } catch {
    // Nothing useful to do here. Losing the ability to restore after a
    // force-quit is bad, but it must not interrupt a timer that is running.
  }
}
