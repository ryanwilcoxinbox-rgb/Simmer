import type { CSSProperties } from 'react'
import { elapsedMs, remainingMs, statusOf, type Timer } from '../../core/timers'
import { formatDuration } from '../../core/format'

interface Props {
  timer: Timer
  now: number
  fallbackLabel: string
  onStart: () => void
  onPause: () => void
  onEdit: () => void
  linkedToPlan?: boolean
}

export function TimerRow({
  timer,
  now,
  fallbackLabel,
  onStart,
  onPause,
  onEdit,
  linkedToPlan,
}: Props) {
  const status = statusOf(timer, now)
  // How far through the countdown we are, drawn as a fill behind the row.
  // Stopwatches have no finish line, so they have no progress to show.
  const progress =
    timer.mode === 'countdown' && timer.durationMs > 0
      ? Math.min(1, elapsedMs(timer, now) / timer.durationMs)
      : 0
  const running = status === 'running'
  const finished = status === 'finished'

  // A finished countdown shows how far past the end it is, counting up, rather
  // than sitting silently on 00:00. Milestone 3 adds the alarm and the
  // "finished 3 minutes ago" wording to go with it.
  const readout = finished
    ? `+${formatDuration(-remainingMs(timer, now))}`
    : timer.mode === 'stopwatch'
      ? formatDuration(elapsedMs(timer, now))
      : formatDuration(remainingMs(timer, now))

  const badge = finished
    ? 'Finished'
    : status === 'paused' ? 'Paused'
      : running ? timer.mode === 'stopwatch' ? 'Counting up' : 'Cooking'
        : timer.mode === 'stopwatch' ? 'Stopwatch' : 'Ready'

  return (
    <div
      className={`row${finished ? ' row--finished' : running ? ' row--running' : ''}`}
      style={{ '--progress': progress } as CSSProperties}
    >
      <button
        className="row__info"
        onClick={onEdit}
        aria-label={`Edit ${timer.label || fallbackLabel}`}
      >
        <span className="row__top">
          <span className={`row__label${timer.label ? '' : ' row__label--empty'}`}>
            {timer.label || fallbackLabel}
          </span>
          <span className="row__edit" aria-hidden="true">Edit</span>
        </span>
        <span className="row__time">{readout}</span>
        <span className="row__mode">{badge}{linkedToPlan ? ' · Meal plan' : ''}</span>
      </button>

      <div className="row__actions">
        <button
          className="row__button row__button--primary"
          onClick={running ? onPause : onStart}
          aria-label={`${running ? 'Pause' : finished ? 'Restart' : status === 'paused' ? 'Resume' : 'Start'} ${timer.label || fallbackLabel}`}
        >
          {running ? 'Pause' : finished ? 'Restart' : status === 'paused' ? 'Resume' : 'Start'}
        </button>
      </div>
    </div>
  )
}
