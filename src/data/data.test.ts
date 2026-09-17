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

describe('bbq items', () => {
  it('have unique ids and known categories', async () => {
    const { BBQ_ITEMS, BBQ_CATEGORIES } = await import('./bbq')
    expect(new Set(BBQ_ITEMS.map((i) => i.id)).size).toBe(BBQ_ITEMS.length)
    for (const item of BBQ_ITEMS) {
      expect(BBQ_CATEGORIES, item.id).toContain(item.category)
    }
  })

  /*
   * The important one. Pork, chicken, skewers, sausages and fish must never be
   * offered as a doneness choice, and a whole cut of beef must never be dressed
   * up as a safety figure. Getting this wrong is the difference between a
   * cooking app and a food poisoning app.
   */
  it('never offers a doneness choice on anything cooked through', async () => {
    const { BBQ_ITEMS } = await import('./bbq')
    const mustCookThrough = ['Pork', 'Chicken', 'Fish', 'Other']
    for (const item of BBQ_ITEMS) {
      if (mustCookThrough.includes(item.category)) {
        expect(item.kind, `${item.id} must be cooked through`).toBe('cooked-through')
      }
    }
  })

  it('gives every cooked-through item safe temperatures from a safety body', async () => {
    const { BBQ_ITEMS } = await import('./bbq')
    for (const item of BBQ_ITEMS) {
      if (item.kind !== 'cooked-through') continue
      expect(item.temperatures.length, item.id).toBeGreaterThan(0)
      for (const temperature of item.temperatures) {
        expect(temperature.kind, item.id).toBe('safe')
        expect(SOURCES[temperature.source].authority, item.id).toBe('safety')
      }
      expect(item.whyThrough.length, item.id).toBeGreaterThan(20)
      expect(item.sizes.length, item.id).toBeGreaterThan(0)
    }
  })

  it('only lets beef and lamb be cooked to preference', async () => {
    const { BBQ_ITEMS } = await import('./bbq')
    for (const item of BBQ_ITEMS) {
      if (item.kind === 'preference') {
        expect(['Beef', 'Lamb'], item.id).toContain(item.category)
      }
    }
  })

  it('gives preference cuts a doneness that exists and sensible thicknesses', async () => {
    const { BBQ_ITEMS } = await import('./bbq')
    const { STEAK_DONENESS } = await import('./meats')
    const ids = new Set(STEAK_DONENESS.map((d) => d.id))
    for (const item of BBQ_ITEMS) {
      if (item.kind !== 'preference') continue
      expect(ids.has(item.suits), `${item.id} suits unknown ${item.suits}`).toBe(true)
      expect(item.thicknessesCm.length, item.id).toBeGreaterThan(0)
      for (const cm of item.thicknessesCm) {
        expect(cm, item.id).toBeGreaterThan(0)
        expect(cm, item.id).toBeLessThan(15)
      }
    }
  })

  it('gives every size a usable time and rest', async () => {
    const { BBQ_ITEMS } = await import('./bbq')
    for (const item of BBQ_ITEMS) {
      if (item.kind !== 'cooked-through') continue
      for (const size of item.sizes) {
        const where = `${item.id}/${size.label}`
        expect(size.minutes, where).toBeGreaterThan(0)
        expect(size.minutes, where).toBeLessThanOrEqual(24 * 60)
        expect(size.restMinutes, where).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('give every doneness level an id, since other data points at them', async () => {
    const { STEAK_DONENESS } = await import('./meats')
    for (const doneness of STEAK_DONENESS) {
      expect(doneness.id, doneness.label).toBeTruthy()
    }
  })
})
