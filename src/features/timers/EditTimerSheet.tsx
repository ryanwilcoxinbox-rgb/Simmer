import { useEffect, useRef } from 'react'
import { MAX_DURATION_MS, type Timer, type TimerMode } from '../../core/timers'
import { formatDuration } from '../../core/format'

/** Quick presets for the durations that actually come up in a kitchen. */
const PRESET_MINUTES = [1, 2, 3, 5, 8, 10, 12, 15, 20, 25, 30, 45]

interface Props {
  timer: Timer
  fallbackLabel: string
  canRemove: boolean
  onLabelChange: (label: string) => void
  onModeChange: (mode: TimerMode) => void
  onDurationChange: (ms: number) => void
  onRemove: () => void
  onClose: () => void
}

export function EditTimerSheet({
  timer,
  fallbackLabel,
  canRemove,
  onLabelChange,
  onModeChange,
  onDurationChange,
  onRemove,
  onClose,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const adjust = (deltaMinutes: number) =>
    onDurationChange(timer.durationMs + deltaMinutes * 60_000)

  return (
    <div className="sheet__scrim" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Edit timer"
        // Clicks inside the sheet must not reach the scrim and close it.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__header">
          <h2 className="sheet__title">Edit timer</h2>
          <button ref={closeRef} className="sheet__done" onClick={onClose}>
            Done
          </button>
        </div>

        <label className="field">
          <span className="field__label">Label</span>
          <input
            className="field__input"
            value={timer.label}
            placeholder={fallbackLabel}
            maxLength={24}
            enterKeyHint="done"
            onChange={(event) => onLabelChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
          />
        </label>

        <div className="field">
          <span className="field__label">Mode</span>
          <div className="segmented">
            {(['countdown', 'stopwatch'] as const).map((mode) => (
              <button
                key={mode}
                className="segmented__option"
                aria-pressed={timer.mode === mode}
                onClick={() => onModeChange(mode)}
              >
                {mode === 'countdown' ? 'Countdown' : 'Stopwatch'}
              </button>
            ))}
          </div>
          {timer.mode === 'stopwatch' && (
            <p className="field__hint">Counts up from zero. No alarm.</p>
          )}
        </div>

        {timer.mode === 'countdown' && (
          <div className="field">
            <span className="field__label">Length</span>
            <div className="duration">
              <button
                className="duration__step"
                onClick={() => adjust(-1)}
                disabled={timer.durationMs <= 0}
                aria-label="One minute less"
              >
                -1
              </button>
              <span className="duration__value">
                {formatDuration(timer.durationMs)}
              </span>
              <button
                className="duration__step"
                onClick={() => adjust(1)}
                disabled={timer.durationMs >= MAX_DURATION_MS}
                aria-label="One minute more"
              >
                +1
              </button>
            </div>

            <div className="presets">
              {PRESET_MINUTES.map((minutes) => (
                <button
                  key={minutes}
                  className="presets__option"
                  aria-pressed={timer.durationMs === minutes * 60_000}
                  onClick={() => onDurationChange(minutes * 60_000)}
                >
                  {minutes}m
                </button>
              ))}
            </div>
            <p className="field__hint">
              Changing the length while a timer runs just moves the finish line.
              It does not restart it.
            </p>
          </div>
        )}

        {canRemove && (
          <button className="sheet__remove" onClick={onRemove}>
            Remove this timer
          </button>
        )}
      </div>
    </div>
  )
}
