import { describe, expect, it } from 'vitest'
import { connectedPlan, startPlannedTimer } from './planTimers'
import { createTimer, pause, reset, setDuration, setLabel } from './timers'
import { projectedReadyAt, type PlanDish } from './plan'
import { deserializeTimers, serializeTimers } from './persistence'
import { deserializePlan, serializePlan } from './planPersistence'

const dish: PlanDish = { id: 'chicken', label: 'Chicken', cookMs: 3600_000, startedAt: null }
const now = 1700000000000
const plan = { readyAt: now + dish.cookMs, dishes: [dish] }

describe('connected meal timers', () => {
  it('reuses an empty row and links by dish ID without duplicating on a repeated start', () => {
    const timers = startPlannedTimer([createTimer()], dish, now)
    expect(timers).toHaveLength(1)
    expect(timers[0].id).toBe(dish.id)
    expect(startPlannedTimer(timers, dish, now + 1000)).toEqual(timers)
  })
  it('can start a saved dish when all twelve manual slots are occupied', () => {
    const timers = Array.from({ length: 12 }, (_, i) => createTimer({ label: `Timer ${i}` }))
    const started = startPlannedTimer(timers, dish, now)
    expect(started).toHaveLength(13)
    expect(started[12].runningSince).toBe(now)
  })
  it('does not replace an unnamed timer whose duration was already configured', () => {
    const existing = createTimer({ durationMs: 7200_000 })
    const result = startPlannedTimer([existing], dish, now)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(existing)
  })
  it('restores the connection after both stores are saved and reloaded', () => {
    const timers = deserializeTimers(serializeTimers(startPlannedTimer([], dish, now)))!
    const restoredPlan = deserializePlan(serializePlan(plan))!
    expect(connectedPlan(restoredPlan, timers, now + 1000)?.dishes[0].startedAt).toBe(now)
  })
  it('reflects name and duration edits in the plan and projected mealtime', () => {
    const timer = setLabel(setDuration(startPlannedTimer([], dish, now)[0], 7200_000), 'Roast chicken')
    const linked = connectedPlan(plan, [timer], now + 1000)!
    expect(linked.dishes[0].label).toBe('Roast chicken')
    expect(projectedReadyAt(linked, now + 1000)).toBe(now + 7200_000)
  })
  it('accounts for pauses and puts a reset timer back into the waiting state', () => {
    const timer = pause(startPlannedTimer([], dish, now)[0], now + 600_000)
    const linked = connectedPlan(plan, [timer], now + 900_000)!
    expect(projectedReadyAt(linked, now + 900_000)).toBe(now + 3900_000)
    expect(connectedPlan(plan, [reset(timer)], now + 900_000)?.dishes[0].startedAt).toBeNull()
  })
})
