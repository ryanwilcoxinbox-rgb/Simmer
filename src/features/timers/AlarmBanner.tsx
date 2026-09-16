import { overrunMs, type Timer } from '../../core/timers'
import { formatSince } from '../../core/format'

interface Props {
  due: Timer[]
  now: number
  labelFor: (timer: Timer) => string
  onDismiss: () => void
}

/**
 * Rule 3 made visible. When Arran comes back to the app after a timer has
 * expired, this is the first thing he sees: which timer, and how long ago.
 * Never a quiet 00:00.
 */
export function AlarmBanner({ due, now, labelFor, onDismiss }: Props) {
  if (due.length === 0) return null

  return (
    <div className="alarm" role="alert">
      <div className="alarm__list">
        {due.map((timer) => (
          <p className="alarm__item" key={timer.id}>
            <strong>{labelFor(timer)}</strong> finished{' '}
            {formatSince(overrunMs(timer, now))}
          </p>
        ))}
      </div>
      <button className="alarm__dismiss" onClick={onDismiss}>
        Stop {due.length > 1 ? 'alarms' : 'alarm'}
      </button>
    </div>
  )
}
