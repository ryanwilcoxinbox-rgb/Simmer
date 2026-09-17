import type { Plan, PlanDish } from './plan'
import { createTimer, DEFAULT_DURATION_MS, elapsedMs, start, type Timer } from './timers'

/** Dish IDs are timer IDs: one durable link, preserved by both existing stores. */
export function startPlannedTimer(timers: readonly Timer[], dish: PlanDish, now: number): Timer[] {
  if (timers.some((timer) => timer.id === dish.id)) return [...timers]
  const next = start(createTimer({ id: dish.id, label: dish.label || 'Dish', durationMs: dish.cookMs }), now)
  const spare = timers.findIndex((timer) => timer.label === '' && timer.mode === 'countdown' && timer.durationMs === DEFAULT_DURATION_MS && timer.runningSince === null && timer.accumulatedMs === 0)
  if (spare >= 0) return timers.map((timer, index) => index === spare ? next : timer)
  // A saved meal must still start when all manual slots are occupied.
  // Plans are limited to eight dishes; manual Add remains limited to twelve rows.
  return [...timers, next]
}

/** Read timing from the actual countdown, including pauses, edits and resets. */
export function connectedPlan(plan: Plan | null, timers: readonly Timer[], now: number): Plan | null {
  if (!plan) return null
  return { ...plan, dishes: plan.dishes.map((dish) => {
    const timer = timers.find((item) => item.id === dish.id)
    if (!timer) return dish
    const elapsed = elapsedMs(timer, now)
    return { ...dish, label: timer.label, cookMs: timer.durationMs,
      startedAt: timer.runningSince === null && elapsed === 0 ? null : now - elapsed }
  }) }
}
