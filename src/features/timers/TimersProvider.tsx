import type { ReactNode } from 'react'
import { useTimers } from './useTimers'
import { TimersContext } from './timersStore'

/**
 * Timer state lives above the tab bar so that the Guide can start a labelled
 * timer and the Timers screen shows it immediately.
 */
export function TimersProvider({ children }: { children: ReactNode }) {
  const timers = useTimers()
  return <TimersContext value={timers}>{children}</TimersContext>
}
