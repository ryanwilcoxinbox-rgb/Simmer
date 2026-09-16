import { describe, expect, it } from 'vitest'
import {
  addDish,
  allStarted,
  createDish,
  dishStatus,
  dueDishes,
  earliestReadyAt,
  longestCookMs,
  projectedReadyAt,
  removeDish,
  scheduledStart,
  setReadyAt,
  slippageMs,
  startDish,
  updateDish,
  type Plan,
  type PlanDish,
} from './plan'

const MIN = 60_000
const T0 = 1_700_000_000_000

const dish = (id: string, label: string, minutes: number): PlanDish => ({
  id,
  label,
  cookMs: minutes * MIN,
  startedAt: null,
})

/** The brief's own example: chicken 40, rice 15, veg 8, eating in 40 minutes. */
const mealPlan = (): Plan => ({
  readyAt: T0 + 40 * MIN,
  dishes: [
    dish('c', 'Chicken', 40),
    dish('r', 'Rice', 15),
    dish('v', 'Veg', 8),
  ],
})

describe('working backwards', () => {
  it('gives each dish a start time that lands them together', () => {
    const plan = mealPlan()
    expect(scheduledStart(plan.dishes[0], plan)).toBe(T0)
    expect(scheduledStart(plan.dishes[1], plan)).toBe(T0 + 25 * MIN)
    expect(scheduledStart(plan.dishes[2], plan)).toBe(T0 + 32 * MIN)
  })

  it('knows the longest dish sets the earliest possible mealtime', () => {
    const plan = mealPlan()
    expect(longestCookMs(plan.dishes)).toBe(40 * MIN)
    expect(earliestReadyAt(plan.dishes, T0)).toBe(T0 + 40 * MIN)
  })

  it('handles an empty plan without falling over', () => {
    const empty: Plan = { readyAt: T0, dishes: [] }
    expect(longestCookMs([])).toBe(0)
    expect(dueDishes(empty, T0)).toEqual([])
    expect(projectedReadyAt(empty, T0)).toBe(T0)
    expect(allStarted(empty)).toBe(false)
  })
})

describe('what to do right now', () => {
  it('walks through the statuses as the meal progresses', () => {
    const plan = mealPlan()
    const chicken = plan.dishes[0]
    const rice = plan.dishes[1]

    // At the top of the meal only the chicken is wanted.
    expect(dishStatus(chicken, plan, T0)).toBe('due')
    expect(dishStatus(rice, plan, T0)).toBe('waiting')
    expect(dueDishes(plan, T0).map((d) => d.id)).toEqual(['c'])

    // Twenty five minutes in, the rice is wanted too.
    expect(dishStatus(rice, plan, T0 + 25 * MIN)).toBe('due')

    // Left another couple of minutes, it is properly late.
    expect(dishStatus(rice, plan, T0 + 27 * MIN)).toBe('overdue')
  })

  it('stops nagging about a dish once it has gone on', () => {
    const plan = startDish(mealPlan(), 'c', T0)
    expect(dishStatus(plan.dishes[0], plan, T0 + 5 * MIN)).toBe('started')
    expect(dueDishes(plan, T0)).toEqual([])
  })

  it('ignores a second start for the same dish', () => {
    const once = startDish(mealPlan(), 'c', T0)
    const twice = startDish(once, 'c', T0 + 9 * MIN)
    expect(twice.dishes[0].startedAt).toBe(T0)
  })
})

describe('telling the truth about being late', () => {
  it('reports no slippage when everything is on schedule', () => {
    const plan = mealPlan()
    expect(projectedReadyAt(plan, T0)).toBe(T0 + 40 * MIN)
    expect(slippageMs(plan, T0)).toBe(0)
  })

  it('drags the meal when a dish goes on late', () => {
    // The chicken should have started at T0 but went on 10 minutes late.
    const plan = startDish(mealPlan(), 'c', T0 + 10 * MIN)
    expect(projectedReadyAt(plan, T0 + 10 * MIN)).toBe(T0 + 50 * MIN)
    expect(slippageMs(plan, T0 + 10 * MIN)).toBe(10 * MIN)
  })

  it('counts a dish that is sitting overdue right now, not just one started late', () => {
    // Nobody has touched the chicken and we are already 5 minutes past.
    const plan = mealPlan()
    expect(slippageMs(plan, T0 + 5 * MIN)).toBe(5 * MIN)
  })

  it('does not pull the meal earlier when a dish goes on early', () => {
    // Starting the rice well ahead of its slot does not mean dinner is early:
    // the chicken still needs its 40 minutes.
    const plan = startDish(mealPlan(), 'r', T0)
    expect(projectedReadyAt(plan, T0)).toBe(T0 + 40 * MIN)
    expect(slippageMs(plan, T0)).toBe(0)
  })
})

describe('editing a plan', () => {
  it('adds, updates and removes dishes', () => {
    let plan = mealPlan()
    plan = addDish(plan, createDish('Gravy', 5 * MIN))
    expect(plan.dishes).toHaveLength(4)

    plan = updateDish(plan, 'r', { cookMs: 12 * MIN, label: 'Basmati' })
    expect(plan.dishes[1].label).toBe('Basmati')
    expect(scheduledStart(plan.dishes[1], plan)).toBe(T0 + 28 * MIN)

    plan = removeDish(plan, 'v')
    expect(plan.dishes.map((d) => d.id)).toEqual(['c', 'r', plan.dishes[2].id])
  })

  it('refuses to store a negative cook time', () => {
    const plan = updateDish(mealPlan(), 'v', { cookMs: -5 })
    expect(plan.dishes[2].cookMs).toBe(0)
    expect(createDish('Odd', -1).cookMs).toBe(0)
  })

  it('reschedules every dish when the mealtime moves', () => {
    const plan = setReadyAt(mealPlan(), T0 + 70 * MIN)
    expect(scheduledStart(plan.dishes[0], plan)).toBe(T0 + 30 * MIN)
    expect(scheduledStart(plan.dishes[2], plan)).toBe(T0 + 62 * MIN)
    // Nothing is wanted yet, because dinner moved half an hour later.
    expect(dueDishes(plan, T0)).toEqual([])
  })

  it('knows when the cook is finally done handing things over', () => {
    let plan = mealPlan()
    expect(allStarted(plan)).toBe(false)
    for (const id of ['c', 'r', 'v']) plan = startDish(plan, id, T0)
    expect(allStarted(plan)).toBe(true)
  })
})

describe('saving a plan', () => {
  it('round trips', async () => {
    const { serializePlan, deserializePlan } = await import('./planPersistence')
    const plan = startDish(mealPlan(), 'c', T0)
    expect(deserializePlan(serializePlan(plan))).toEqual(plan)
  })

  it('treats nothing, rubbish and future versions as no plan', async () => {
    const { deserializePlan } = await import('./planPersistence')
    expect(deserializePlan(null)).toBeNull()
    expect(deserializePlan('not json')).toBeNull()
    expect(deserializePlan('{"version":1}')).toBeNull()
    expect(deserializePlan('{"version":99,"plan":{"readyAt":1,"dishes":[]}}')).toBeNull()
    // A plan whose dishes are all unusable is not worth restoring.
    expect(
      deserializePlan('{"version":1,"plan":{"readyAt":1,"dishes":[{"no":"id"}]}}'),
    ).toBeNull()
  })

  it('keeps the good dishes and sanitises their numbers', async () => {
    const { deserializePlan } = await import('./planPersistence')
    const restored = deserializePlan(
      JSON.stringify({
        version: 1,
        plan: {
          readyAt: T0,
          dishes: [
            { id: 'a', label: 'Rice', cookMs: -5, startedAt: 'nope' },
            { id: 'b' },
          ],
        },
      }),
    )
    expect(restored!.dishes).toHaveLength(1)
    expect(restored!.dishes[0]).toEqual({
      id: 'a',
      label: 'Rice',
      cookMs: 0,
      startedAt: null,
    })
  })
})

describe('a plan can never ask for the impossible', () => {
  it('knows the soonest everything could be ready', async () => {
    const { soonestReadyAt } = await import('./plan')
    expect(soonestReadyAt(mealPlan(), T0)).toBe(T0 + 40 * MIN)

    // Half an hour in, with the chicken on since the start but the rice still
    // sitting there: the chicken is done at T0+40, but the rice needs a fresh
    // 15 minutes from now, so the meal cannot land before T0+45.
    const started = startDish(mealPlan(), 'c', T0)
    expect(soonestReadyAt(started, T0 + 30 * MIN)).toBe(T0 + 45 * MIN)
  })

  it('pushes the mealtime out when a dish grows past it', async () => {
    const { clampReadyAt } = await import('./plan')
    // Eating in 20 minutes, then the chicken turns out to need 40.
    const tight: Plan = {
      readyAt: T0 + 20 * MIN,
      dishes: [dish('c', 'Chicken', 40)],
    }
    expect(clampReadyAt(tight, T0).readyAt).toBe(T0 + 40 * MIN)
  })

  it('leaves a comfortable mealtime alone', async () => {
    const { clampReadyAt } = await import('./plan')
    const relaxed = setReadyAt(mealPlan(), T0 + 90 * MIN)
    expect(clampReadyAt(relaxed, T0).readyAt).toBe(T0 + 90 * MIN)
  })

  it('does not drag the meal later just because a dish is already cooking', async () => {
    const { clampReadyAt } = await import('./plan')
    // A single dish, on since the start. Half an hour later it has only ten
    // minutes left, so the original mealtime is still perfectly achievable and
    // must not be pushed out.
    const single: Plan = {
      readyAt: T0 + 40 * MIN,
      dishes: [dish('c', 'Chicken', 40)],
    }
    const onTheGo = startDish(single, 'c', T0)
    expect(clampReadyAt(onTheGo, T0 + 30 * MIN).readyAt).toBe(T0 + 40 * MIN)
  })
})
