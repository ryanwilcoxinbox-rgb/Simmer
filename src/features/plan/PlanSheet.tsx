import { useEffect, useRef, useState } from 'react'
import { createDish, scheduledStart, soonestReadyAt, type Plan } from '../../core/plan'
import { formatClock, formatCompact } from '../../core/format'
import { NumberInput } from '../timers/NumberInput'

interface Props {
  plan: Plan | null
  now: number
  onSave: (plan: Plan) => void
  onClear: () => void
  onClose: () => void
}

export function PlanSheet({ plan, now, onSave, onClear, onClose }: Props) {
  const [dishes, setDishes] = useState(() => plan?.dishes ?? [createDish('', 20 * 60_000)])
  const [asap, setAsap] = useState(plan === null)
  const [time, setTime] = useState(() => formatClock(plan?.readyAt ?? now + 3600_000))
  const [error, setError] = useState('')
  const sheet = useRef<HTMLDivElement>(null)
  useEffect(() => { sheet.current?.focus() }, [])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])

  const earliest = soonestReadyAt({ readyAt: now, dishes }, now)
  const chosen = todayAt(time, now)
  const readyAt = asap ? earliest : chosen
  const preview = { dishes, readyAt }
  const possible = Number.isFinite(readyAt) && readyAt >= earliest
  const updateDish = (id: string, change: Partial<Plan['dishes'][number]>) => {
    setDishes((current) => current.map((dish) => dish.id === id ? { ...dish, ...change } : dish))
    setError('')
  }
  const handleSave = (clock: number) => {
    const chosenAtSave = todayAt(time, clock)
    const earliestAtSave = soonestReadyAt({ readyAt: clock, dishes }, clock)
    if (dishes.some((dish) => !dish.label.trim())) { setError('Give each dish a name so you can recognise its timer.'); return }
    if (!asap && (!Number.isFinite(chosenAtSave) || chosenAtSave < earliestAtSave)) { setError(`Choose ${formatClock(Math.ceil(earliestAtSave / 60_000) * 60_000)} or later, or use “As soon as possible”.`); return }
    onSave({ dishes: dishes.map((dish) => ({ ...dish, label: dish.label.trim() })), readyAt: asap ? earliestAtSave : chosenAtSave })
  }

  return <div className="sheet__scrim" onClick={onClose}>
    <div ref={sheet} className="sheet sheet--stable meal-editor" role="dialog" aria-modal="true" aria-label="Plan a meal" tabIndex={-1} onClick={(event) => event.stopPropagation()}>
      <div className="sheet__header"><h2 className="sheet__title">Finish together</h2><button className="sheet__cancel" onClick={onClose}>Cancel</button></div>
      <section className="meal-step" aria-labelledby="meal-dishes">
        <h3 id="meal-dishes"><span>1</span> What are you cooking?</h3>
        <p className="field__hint">Name each dish and enter its total cooking time in minutes. For an hour, type 60.</p>
        {dishes.map((dish, index) => <div className="meal-dish" key={dish.id}>
          <label>Dish {index + 1}<input className="field__input" value={dish.label} placeholder={index === 0 ? 'e.g. Roast chicken' : 'e.g. Rice'} maxLength={24} onChange={(event) => updateDish(dish.id, { label: event.target.value })} /></label>
          <label>Cook time (min)<NumberInput label={`Cook time for dish ${index + 1} in minutes`} value={dish.cookMs / 60_000} min={1} max={1440} onChange={(minutes) => updateDish(dish.id, { cookMs: minutes * 60_000 })} /></label>
          {dishes.length > 1 && <button className="meal-dish__remove" aria-label={`Remove dish ${index + 1}`} onClick={() => setDishes((current) => current.filter((item) => item.id !== dish.id))}>Remove</button>}
          {dish.startedAt !== null && <p className="field__hint">Already started. Editing this time also updates its countdown.</p>}
        </div>)}
        {dishes.length < 8 && <button className="add-row" onClick={() => setDishes((current) => [...current, createDish('', 10 * 60_000)])}>+ Add another dish</button>}
      </section>
      <section className="meal-step" aria-labelledby="meal-time">
        <h3 id="meal-time"><span>2</span> When would you like to eat?</h3>
        <p className="field__hint">Choose a mealtime today. Simmer works backwards to schedule each dish.</p>
        <div className="segmented" role="group" aria-label="Mealtime choice">
          <button className="segmented__option" aria-pressed={asap} onClick={() => setAsap(true)}>As soon as possible</button>
          <button className="segmented__option" aria-pressed={!asap} onClick={() => { setAsap(false); if (chosen < earliest) { const next = Math.ceil(earliest / 60_000) * 60_000; setTime(formatClock(next)) } }}>Choose a time</button>
        </div>
        {asap ? <p className="meal-ready">Earliest mealtime <strong>{formatClock(earliest)}</strong></p> : <div className="meal-clock">
          <label>Mealtime today<input className="field__input" type="time" value={time} onChange={(event) => { setTime(event.target.value); setError('') }} /></label>
        </div>}
        {!possible && <p className="plan__warning">These dishes need until at least {formatClock(Math.ceil(earliest / 60_000) * 60_000)}. Choose a later mealtime.</p>}
      </section>
      <section className="meal-step" aria-labelledby="meal-review">
        <h3 id="meal-review"><span>3</span> Your cooking schedule</h3>
        <p className="field__hint">Saving adds the dishes below your meal plan. When each one goes on, tap Start to begin its connected timer.</p>
        {possible && <ol className="meal-schedule">{[...dishes].sort((a, b) => scheduledStart(a, preview) - scheduledStart(b, preview)).map((dish) => <li key={dish.id}><strong>{dish.startedAt !== null ? 'Started' : formatClock(scheduledStart(dish, preview))}</strong><span>{dish.label || 'Unnamed dish'}<small>{formatCompact(dish.cookMs)} cooking</small></span></li>)}</ol>}
      </section>
      {error && <p className="plan__warning" role="alert">{error}</p>}
      <div className="meal-save"><button className="sheet__done" onClick={() => handleSave(Date.now())}>{plan ? 'Save changes' : 'Save meal plan'}</button></div>
      {plan && <><button className="sheet__remove" onClick={onClear}>Remove meal plan</button><p className="field__hint">Timers already created will remain as ordinary timers.</p></>}
    </div>
  </div>
}

function todayAt(time: string, now: number): number {
  if (!/^\d{2}:\d{2}$/.test(time)) return NaN
  const [hours, minutes] = time.split(':').map(Number)
  if (hours > 23 || minutes > 59) return NaN
  const date = new Date(now)
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}
