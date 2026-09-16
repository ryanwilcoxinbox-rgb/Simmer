/**
 * Saving and restoring a meal plan. Pure, like the timer equivalent, and just
 * as suspicious of what it reads back.
 *
 * A plan is worth restoring because it is the one thing in the app the user
 * typed out in full. Losing it mid-cook because of one bad field would be
 * worse than losing a timer, which takes two taps to recreate.
 */

import type { Plan, PlanDish } from './plan'

export const PLAN_SCHEMA_VERSION = 1

interface SavedPlan {
  version: number
  plan: Plan
}

export function serializePlan(plan: Plan): string {
  const saved: SavedPlan = { version: PLAN_SCHEMA_VERSION, plan }
  return JSON.stringify(saved)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function reviveDish(value: unknown): PlanDish | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || raw.id === '') return null
  if (!isFiniteNumber(raw.cookMs)) return null

  return {
    id: raw.id,
    label: typeof raw.label === 'string' ? raw.label : '',
    cookMs: Math.max(0, Math.round(raw.cookMs)),
    startedAt: isFiniteNumber(raw.startedAt) ? raw.startedAt : null,
  }
}

export function deserializePlan(raw: string | null): Plan | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null

  const saved = parsed as Record<string, unknown>
  // Data written by a future version of the app is not safe to guess at.
  if (!isFiniteNumber(saved.version) || saved.version > PLAN_SCHEMA_VERSION) {
    return null
  }
  if (typeof saved.plan !== 'object' || saved.plan === null) return null

  const plan = saved.plan as Record<string, unknown>
  if (!isFiniteNumber(plan.readyAt)) return null
  if (!Array.isArray(plan.dishes)) return null

  const dishes = plan.dishes
    .map(reviveDish)
    .filter((dish): dish is PlanDish => dish !== null)

  // A plan with nothing left in it is not a plan.
  return dishes.length > 0 ? { readyAt: plan.readyAt, dishes } : null
}
