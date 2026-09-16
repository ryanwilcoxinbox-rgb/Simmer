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
    setLabel: useCallback(
      (id: string, label: string) => update(id, (t) => core.setLabel(t, label)),
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
