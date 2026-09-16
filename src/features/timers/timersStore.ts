import { createContext, useContext } from 'react'
import type { useTimers } from './useTimers'

export type TimersValue = ReturnType<typeof useTimers>

export const TimersContext = createContext<TimersValue | null>(null)

export function useTimersContext(): TimersValue {
  const value = useContext(TimersContext)
  if (!value) throw new Error('useTimersContext must be used inside TimersProvider')
  return value
}
