import { useMemo, useState, type ReactNode } from 'react'
import { usePlan } from './usePlan'
import { PlanContext } from './planStore'

/**
 * The meal plan lives above the tab bar for the same reason the timers do: the
 * safeguards that watch it have to keep running whichever screen is showing.
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const plan = usePlan()
  const [editorOpen, setEditorOpen] = useState(false)
  const value = useMemo(
    () => ({ ...plan, editorOpen, setEditorOpen }),
    [plan, editorOpen],
  )
  return <PlanContext value={value}>{children}</PlanContext>
}
