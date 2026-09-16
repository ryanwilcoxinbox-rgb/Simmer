import { describe, expect, it } from 'vitest'
import { formatTemperature, toFahrenheit } from './temperature'

describe('toFahrenheit', () => {
  it('matches the figures the official sources publish', () => {
    // The USDA quotes these pairs itself, so they are a good check that we
    // are not drifting from the source.
    expect(Math.round(toFahrenheit(62.8))).toBe(145)
    expect(Math.round(toFahrenheit(71.1))).toBe(160)
    expect(Math.round(toFahrenheit(73.9))).toBe(165)
    expect(toFahrenheit(0)).toBe(32)
    expect(toFahrenheit(100)).toBe(212)
  })
})

describe('formatTemperature', () => {
  it('keeps a decimal only where the source had one', () => {
    expect(formatTemperature(70, 'C')).toBe('70°C')
    expect(formatTemperature(62.8, 'C')).toBe('62.8°C')
  })

  it('rounds Fahrenheit to whole degrees', () => {
    expect(formatTemperature(62.8, 'F')).toBe('145°F')
    expect(formatTemperature(70, 'F')).toBe('158°F')
  })
})

describe('spice notes', () => {
  it('round trips and survives rubbish', async () => {
    const { deserializeNotes, serializeNotes } = await import('./notes')
    expect(deserializeNotes(serializeNotes({ cumin: 'toast it longer' }))).toEqual({
      cumin: 'toast it longer',
    })
    expect(deserializeNotes(null)).toEqual({})
    expect(deserializeNotes('not json')).toEqual({})
    expect(deserializeNotes('[1,2]')).toEqual({})
    // Non-string and empty values are dropped rather than poisoning the set.
    expect(deserializeNotes('{"a":"keep","b":5,"c":""}')).toEqual({ a: 'keep' })
  })
})
