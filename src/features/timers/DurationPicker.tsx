import { MAX_DURATION_MS } from '../../core/timers'
import { formatCompact, formatDuration } from '../../core/format'

/**
 * Quick presets for the lengths that actually come up in a kitchen, in
 * seconds so that part-minute timings like 90 seconds are first-class rather
 * than an awkward fraction.
 */
const PRESET_SECONDS = [30, 60, 90, 120, 180, 240, 300, 480, 600, 900, 1200, 1800]

/**
 * Coarse and fine adjustment on separate rows. Minutes and seconds are
 * deliberately split: a single stepper either takes forever to reach 40
 * minutes or cannot express 3m30, and Arran wants both.
 */
const MINUTE_STEPS = [-5, -1, 1, 5]
const SECOND_STEPS = [-15, -5, 5, 15]

interface Props {
  durationMs: number
  /** Sets an exact length, for the presets. */
  onChange: (ms: number) => void
  /** Nudges the length, for the steppers. See useTimers.adjustDuration. */
  onAdjust: (deltaMs: number) => void
}

export function DurationPicker({ durationMs, onChange, onAdjust }: Props) {
  const atFloor = durationMs <= 0
  const atCeiling = durationMs >= MAX_DURATION_MS

  return (
    <div className="field">
      <span className="field__label">Length</span>

      <div className="duration__readout">{formatDuration(durationMs)}</div>

      <StepRow
        name="Minutes"
        steps={MINUTE_STEPS}
        unitMs={60_000}
        unitWord="minute"
        onAdjust={onAdjust}
        atFloor={atFloor}
        atCeiling={atCeiling}
      />
      <StepRow
        name="Seconds"
        steps={SECOND_STEPS}
        unitMs={1_000}
        unitWord="second"
        onAdjust={onAdjust}
        atFloor={atFloor}
        atCeiling={atCeiling}
      />

      <div className="presets">
        {PRESET_SECONDS.map((seconds) => (
          <button
            key={seconds}
            className="presets__option"
            aria-pressed={durationMs === seconds * 1000}
            onClick={() => onChange(seconds * 1000)}
          >
            {formatCompact(seconds * 1000)}
          </button>
        ))}
      </div>

      <p className="field__hint">
        Changing the length while a timer runs just moves the finish line. It
        does not restart it.
      </p>
    </div>
  )
}

function StepRow({
  name,
  steps,
  unitMs,
  unitWord,
  onAdjust,
  atFloor,
  atCeiling,
}: {
  name: string
  steps: number[]
  unitMs: number
  unitWord: string
  onAdjust: (deltaMs: number) => void
  atFloor: boolean
  atCeiling: boolean
}) {
  return (
    <div className="steps">
      <span className="steps__name">{name}</span>
      <div className="steps__buttons">
        {steps.map((step) => (
          <button
            key={step}
            className="steps__button"
            disabled={step < 0 ? atFloor : atCeiling}
            aria-label={`${step > 0 ? 'Add' : 'Subtract'} ${Math.abs(step)} ${unitWord}${Math.abs(step) === 1 ? '' : 's'}`}
            onClick={() => onAdjust(step * unitMs)}
          >
            {step > 0 ? `+${step}` : step}
          </button>
        ))}
      </div>
    </div>
  )
}
