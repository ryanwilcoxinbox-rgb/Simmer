import { useCallback, useEffect, useState } from 'react'
import * as core from '../../core/plan'
import type { Plan } from '../../core/plan'
import { loadPlan, savePlan } from '../../platform/planStorage'

const MAX_DISHES = 8

export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(loadPlan)

  useEffect(() => {
    savePlan(plan)
  }, [plan])

  const edit = useCallback((change: (plan: Plan) => Plan) => {
    setPlan((current) => (current === null ? current : change(current)))
  }, [])

  /*
   * For edits that change what is achievable. Setting the chicken to 40
   * minutes when you had asked to eat in 20 should move dinner, not make every
   * dish instantly overdue and set the app chiming at someone who is still
   * filling in the form.
   *
   * Deliberately not applied to label edits or to the passage of time: a
   * mealtime that quietly slides whenever you run late would hide the fact
   * that you are running late, which is the one thing the plan is for.
   */
  const editAndClamp = useCallback(
    (change: (plan: Plan) => Plan) =>
      edit((current) => core.clampReadyAt(change(current), Date.now())),
    [edit],
  )

  return {
    plan,
    canAddDish: plan !== null && plan.dishes.length < MAX_DISHES,

    /** Start a fresh plan, defaulting to eating as soon as possible. */
    create: useCallback((now: number) => {
      const dishes = [core.createDish('', 20 * 60_000)]
      setPlan({ readyAt: core.earliestReadyAt(dishes, now), dishes })
    }, []),

    clear: useCallback(() => setPlan(null), []),

    addDish: useCallback(
      () =>
        editAndClamp((current) =>
          current.dishes.length >= MAX_DISHES
            ? current
            : core.addDish(current, core.createDish('', 10 * 60_000)),
        ),
      [editAndClamp],
    ),

    // Removing a dish can only ever make the meal easier, so no clamp.
    removeDish: useCallback(
      (id: string) => edit((current) => core.removeDish(current, id)),
      [edit],
    ),

    setDishLabel: useCallback(
      (id: string, label: string) =>
        edit((current) => core.updateDish(current, id, { label })),
      [edit],
    ),

    /**
     * Nudge a cook time by a delta inside the updater, for the same reason the
     * timer steppers do: several taps in one frame must all count.
     */
    adjustDishCook: useCallback(
      (id: string, deltaMs: number) =>
        editAndClamp((current) => {
          const dish = current.dishes.find((d) => d.id === id)
          if (!dish) return current
          return core.updateDish(current, id, { cookMs: dish.cookMs + deltaMs })
        }),
      [editAndClamp],
    ),

    adjustReadyAt: useCallback(
      (deltaMs: number) =>
        editAndClamp((current) =>
          core.setReadyAt(current, current.readyAt + deltaMs),
        ),
      [editAndClamp],
    ),

    /** Reset the mealtime to the soonest it could possibly be. */
    readyAsSoonAsPossible: useCallback(
      (now: number) =>
        edit((current) =>
          core.setReadyAt(current, core.soonestReadyAt(current, now)),
        ),
      [edit],
    ),

    startDish: useCallback(
      (id: string, now: number) =>
        edit((current) => core.startDish(current, id, now)),
      [edit],
    ),
  }
}
