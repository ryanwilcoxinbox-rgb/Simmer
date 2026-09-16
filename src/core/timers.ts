/**
 * Timer logic. Pure TypeScript: no React, no browser APIs, no clock reads.
 *
 * Every function that needs the current time takes it as a `now` argument
 * instead of calling Date.now() itself. That keeps this file testable (a test
 * can say "pretend it is ten minutes later" without waiting) and keeps the
 * single source of truth for the clock in the UI layer.
 *
 * Nothing here ever counts down. A timer stores how much time it has already
 * banked plus the timestamp its current run began, and every readout is
 * recalculated from those two numbers. That is what makes the app survive iOS
 * freezing the page: when it thaws, the sum is simply correct again.
 */

export type TimerMode = 'countdown' | 'stopwatch'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface Timer {
  id: string
  label: string
  mode: TimerMode
  /** Target length of a countdown, in milliseconds. Unused by stopwatches. */
  durationMs: number
  /** Time banked by previous runs, in milliseconds. */
  accumulatedMs: number
  /** Timestamp this run started, or null when the timer is not running. */
  runningSince: number | null
  /** Set once the finished alarm has been acknowledged. Used from Milestone 3. */
  acknowledgedAt: number | null
}

export const DEFAULT_DURATION_MS = 5 * 60_000

/** Longest countdown we accept: 24 hours. Guards against silly input. */
export const MAX_DURATION_MS = 24 * 60 * 60_000

export function createTimer(options: Partial<Timer> = {}): Timer {
  return {
    id: options.id ?? crypto.randomUUID(),
    label: options.label ?? '',
    mode: options.mode ?? 'countdown',
    durationMs: clampDuration(options.durationMs ?? DEFAULT_DURATION_MS),
    accumulatedMs: options.accumulatedMs ?? 0,
    runningSince: options.runningSince ?? null,
    acknowledgedAt: options.acknowledgedAt ?? null,
  }
}

export function clampDuration(ms: number): number {
  if (!Number.isFinite(ms)) return 0
  return Math.min(Math.max(0, Math.round(ms)), MAX_DURATION_MS)
}

/** Total time this timer has run, banked plus the current run. */
export function elapsedMs(timer: Timer, now: number): number {
  const currentRun = timer.runningSince === null ? 0 : now - timer.runningSince
  // A backwards clock jump could make the current run negative; ignore that
  // rather than letting the readout go into reverse.
  return timer.accumulatedMs + Math.max(0, currentRun)
}

/**
 * Time left on a countdown. Deliberately signed: once a timer overruns this
 * goes negative, which is how Milestone 3 will say "finished 3 minutes ago".
 * Always 0 for a stopwatch, which has nothing to count towards.
 */
export function remainingMs(timer: Timer, now: number): number {
  if (timer.mode === 'stopwatch') return 0
  return timer.durationMs - elapsedMs(timer, now)
}

/** A countdown that has reached or passed its target. Stopwatches never finish. */
export function isFinished(timer: Timer, now: number): boolean {
  return timer.mode === 'countdown' && remainingMs(timer, now) <= 0
}

export function statusOf(timer: Timer, now: number): TimerStatus {
  if (isFinished(timer, now)) return 'finished'
  if (timer.runningSince !== null) return 'running'
  return timer.accumulatedMs > 0 ? 'paused' : 'idle'
}

/**
 * The wall-clock time a running countdown will finish, or null if that is not
 * a meaningful question (paused, idle, or a stopwatch).
 */
export function endsAt(timer: Timer): number | null {
  if (timer.mode === 'stopwatch' || timer.runningSince === null) return null
  return timer.runningSince + (timer.durationMs - timer.accumulatedMs)
}

/** Start or resume. Starting an already-running timer changes nothing. */
export function start(timer: Timer, now: number): Timer {
  // Checked before the running guard on purpose: a countdown that has passed
  // its finish line is still technically running (that is how we know how far
  // it has overrun), so the guard below would otherwise swallow the restart.
  if (isFinished(timer, now)) {
    return { ...timer, accumulatedMs: 0, runningSince: now, acknowledgedAt: null }
  }
  if (timer.runningSince !== null) return timer
  return { ...timer, runningSince: now }
}

/** Pause and bank the current run. Pausing a stopped timer changes nothing. */
export function pause(timer: Timer, now: number): Timer {
  if (timer.runningSince === null) return timer
  return {
    ...timer,
    accumulatedMs: elapsedMs(timer, now),
    runningSince: null,
  }
}

/** Back to the starting line, keeping the label, mode and target duration. */
export function reset(timer: Timer): Timer {
  return { ...timer, accumulatedMs: 0, runningSince: null, acknowledgedAt: null }
}

export function acknowledge(timer: Timer, now: number): Timer {
  return { ...timer, acknowledgedAt: now }
}

export function setLabel(timer: Timer, label: string): Timer {
  return { ...timer, label }
}

/**
 * Change the target duration. Safe to call mid-run: the timer keeps running
 * and simply aims at a different finish line.
 */
export function setDuration(timer: Timer, durationMs: number): Timer {
  return { ...timer, durationMs: clampDuration(durationMs) }
}

/**
 * Switch between countdown and stopwatch. This resets progress, because
 * elapsed time means a different thing in each mode and carrying it over
 * would produce a nonsense readout.
 */
export function setMode(timer: Timer, mode: TimerMode): Timer {
  if (mode === timer.mode) return timer
  return reset({ ...timer, mode })
}

/** True when any timer is running, which Milestone 3 uses to hold the wake lock. */
export function anyRunning(timers: readonly Timer[]): boolean {
  return timers.some((timer) => timer.runningSince !== null)
}
