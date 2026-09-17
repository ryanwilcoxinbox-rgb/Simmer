import { useState } from 'react'

/** Keep an empty field editable; commit an exact value on blur or Enter. */
export function NumberInput({ value, onChange, label, max, min = 0 }: {
  value: number; onChange: (value: number) => void; label: string; max: number; min?: number
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    const parsed = Number(draft ?? value)
    const next = Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.floor(parsed))) : value
    setDraft(null)
    onChange(next)
  }
  return <input className="field__input" type="number" inputMode="numeric"
    aria-label={label} min={min} max={max} step={1} value={draft ?? String(value)}
    onFocus={(event) => event.currentTarget.select()}
    onChange={(event) => setDraft(event.target.value)} onBlur={commit}
    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }} />
}
