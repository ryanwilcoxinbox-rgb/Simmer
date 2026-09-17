import { formatCompact } from '../../core/format'
import { NumberInput } from './NumberInput'

const PRESETS = [30, 60, 300, 600, 900, 1800, 3600, 7200]
export function DurationPicker({ durationMs, onChange }: { durationMs: number; onChange: (ms: number) => void }) {
  const hours = Math.floor(durationMs / 3_600_000)
  const minutes = Math.floor(durationMs / 60_000) % 60
  const seconds = Math.floor(durationMs / 1000) % 60
  return <div className="field duration-editor">
    <span className="field__label">How long?</span>
    <div className="duration-inputs">
      <label>Hours<NumberInput label="Hours" value={hours} max={24} onChange={(value) => onChange(value * 3_600_000 + minutes * 60_000 + seconds * 1000)} /></label>
      <label>Minutes<NumberInput label="Minutes" value={minutes} max={59} onChange={(value) => onChange(hours * 3_600_000 + value * 60_000 + seconds * 1000)} /></label>
      <label>Seconds<NumberInput label="Seconds" value={seconds} max={59} onChange={(value) => onChange(hours * 3_600_000 + minutes * 60_000 + value * 1000)} /></label>
    </div>
    <p className="field__hint">Tap a number to type an exact time, or choose a shortcut.</p>
    <div className="presets">{PRESETS.map((seconds) => <button key={seconds} className="presets__option" aria-pressed={durationMs === seconds * 1000} onClick={() => onChange(seconds * 1000)}>{seconds >= 3600 ? seconds / 3600 + ' hr' : formatCompact(seconds * 1000)}</button>)}</div>
    <p className="field__hint">Editing a running timer changes its total cooking time without restarting it.</p>
  </div>
}
