import { describe, expect, it } from 'vitest'
import { formatCompact, formatDuration } from './format'

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
