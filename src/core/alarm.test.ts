import { describe, expect, it } from 'vitest'
import { formatSince } from './format'
import {
  acknowledge,
  createTimer,
  overrunMs,
  start,
  unacknowledgedFinished,
} from './timers'
import { DEFAULT_SETTINGS, deserializeSettings, serializeSettings } from './settings'

const T0 = 1_700_000_000_000
const MIN = 60_000

describe('formatSince', () => {
  it('describes gaps the way a person would', () => {
    expect(formatSince(0)).toBe('just now')
    expect(formatSince(59_000)).toBe('just now')
    expect(formatSince(MIN)).toBe('1 min ago')
    expect(formatSince(3 * MIN)).toBe('3 min ago')
    expect(formatSince(59 * MIN)).toBe('59 min ago')
    expect(formatSince(60 * MIN)).toBe('1 hr ago')
    expect(formatSince(65 * MIN)).toBe('1 hr 5 min ago')
    expect(formatSince(-5)).toBe('just now')
  })
})

describe('overrun', () => {
  it('is zero until the timer finishes, then counts up', () => {
    const timer = start(createTimer({ durationMs: 5 * MIN }), T0)
    expect(overrunMs(timer, T0 + 2 * MIN)).toBe(0)
    expect(overrunMs(timer, T0 + 5 * MIN)).toBe(0)
    expect(overrunMs(timer, T0 + 8 * MIN)).toBe(3 * MIN)
  })

  it('reads the same whether or not the app was open, which is rule 3', () => {
    // Started, then the phone was in a pocket for eight minutes.
    const timer = start(createTimer({ label: 'Rice', durationMs: 5 * MIN }), T0)
    expect(formatSince(overrunMs(timer, T0 + 8 * MIN))).toBe('3 min ago')
  })
})

describe('unacknowledgedFinished', () => {
  const rice = start(createTimer({ id: 'r', durationMs: 5 * MIN }), T0)
  const veg = start(createTimer({ id: 'v', durationMs: 20 * MIN }), T0)
  const proof = start(createTimer({ id: 'p', mode: 'stopwatch' }), T0)

  it('picks out only the finished countdowns', () => {
    const due = unacknowledgedFinished([rice, veg, proof], T0 + 8 * MIN)
    expect(due.map((t) => t.id)).toEqual(['r'])
  })

  it('goes quiet once acknowledged', () => {
    const hushed = acknowledge(rice, T0 + 8 * MIN)
    expect(unacknowledgedFinished([hushed], T0 + 9 * MIN)).toEqual([])
  })

  it('reports several at once when a whole meal lands together', () => {
    const due = unacknowledgedFinished([rice, veg], T0 + 25 * MIN)
    expect(due.map((t) => t.id)).toEqual(['r', 'v'])
  })
})

describe('settings', () => {
  it('round trips', () => {
    const settings = {
      temperatureUnit: 'F' as const,
      backgroundAlarm: true,
      silentReminderDismissed: true,
    }
    expect(deserializeSettings(serializeSettings(settings))).toEqual(settings)
  })

  it('falls back to defaults for missing, damaged or unknown values', () => {
    expect(deserializeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(deserializeSettings('nonsense')).toEqual(DEFAULT_SETTINGS)
    expect(deserializeSettings('{"temperatureUnit":"K"}')).toEqual(DEFAULT_SETTINGS)
    expect(deserializeSettings('{"backgroundAlarm":"yes"}')).toEqual(DEFAULT_SETTINGS)
  })
})
