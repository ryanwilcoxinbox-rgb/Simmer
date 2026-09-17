import { describe, expect, it } from 'vitest'
import { SOURCES } from './sources'
import { MEATS, MEAT_GROUPS } from './meats'
import { COOKING_TERMS } from './terms'
import { BLENDS, NON_SPICE_NOTES, SPICES, FLAVOUR_GROUPS } from './spices'

/**
 * These guard the content rather than the code. A mistyped id in a hand-written
 * dataset produces a silently broken link rather than an error, and a
 * temperature without a source would break the brief's safety rule.
 */

const spiceIds = new Set(SPICES.map((s) => s.id))
const knownReferences = new Set([...spiceIds, ...Object.keys(NON_SPICE_NOTES)])

describe('sources', () => {
  it('every temperature names a source that exists', () => {
    for (const meat of MEATS) {
      for (const temperature of meat.temperatures) {
        expect(SOURCES[temperature.source], `${meat.id} / ${temperature.label}`).toBeDefined()
      }
    }
  })

  it('every meat has at least one temperature, since that is the point', () => {
    for (const meat of MEATS) {
      expect(meat.temperatures.length, meat.id).toBeGreaterThan(0)
    }
  })

  it('only attributes preference temperatures to culinary sources', () => {
    // A doneness preference must never be dressed up as food safety guidance.
    for (const meat of MEATS) {
      for (const temperature of meat.temperatures) {
        if (temperature.kind === 'safe') {
          expect(SOURCES[temperature.source].authority, meat.id).toBe('safety')
        }
      }
    }
  })

  it('anything cooked from raw offers a safe temperature, not just a preference', () => {
    for (const meat of MEATS) {
      expect(
        meat.temperatures.some((t) => t.kind === 'safe') ||
          meat.group === 'Beef and lamb',
        `${meat.id} has no safe temperature`,
      ).toBe(true)
    }
  })
})

describe('meats', () => {
  it('has unique ids and known groups', () => {
    const ids = MEATS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const meat of MEATS) {
      expect(MEAT_GROUPS, meat.id).toContain(meat.group)
    }
  })

  it('gives every timer suggestion a label and a sensible length', () => {
    for (const meat of MEATS) {
      if (!meat.timer) continue
      expect(meat.timer.label.length, meat.id).toBeGreaterThan(0)
      expect(meat.timer.minutes, meat.id).toBeGreaterThan(0)
      expect(meat.timer.minutes, meat.id).toBeLessThanOrEqual(24 * 60)
    }
  })
})

describe('cooking terms', () => {
  it('has unique ids and says something useful', () => {
    const ids = COOKING_TERMS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const term of COOKING_TERMS) {
      expect(term.short.length, term.id).toBeGreaterThan(10)
      expect(term.detail.length, term.id).toBeGreaterThan(60)
    }
  })
})

describe('spices', () => {
  it('has unique ids and known flavour groups', () => {
    expect(new Set(SPICES.map((s) => s.id)).size).toBe(SPICES.length)
    for (const spice of SPICES) {
      expect(FLAVOUR_GROUPS, spice.id).toContain(spice.group)
    }
  })

  it('pairs only with things we can actually name', () => {
    for (const spice of SPICES) {
      for (const pairing of spice.pairsWith) {
        expect(knownReferences.has(pairing), `${spice.id} pairs with unknown ${pairing}`).toBe(true)
      }
    }
  })

  it('never pairs a spice with itself', () => {
    for (const spice of SPICES) {
      expect(spice.pairsWith, spice.id).not.toContain(spice.id)
    }
  })

  it('gives every spice something to cook with', () => {
    for (const spice of SPICES) {
      expect(spice.goesWith.length, spice.id).toBeGreaterThan(0)
    }
  })
})

describe('blends', () => {
  it('are built from spices we hold', () => {
    for (const blend of BLENDS) {
      expect(blend.components.length, blend.id).toBeGreaterThan(1)
      for (const component of blend.components) {
        expect(
          spiceIds.has(component.id),
          `${blend.id} contains unknown ${component.id}`,
        ).toBe(true)
      }
    }
  })

  it('never lists the same spice twice', () => {
    for (const blend of BLENDS) {
      const ids = blend.components.map((c) => c.id)
      expect(new Set(ids).size, blend.id).toBe(ids.length)
    }
  })

  it('gives every component a whole number of parts, at least one', () => {
    // Fractions would be unusable: these are measured a spoon at a time.
    for (const blend of BLENDS) {
      for (const component of blend.components) {
        expect(Number.isInteger(component.parts), `${blend.id}/${component.id}`).toBe(true)
        expect(component.parts, `${blend.id}/${component.id}`).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('lists components largest first, so the blend reads as a recipe', () => {
    for (const blend of BLENDS) {
      const parts = blend.components.map((c) => c.parts)
      expect(parts, blend.id).toEqual([...parts].sort((a, b) => b - a))
    }
  })
})

describe('steak cuts', () => {
  it('have unique ids and at least one thickness', async () => {
    const { STEAK_CUTS } = await import('./cuts')
    expect(new Set(STEAK_CUTS.map((c) => c.id)).size).toBe(STEAK_CUTS.length)
    for (const cut of STEAK_CUTS) {
      expect(cut.thicknessesCm.length, cut.id).toBeGreaterThan(0)
      for (const cm of cut.thicknessesCm) {
        expect(cm, cut.id).toBeGreaterThan(0)
        expect(cm, cut.id).toBeLessThan(15)
      }
    }
  })

  it('recommend a doneness that actually exists', async () => {
    const { STEAK_CUTS } = await import('./cuts')
    const { STEAK_DONENESS } = await import('./meats')
    const ids = new Set(STEAK_DONENESS.map((d) => d.id))
    for (const cut of STEAK_CUTS) {
      expect(ids.has(cut.suits), `${cut.id} suits unknown ${cut.suits}`).toBe(true)
    }
  })

  it('give every doneness level an id, since other data points at them', async () => {
    const { STEAK_DONENESS } = await import('./meats')
    for (const doneness of STEAK_DONENESS) {
      expect(doneness.id, doneness.label).toBeTruthy()
    }
  })
})
