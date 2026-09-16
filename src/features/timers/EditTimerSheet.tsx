import { useEffect, useRef } from 'react'
import type { Timer, TimerMode } from '../../core/timers'
import { DurationPicker } from './DurationPicker'

interface Props {
  timer: Timer
  fallbackLabel: string
  canRemove: boolean
  onLabelChange: (label: string) => void
  onModeChange: (mode: TimerMode) => void
  onDurationChange: (ms: number) => void
  onDurationAdjust: (deltaMs: number) => void
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
  onDurationAdjust,
  onRemove,
  onClose,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Move focus into the sheet once, when it opens, and never again.
  //
  // This used to focus the Done button and list onClose as a dependency. The
  // parent hands down a fresh onClose on every render, and typing a letter
  // re-renders the parent, so every single keystroke in the label field pulled
  // focus onto Done and shut the iPhone keyboard. Focusing the container
  // rather than a button also avoids popping the keyboard open unasked.
  useEffect(() => {
    sheetRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet__scrim" onClick={onClose}>
      <div
        ref={sheetRef}
        className="sheet"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Edit timer"
        // Clicks inside the sheet must not reach the scrim and close it.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__header">
          <h2 className="sheet__title">Edit timer</h2>
          <button className="sheet__done" onClick={onClose}>
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
          <DurationPicker
            durationMs={timer.durationMs}
            onChange={onDurationChange}
            onAdjust={onDurationAdjust}
          />
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
