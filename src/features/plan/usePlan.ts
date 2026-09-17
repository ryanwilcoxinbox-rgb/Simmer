import { useCallback, useEffect, useState } from 'react'
import { startDish, type Plan } from '../../core/plan'
import { loadPlan, savePlan } from '../../platform/planStorage'

export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(loadPlan)
  useEffect(() => { savePlan(plan) }, [plan])
  return {
    plan,
    save: useCallback((next: Plan) => setPlan(next), []),
    clear: useCallback(() => setPlan(null), []),
    startDish: useCallback((id: string, now: number) => {
      setPlan((current) => current ? startDish(current, id, now) : current)
    }, []),
  }
}
