import { useCallback, useEffect, useState } from 'react'
import { loadTimers, saveTimers } from '../../platform/storage'
import type { Timer, TimerMode } from '../../core/timers'
import * as core from '../../core/timers'

/** Five rows is the layout target from the brief, not a hard limit. */
const DEFAULT_ROW_COUNT = 5
const MAX_ROWS = 12

const freshSet = () =>
  Array.from({ length: DEFAULT_ROW_COUNT }, () => core.createTimer())

export function useTimers() {
  const [timers, setTimers] = useState<Timer[]>(
    () => loadTimers() ?? freshSet(),
  )

  // Saved on every change, so a force-quit mid-cook loses nothing.
  useEffect(() => {
    saveTimers(timers)
  }, [timers])

  const update = useCallback((id: string, change: (timer: Timer) => Timer) => {
    setTimers((current) =>
      current.map((timer) => (timer.id === id ? change(timer) : timer)),
    )
  }, [])

  return {
    timers,
    anyRunning: core.anyRunning(timers),
    canAdd: timers.length < MAX_ROWS,
    canRemove: timers.length > 1,

    start: useCallback(
      (id: string) => update(id, (t) => core.start(t, Date.now())),
      [update],
    ),
    pause: useCallback(
      (id: string) => update(id, (t) => core.pause(t, Date.now())),
      [update],
    ),
    reset: useCallback((id: string) => update(id, core.reset), [update]),
    acknowledgeAll: useCallback(() => {
      const now = Date.now()
      setTimers((current) =>
        current.map((timer) =>
          core.isFinished(timer, now) && timer.acknowledgedAt === null
            ? core.acknowledge(timer, now)
            : timer,
        ),
      )
    }, []),
    setLabel: useCallback(
      (id: string, label: string) => update(id, (t) => core.setLabel(t, label)),
      [update],
    ),
    /**
     * Nudge the length by a delta rather than setting an absolute value.
     *
     * The stepper buttons must go through this. Computing the new value in the
     * component reads whatever duration was last rendered, so several taps in
     * the same frame all start from the same number and all but one are lost.
     * Applying the delta inside the state updater makes each tap count.
     */
    adjustDuration: useCallback(
      (id: string, deltaMs: number) =>
        update(id, (t) => core.setDuration(t, t.durationMs + deltaMs)),
      [update],
    ),
    setDuration: useCallback(
      (id: string, ms: number) => update(id, (t) => core.setDuration(t, ms)),
      [update],
    ),
    setMode: useCallback(
      (id: string, mode: TimerMode) => update(id, (t) => core.setMode(t, mode)),
      [update],
    ),
    /**
     * Used by the Guide: name a timer, set its length and start it in one go.
     * Reuses an untouched row if there is one, so looking up three things does
     * not leave a trail of spare timers behind.
     */
    startLabelled: useCallback((label: string, minutes: number) => {
      const now = Date.now()
      const configure = (timer: Timer) =>
        core.start(
          core.setDuration(
            core.setLabel(core.setMode(timer, 'countdown'), label),
            minutes * 60_000,
          ),
          now,
        )
      setTimers((current) => {
        const spare = current.find(
          (t) => t.label === '' && t.runningSince === null && t.accumulatedMs === 0,
        )
        if (spare) {
          return current.map((t) => (t.id === spare.id ? configure(t) : t))
        }
        if (current.length >= MAX_ROWS) return current
        return [...current, configure(core.createTimer())]
      })
    }, []),
    add: useCallback(() => {
      setTimers((current) =>
        current.length >= MAX_ROWS ? current : [...current, core.createTimer()],
      )
    }, []),
    remove: useCallback((id: string) => {
      setTimers((current) =>
        current.length <= 1 ? current : current.filter((t) => t.id !== id),
      )
    }, []),
  }
}
