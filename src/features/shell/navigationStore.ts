import { createContext, useContext } from 'react'

export type TabId = 'timers' | 'guide' | 'spices' | 'settings'

/**
 * Lets a screen send the user to another tab. The Guide needs it: starting a
 * timer from a meat entry should drop you on the Timers screen watching it
 * run, not leave you wondering whether anything happened.
 */
export const NavigationContext = createContext<{ goTo: (tab: TabId) => void } | null>(
  null,
)

export function useNavigation() {
  const value = useContext(NavigationContext)
  if (!value) throw new Error('useNavigation must be used inside the app shell')
  return value
}
