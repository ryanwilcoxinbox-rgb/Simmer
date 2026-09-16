import { describe, expect, it } from 'vitest'
import {
  formatClock,
  formatCompact,
  formatDuration,
  formatUntil,
} from './format'

describe('formatDuration', () => {
  it('pads minutes and seconds under an hour', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(9_000)).toBe('00:09')
    expect(formatDuration(5 * 60_000)).toBe('05:00')
    expect(formatDuration(59 * 60_000 + 59_000)).toBe('59:59')
  })

  it('adds an hours part at an hour and above', () => {
    expect(formatDuration(60 * 60_000)).toBe('1:00:00')
    expect(formatDuration(65 * 60_000)).toBe('1:05:00')
  })

  it('floors partial seconds rather than rounding up', () => {
    expect(formatDuration(1_999)).toBe('00:01')
  })

  it('clamps negative durations to zero', () => {
    expect(formatDuration(-5_000)).toBe('00:00')
  })
})

describe('formatCompact', () => {
  it('drops the parts that are zero', () => {
    expect(formatCompact(45_000)).toBe('45s')
    expect(formatCompact(3 * 60_000)).toBe('3m')
    expect(formatCompact(3 * 60_000 + 30_000)).toBe('3m30')
    expect(formatCompact(90_000)).toBe('1m30')
  })

  it('pads the seconds so 3m05 does not read as 3m5', () => {
    expect(formatCompact(3 * 60_000 + 5_000)).toBe('3m05')
  })

  it('treats nothing and negatives as zero seconds', () => {
    expect(formatCompact(0)).toBe('0s')
    expect(formatCompact(-1)).toBe('0s')
  })
})

describe('formatClock', () => {
  it('reads times off the local clock, zero padded and 24 hour', () => {
    // Built in local time and read back in local time, so this holds in any
    // timezone the phone happens to be set to.
    expect(formatClock(new Date(2026, 0, 1, 19, 15).getTime())).toBe('19:15')
    expect(formatClock(new Date(2026, 0, 1, 9, 5).getTime())).toBe('09:05')
    expect(formatClock(new Date(2026, 0, 1, 0, 0).getTime())).toBe('00:00')
  })
})

describe('formatUntil', () => {
  it('says now for anything inside the next minute', () => {
    expect(formatUntil(0)).toBe('now')
    expect(formatUntil(59_000)).toBe('now')
  })

  it('counts up through minutes and hours', () => {
    expect(formatUntil(60_000)).toBe('in 1 min')
    expect(formatUntil(12 * 60_000)).toBe('in 12 min')
    expect(formatUntil(60 * 60_000)).toBe('in 1 hr')
    expect(formatUntil(65 * 60_000)).toBe('in 1 hr 5 min')
  })
})
