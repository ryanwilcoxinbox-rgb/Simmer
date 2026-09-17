import { describe, expect, it } from 'vitest'
import { matchesQuery, normalise } from './search'

describe('normalise', () => {
  it('strips accents and case so Spanish cut names are typeable', () => {
    expect(normalise('Picaña')).toBe('picana')
    expect(normalise('Chuletón')).toBe('chuleton')
    expect(normalise('  Entrecot  ')).toBe('entrecot')
  })
})

describe('matchesQuery', () => {
  const chickenBreast = ['Chicken breast', 'Poultry', 'never pink']

  it('matches an empty query against everything', () => {
    expect(matchesQuery('', chickenBreast)).toBe(true)
    expect(matchesQuery('   ', chickenBreast)).toBe(true)
  })

  it('requires every word, so two words narrow rather than widen', () => {
    expect(matchesQuery('chicken', chickenBreast)).toBe(true)
    expect(matchesQuery('chicken breast', chickenBreast)).toBe(true)
    expect(matchesQuery('chicken thigh', chickenBreast)).toBe(false)
  })

  it('finds accented names from unaccented typing, and the reverse', () => {
    expect(matchesQuery('picana', ['Picaña', 'rump cap'])).toBe(true)
    expect(matchesQuery('Picaña', ['picana'])).toBe(true)
    expect(matchesQuery('chuleton', ['Chuletón'])).toBe(true)
  })

  it('searches every field it is given, not just the name', () => {
    // Someone looking for "culotte" should still land on Picaña.
    expect(matchesQuery('culotte', ['Picaña', 'Picanha, rump cap, culotte'])).toBe(true)
  })

  it('ignores fields that are not there', () => {
    expect(matchesQuery('cumin', ['Cumin', undefined])).toBe(true)
    expect(matchesQuery('zzz', [undefined])).toBe(false)
  })

  it('matches on word fragments, so partial typing works', () => {
    expect(matchesQuery('cori', ['Coriander seed'])).toBe(true)
  })
})
