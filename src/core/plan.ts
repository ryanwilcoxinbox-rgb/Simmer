/**
 * Working backwards from when you want to eat.
 *
 * The idea: Arran says the chicken takes 40 minutes, the rice 15 and the veg
 * 8, and that he wants to eat at half past. The app works out that the chicken
 * goes on now, the rice at 19:15 and the veg at 19:22, and tells him at each
 * of those moments.
 *
 * Pure, like the rest of src/core: every function takes `now` rather than
 * reading the clock, so the tests can stand at any point in a meal without
 * waiting for it.
 *
 * Note that nothing here starts a timer. A dish is only marked as started when
 * the user says it has, because a timer that starts before the food does is
 * worse than no timer at all.
 */

/** Past this far beyond its slot, a dish is not merely due but late. */
const OVERDUE_AFTER_MS = 60_000

export interface PlanDish {
  id: string
  label: string
  cookMs: number
  /** When the user confirmed the food actually went on. */
  startedAt: number | null
}

export interface Plan {
  /** The moment everything should be ready together. */
  readyAt: number
  dishes: PlanDish[]
}

export type DishStatus = 'waiting' | 'due' | 'overdue' | 'started'

export function createDish(label: string, cookMs: number): PlanDish {
  return {
    id: crypto.randomUUID(),
    label,
    cookMs: Math.max(0, Math.round(cookMs)),
    startedAt: null,
  }
}

/** The moment this dish needs to go on to be ready with everything else. */
export function scheduledStart(dish: PlanDish, plan: Plan): number {
  return plan.readyAt - dish.cookMs
}

export function dishStatus(dish: PlanDish, plan: Plan, now: number): DishStatus {
  if (dish.startedAt !== null) return 'started'
  const start = scheduledStart(dish, plan)
  if (now < start) return 'waiting'
  return now >= start + OVERDUE_AFTER_MS ? 'overdue' : 'due'
}

/** The longest dish, which sets the earliest possible mealtime. */
export function longestCookMs(dishes: readonly PlanDish[]): number {
  return dishes.reduce((longest, dish) => Math.max(longest, dish.cookMs), 0)
}

/**
 * The soonest everything could be ready if the longest dish went on this
 * instant. Asking to eat before this is asking for the impossible.
 */
export function earliestReadyAt(dishes: readonly PlanDish[], now: number): number {
  return now + longestCookMs(dishes)
}

/** Dishes that should be on the heat now and are not. */
export function dueDishes(plan: Plan, now: number): PlanDish[] {
  return plan.dishes.filter((dish) => {
    const status = dishStatus(dish, plan, now)
    return status === 'due' || status === 'overdue'
  })
}

/** Dishes still waiting their turn, soonest first. */
export function upcomingDishes(plan: Plan, now: number): PlanDish[] {
  return plan.dishes
    .filter((dish) => dishStatus(dish, plan, now) === 'waiting')
    .sort((a, b) => scheduledStart(a, plan) - scheduledStart(b, plan))
}

/**
 * When the meal will actually be ready, given what has happened so far.
 *
 * A dish started late drags the whole meal with it, and so does one sitting
 * overdue right now. Telling the truth about that is more useful than holding
 * on to the original plan and quietly being wrong.
 */
export function projectedReadyAt(plan: Plan, now: number): number {
  if (plan.dishes.length === 0) return plan.readyAt
  return plan.dishes.reduce((latest, dish) => {
    const startsAt =
      dish.startedAt ?? Math.max(now, scheduledStart(dish, plan))
    return Math.max(latest, startsAt + dish.cookMs)
  }, 0)
}

/** How far behind the meal has slipped, in milliseconds. Zero when on time. */
export function slippageMs(plan: Plan, now: number): number {
  return Math.max(0, projectedReadyAt(plan, now) - plan.readyAt)
}

export function allStarted(plan: Plan): boolean {
  return plan.dishes.length > 0 && plan.dishes.every((d) => d.startedAt !== null)
}

/* ---- Edits. All return a new plan rather than mutating. ---- */

export function startDish(plan: Plan, id: string, now: number): Plan {
  return {
    ...plan,
    dishes: plan.dishes.map((dish) =>
      dish.id === id && dish.startedAt === null
        ? { ...dish, startedAt: now }
        : dish,
    ),
  }
}

export function addDish(plan: Plan, dish: PlanDish): Plan {
  return { ...plan, dishes: [...plan.dishes, dish] }
}

export function removeDish(plan: Plan, id: string): Plan {
  return { ...plan, dishes: plan.dishes.filter((dish) => dish.id !== id) }
}

export function updateDish(
  plan: Plan,
  id: string,
  change: Partial<Pick<PlanDish, 'label' | 'cookMs'>>,
): Plan {
  return {
    ...plan,
    dishes: plan.dishes.map((dish) =>
      dish.id === id
        ? {
            ...dish,
            ...change,
            cookMs:
              change.cookMs === undefined
                ? dish.cookMs
                : Math.max(0, Math.round(change.cookMs)),
          }
        : dish,
    ),
  }
}

export function setReadyAt(plan: Plan, readyAt: number): Plan {
  return { ...plan, readyAt }
}

/**
 * The soonest this meal could possibly be ready: every dish that has not gone
 * on yet starting this instant, and the ones already cooking finishing when
 * they finish.
 *
 * This is the floor a mealtime is held above. Letting readyAt fall below it
 * would mean every dish was instantly overdue, which is not a plan, it is the
 * app shouting about a deadline nobody could ever have met.
 */
export function soonestReadyAt(plan: Plan, now: number): number {
  return plan.dishes.reduce((latest, dish) => {
    const finishesAt =
      dish.startedAt !== null ? dish.startedAt + dish.cookMs : now + dish.cookMs
    return Math.max(latest, finishesAt)
  }, now)
}

/** Push the mealtime out if it has become impossible. Never pulls it in. */
export function clampReadyAt(plan: Plan, now: number): Plan {
  const soonest = soonestReadyAt(plan, now)
  return plan.readyAt < soonest ? setReadyAt(plan, soonest) : plan
}
