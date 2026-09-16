import { elapsedMs, remainingMs, statusOf, type Timer } from '../../core/timers'
import { formatDuration } from '../../core/format'

interface Props {
  timer: Timer
  now: number
  fallbackLabel: string
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onEdit: () => void
}

export function TimerRow({
  timer,
  now,
  fallbackLabel,
  onStart,
  onPause,
  onReset,
  onEdit,
}: Props) {
  const status = statusOf(timer, now)
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
    : timer.mode === 'stopwatch'
      ? 'Stopwatch'
      : 'Countdown'

  return (
    <div className={`row${finished ? ' row--finished' : ''}`}>
      <button
        className="row__info"
        onClick={onEdit}
        aria-label={`Edit ${timer.label || fallbackLabel}`}
      >
        <span className="row__top">
          <span className={`row__label${timer.label ? '' : ' row__label--empty'}`}>
            {timer.label || fallbackLabel}
          </span>
          <span className="row__mode">{badge}</span>
        </span>
        <span className="row__time">{readout}</span>
      </button>

      <div className="row__actions">
        <button
          className="row__button row__button--primary"
          onClick={running ? onPause : onStart}
        >
          {running ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button
          className="row__button"
          onClick={onReset}
          disabled={status === 'idle'}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
