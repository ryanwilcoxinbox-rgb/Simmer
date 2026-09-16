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
