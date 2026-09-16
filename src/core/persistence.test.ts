import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, deserializeTimers, serializeTimers } from './persistence'
import { createTimer, remainingMs, start } from './timers'

const T0 = 1_700_000_000_000

describe('round trip', () => {
  it('restores a running timer with its progress intact', () => {
    const original = start(
      createTimer({ id: 'a', label: 'Rice', durationMs: 15 * 60_000 }),
      T0,
    )
    const restored = deserializeTimers(serializeTimers([original]))

    expect(restored).toEqual([original])
    // The point of the whole exercise: reopening the app 5 minutes later
    // shows 10 minutes left, not 15.
    expect(remainingMs(restored![0], T0 + 5 * 60_000)).toBe(10 * 60_000)
  })
})

describe('damaged or missing data', () => {
  it('treats nothing, rubbish and malformed JSON as a first run', () => {
    expect(deserializeTimers(null)).toBeNull()
    expect(deserializeTimers('')).toBeNull()
    expect(deserializeTimers('not json')).toBeNull()
    expect(deserializeTimers('[]')).toBeNull()
    expect(deserializeTimers('{"version":1}')).toBeNull()
  })

  it('refuses data written by a newer version of the app', () => {
    const future = JSON.stringify({
      version: SCHEMA_VERSION + 1,
      timers: [createTimer({ id: 'a' })],
    })
    expect(deserializeTimers(future)).toBeNull()
  })

  it('drops individual broken rows but keeps the good ones', () => {
    const raw = JSON.stringify({
      version: SCHEMA_VERSION,
      timers: [
        { id: 'ok', label: 'Rice', mode: 'countdown', durationMs: 60_000 },
        { id: 'no-mode', label: 'Broken' },
        { mode: 'countdown' },
        null,
        'nonsense',
      ],
    })
    const restored = deserializeTimers(raw)
    expect(restored).toHaveLength(1)
    expect(restored![0].id).toBe('ok')
  })

  it('fills in missing fields rather than rejecting the row', () => {
    const raw = JSON.stringify({
      version: SCHEMA_VERSION,
      timers: [{ id: 'a', mode: 'stopwatch' }],
    })
    expect(deserializeTimers(raw)![0]).toEqual({
      id: 'a',
      label: '',
      mode: 'stopwatch',
      durationMs: 0,
      accumulatedMs: 0,
      runningSince: null,
      acknowledgedAt: null,
    })
  })

  it('sanitises out-of-range numbers', () => {
    const raw = JSON.stringify({
      version: SCHEMA_VERSION,
      timers: [
        {
          id: 'a',
          mode: 'countdown',
          durationMs: -5,
          accumulatedMs: -100,
          runningSince: 'nope',
        },
      ],
    })
    const restored = deserializeTimers(raw)![0]
    expect(restored.durationMs).toBe(0)
    expect(restored.accumulatedMs).toBe(0)
    expect(restored.runningSince).toBeNull()
  })
})
