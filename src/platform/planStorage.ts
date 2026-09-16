import type { Plan } from '../core/plan'
import { deserializePlan, serializePlan } from '../core/planPersistence'

const STORAGE_KEY = 'simmer.plan.v1'

export function loadPlan(): Plan | null {
  try {
    return deserializePlan(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function savePlan(plan: Plan | null): void {
  try {
    if (plan === null) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, serializePlan(plan))
  } catch {
    // Storage blocked or full. The plan still works for this session.
  }
}
