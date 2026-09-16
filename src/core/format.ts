/**
 * Pure formatting helpers. No React, no browser APIs, so this file would
 * survive a move to React Native unchanged.
 */

/**
 * Format a duration in milliseconds as a clock-style string.
 *
 * Under an hour it pads the minutes ("05:00") so the display does not jump
 * about in width as the number shrinks, which matters on a big kitchen
 * readout. An hour or more gains an unpadded hours part ("1:05:00").
 *
 * Negative durations clamp to zero; callers that care about overrun should
 * track that separately rather than reading it out of the string.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  const pad = (n: number) => String(n).padStart(2, '0')

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

/**
 * How long ago something happened, in kitchen English rather than clock
 * digits: "just now", "3 min ago", "1 hr 5 min ago".
 *
 * Used for telling Arran how long a timer has been sitting finished while he
 * was in another app, where the exact seconds matter far less than the sense
 * of how overdue the food is.
 */
export function formatSince(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000)
  if (totalMinutes < 1) return 'just now'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} min ago`
  if (minutes === 0) return `${hours} hr ago`
  return `${hours} hr ${minutes} min ago`
}

/**
 * A duration written the short way, for preset buttons and labels where
 * "03:30" is more digits than the space deserves: "45s", "3m", "3m30".
 */
export function formatCompact(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) return `${seconds}s`
  if (seconds === 0) return `${minutes}m`
  return `${minutes}m${String(seconds).padStart(2, '0')}`
}
