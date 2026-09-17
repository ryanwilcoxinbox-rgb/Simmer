import { describe, expect, it } from 'vitest'
import {
  REVERSE_SEAR_FROM_CM,
  donenessFactor,
  grillPlan,
  restMinutesFor,
} from './grill'

describe('choosing an approach', () => {
  it('cooks a thin steak straight over the coals', () => {
    const plan = grillPlan(2, 'medium-rare')
    expect(plan.approach).toBe('direct')
    expect(plan.perSideMinutes).toBe(2.5)
    expect(plan.totalMinutes).toBe(5)
  })

  it('switches to a reverse sear once it is too thick for direct heat', () => {
    expect(grillPlan(REVERSE_SEAR_FROM_CM - 0.1, 'medium-rare').approach).toBe('direct')
    expect(grillPlan(REVERSE_SEAR_FROM_CM, 'medium-rare').approach).toBe('reverse-sear')

    // A chuleton: long indirect phase, then a short sear on each side.
    const chuleton = grillPlan(4.5, 'medium-rare')
    expect(chuleton.approach).toBe('reverse-sear')
    expect(chuleton.perSideMinutes).toBe(1.5)
    expect(chuleton.totalMinutes).toBeGreaterThan(30)
  })
})

describe('doneness moves the clock', () => {
  it('takes longer the further through you want it', () => {
    const rare = grillPlan(2, 'rare').totalMinutes
    const mediumRare = grillPlan(2, 'medium-rare').totalMinutes
    const medium = grillPlan(2, 'medium').totalMinutes
    const well = grillPlan(2, 'well-done').totalMinutes
    expect(rare).toBeLessThan(mediumRare)
    expect(mediumRare).toBeLessThan(medium)
    expect(medium).toBeLessThan(well)
  })

  it('falls back to medium rare for a doneness it does not know', () => {
    expect(donenessFactor('nonsense')).toBe(donenessFactor('medium-rare'))
  })
})

describe('thickness moves the clock', () => {
  it('takes longer the thicker it is', () => {
    expect(grillPlan(1.5, 'medium').totalMinutes).toBeLessThan(
      grillPlan(3, 'medium').totalMinutes,
    )
  })

  it('never returns a nonsensical time for a silly thickness', () => {
    const plan = grillPlan(0, 'medium-rare')
    expect(plan.totalMinutes).toBeGreaterThanOrEqual(1)
    expect(plan.restMinutes).toBeGreaterThanOrEqual(5)
    expect(grillPlan(-5, 'rare').totalMinutes).toBeGreaterThanOrEqual(1)
  })
})

describe('resting', () => {
  it('rests a thick steak longer than a thin one, within sensible bounds', () => {
    expect(restMinutesFor(2)).toBe(6)
    expect(restMinutesFor(4)).toBe(12)
    // Clamped at both ends: never trivially short, never absurdly long.
    expect(restMinutesFor(0.5)).toBe(5)
    expect(restMinutesFor(50)).toBe(20)
  })
})
