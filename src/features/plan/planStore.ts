import { createContext, useContext } from 'react'
import type { usePlan } from './usePlan'

export type PlanValue = ReturnType<typeof usePlan> & {
  /** Whether the plan editor is open, so prompts can hold off while editing. */
  editorOpen: boolean
  setEditorOpen: (open: boolean) => void
}

export const PlanContext = createContext<PlanValue | null>(null)

export function usePlanContext(): PlanValue {
  const value = useContext(PlanContext)
  if (!value) throw new Error('usePlanContext must be used inside PlanProvider')
  return value
}
