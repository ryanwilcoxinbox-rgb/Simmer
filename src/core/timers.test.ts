import { describe, expect, it } from 'vitest'
import {
  MAX_DURATION_MS,
  acknowledge,
  anyRunning,
  clampDuration,
  createTimer,
  elapsedMs,
  endsAt,
  isFinished,
  pause,
  remainingMs,
  reset,
  setDuration,
  setMode,
  start,
  slotForLaunchedTimer,
  statusOf,
} from './timers'

const T0 = 1_700_000_000_000 // an arbitrary fixed "now" so tests are repeatable
const MIN = 60_000

const countdown = (durationMs = 5 * MIN) =>
  createTimer({ id: 'a', label: 'Rice', mode: 'countdown', durationMs })

const stopwatch = () => createTimer({ id: 'b', label: 'Proof', mode: 'stopwatch' })

describe('countdown', () => {
  it('does not move until it is started', () => {
    const timer = countdown()
    expect(statusOf(timer, T0)).toBe('idle')
    expect(remainingMs(timer, T0 + 10 * MIN)).toBe(5 * MIN)
  })

  it('counts down from the moment it starts', () => {
    const timer = start(countdown(), T0)
    expect(remainingMs(timer, T0)).toBe(5 * MIN)
    expect(remainingMs(timer, T0 + 2 * MIN)).toBe(3 * MIN)
    expect(statusOf(timer, T0 + 2 * MIN)).toBe('running')
  })

  it('banks progress when paused and resumes from there', () => {
    let timer = start(countdown(), T0)
    timer = pause(timer, T0 + 2 * MIN)

    expect(statusOf(timer, T0 + 2 * MIN)).toBe('paused')
    // Time passing while paused must not eat into the remaining time.
    expect(remainingMs(timer, T0 + 60 * MIN)).toBe(3 * MIN)

    timer = start(timer, T0 + 60 * MIN)
    expect(remainingMs(timer, T0 + 61 * MIN)).toBe(2 * MIN)
  })

  it('finishes, and reports how far it has overrun', () => {
    const timer = start(countdown(), T0)
    expect(isFinished(timer, T0 + 5 * MIN - 1)).toBe(false)
    expect(isFinished(timer, T0 + 5 * MIN)).toBe(true)
    expect(statusOf(timer, T0 + 8 * MIN)).toBe('finished')
    // Negative remaining is how Milestone 3 will say "finished 3 minutes ago".
    expect(remainingMs(timer, T0 + 8 * MIN)).toBe(-3 * MIN)
  })

  it('stays correct across a long gap, as when iOS freezes the page', () => {
    const timer = start(countdown(45 * MIN), T0)
    // The app is suspended for half an hour and then thaws.
    expect(remainingMs(timer, T0 + 30 * MIN)).toBe(15 * MIN)
    expect(statusOf(timer, T0 + 30 * MIN)).toBe('running')
  })

  it('reports the wall-clock time it will finish while running', () => {
    expect(endsAt(countdown())).toBeNull()
    const timer = start(countdown(), T0)
    expect(endsAt(timer)).toBe(T0 + 5 * MIN)
    // After a pause and resume the finish line moves with it.
    const resumed = start(pause(timer, T0 + MIN), T0 + 10 * MIN)
    expect(endsAt(resumed)).toBe(T0 + 14 * MIN)
  })

  it('restarts from scratch when started again after finishing', () => {
    const finished = start(countdown(), T0)
    const restarted = start(finished, T0 + 9 * MIN)
    expect(remainingMs(restarted, T0 + 9 * MIN)).toBe(5 * MIN)
    expect(restarted.acknowledgedAt).toBeNull()
  })
})

describe('stopwatch', () => {
  it('counts up and never finishes', () => {
    const timer = start(stopwatch(), T0)
    expect(elapsedMs(timer, T0 + 90 * MIN)).toBe(90 * MIN)
    expect(isFinished(timer, T0 + 90 * MIN)).toBe(false)
    expect(remainingMs(timer, T0 + 90 * MIN)).toBe(0)
  })

  it('banks elapsed time across a pause', () => {
    let timer = start(stopwatch(), T0)
    timer = pause(timer, T0 + 3 * MIN)
    expect(elapsedMs(timer, T0 + 99 * MIN)).toBe(3 * MIN)
    timer = start(timer, T0 + 99 * MIN)
    expect(elapsedMs(timer, T0 + 100 * MIN)).toBe(4 * MIN)
  })
})

describe('editing', () => {
  it('resets progress when the mode changes', () => {
    const running = start(countdown(), T0)
    const switched = setMode(running, 'stopwatch')
    expect(switched.mode).toBe('stopwatch')
    expect(statusOf(switched, T0 + MIN)).toBe('idle')
  })

  it('leaves the timer alone when the mode is unchanged', () => {
    const running = start(countdown(), T0)
    expect(setMode(running, 'countdown')).toBe(running)
  })

  it('can retarget a running countdown without stopping it', () => {
    const timer = setDuration(start(countdown(5 * MIN), T0), 10 * MIN)
    expect(statusOf(timer, T0 + MIN)).toBe('running')
    expect(remainingMs(timer, T0 + MIN)).toBe(9 * MIN)
  })

  it('clamps silly durations', () => {
    expect(clampDuration(-1)).toBe(0)
    expect(clampDuration(Number.NaN)).toBe(0)
    expect(clampDuration(Number.POSITIVE_INFINITY)).toBe(0)
    expect(clampDuration(999 * 60 * MIN)).toBe(MAX_DURATION_MS)
  })

  it('clears progress and acknowledgement on reset', () => {
    const timer = acknowledge(start(countdown(), T0), T0 + 6 * MIN)
    const cleared = reset(timer)
    expect(statusOf(cleared, T0 + 6 * MIN)).toBe('idle')
    expect(cleared.acknowledgedAt).toBeNull()
    expect(cleared.label).toBe('Rice')
  })
})

describe('guards', () => {
  it('ignores a second start and a pause on a stopped timer', () => {
    const running = start(countdown(), T0)
    expect(start(running, T0 + MIN)).toBe(running)
    const idle = countdown()
    expect(pause(idle, T0)).toBe(idle)
  })

  it('does not run backwards if the device clock jumps back', () => {
    const timer = start(countdown(), T0)
    expect(elapsedMs(timer, T0 - 10 * MIN)).toBe(0)
    expect(remainingMs(timer, T0 - 10 * MIN)).toBe(5 * MIN)
  })

  it('knows whether anything is running', () => {
    expect(anyRunning([countdown(), stopwatch()])).toBe(false)
    expect(anyRunning([countdown(), start(stopwatch(), T0)])).toBe(true)
  })
})

describe('finding a row for a timer launched from the Guide', () => {
  const full = (n: number) =>
    Array.from({ length: n }, (_, i) =>
      start(createTimer({ id: `t${i}`, label: `Busy ${i}`, durationMs: 30 * MIN }), T0),
    )

  it('takes an untouched row before anything else', () => {
    const timers = [...full(3), createTimer({ id: 'spare' })]
    expect(slotForLaunchedTimer(timers, T0, 12)).toEqual({ kind: 'reuse', id: 'spare' })
  })

  it('reuses a timer that finished and was dismissed', () => {
    const done = acknowledge(start(countdown(), T0), T0 + 6 * MIN)
    const timers = [...full(11), { ...done, id: 'done' }]
    expect(slotForLaunchedTimer(timers, T0 + 7 * MIN, 12)).toEqual({
      kind: 'reuse',
      id: 'done',
    })
  })

  it('will not steal a finished timer that is still ringing', () => {
    // Unacknowledged means Arran has not seen it yet. Taking that row would
    // throw away the alarm he is about to be told about.
    const ringing = start(countdown(), T0)
    const timers = [...full(11), { ...ringing, id: 'ringing' }]
    expect(slotForLaunchedTimer(timers, T0 + 7 * MIN, 12)).toEqual({ kind: 'full' })
  })

  it('adds a row while there is room', () => {
    expect(slotForLaunchedTimer(full(5), T0, 12)).toEqual({ kind: 'append' })
  })

  it('reports being full rather than failing quietly', () => {
    expect(slotForLaunchedTimer(full(12), T0, 12)).toEqual({ kind: 'full' })
  })
})
