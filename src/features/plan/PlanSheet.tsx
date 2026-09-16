import { useEffect, useRef } from 'react'
import type { Plan, PlanDish } from '../../core/plan'
import { longestCookMs, scheduledStart, soonestReadyAt } from '../../core/plan'
import { formatClock, formatCompact } from '../../core/format'

interface Props {
  plan: Plan
  now: number
  canAddDish: boolean
  onLabelChange: (id: string, label: string) => void
  onCookAdjust: (id: string, deltaMs: number) => void
  onRemoveDish: (id: string) => void
  onAddDish: () => void
  onReadyAdjust: (deltaMs: number) => void
  onReadyAsSoonAsPossible: () => void
  onClear: () => void
  onClose: () => void
}

const READY_STEPS = [-30, -10, 10, 30]
const COOK_STEPS = [-5, -1, 1, 5]

export function PlanSheet({
  plan,
  now,
  canAddDish,
  onLabelChange,
  onCookAdjust,
  onRemoveDish,
  onAddDish,
  onReadyAdjust,
  onReadyAsSoonAsPossible,
  onClear,
  onClose,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Focus the panel once on open, never on re-render. See EditTimerSheet for
  // what happens otherwise: every keystroke shuts the keyboard.
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

  const soonest = soonestReadyAt(plan, now)

  return (
    <div className="sheet__scrim" onClick={onClose}>
      <div
        ref={sheetRef}
        className="sheet"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Plan a meal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__header">
          <h2 className="sheet__title">Finish together</h2>
          <button className="sheet__done" onClick={onClose}>
            Done
          </button>
        </div>

        <p className="field__hint" style={{ marginTop: 0 }}>
          Tell Simmer how long each thing takes and when you want to eat. It
          works out when each one goes on and tells you at the time.
        </p>

        <div className="field">
          <span className="field__label">Ready at</span>
          <div className="duration__readout">{formatClock(plan.readyAt)}</div>

          <div className="steps">
            <span className="steps__name">Minutes</span>
            <div className="steps__buttons">
              {READY_STEPS.map((step) => (
                <button
                  key={step}
                  className="steps__button"
                  aria-label={`${step > 0 ? 'Later by' : 'Earlier by'} ${Math.abs(step)} minutes`}
                  onClick={() => onReadyAdjust(step * 60_000)}
                >
                  {step > 0 ? `+${step}` : step}
                </button>
              ))}
            </div>
          </div>

          <button className="wide-button" onClick={onReadyAsSoonAsPossible}>
            As soon as possible ({formatClock(soonest)})
          </button>

          <p className="field__hint">
            The longest dish takes {formatCompact(longestCookMs(plan.dishes))}, so
            the mealtime will not go earlier than {formatClock(soonest)}.
          </p>
        </div>

        <div className="field">
          <span className="field__label">Dishes</span>
          {plan.dishes.map((dish, index) => (
            <DishEditor
              key={dish.id}
              dish={dish}
              index={index}
              plan={plan}
              canRemove={plan.dishes.length > 1}
              onLabelChange={(label) => onLabelChange(dish.id, label)}
              onCookAdjust={(delta) => onCookAdjust(dish.id, delta)}
              onRemove={() => onRemoveDish(dish.id)}
            />
          ))}

          {canAddDish && (
            <button className="add-row" onClick={onAddDish}>
              Add a dish
            </button>
          )}
        </div>

        <button className="sheet__remove" onClick={onClear}>
          Scrap this plan
        </button>
      </div>
    </div>
  )
}

function DishEditor({
  dish,
  index,
  plan,
  canRemove,
  onLabelChange,
  onCookAdjust,
  onRemove,
}: {
  dish: PlanDish
  index: number
  plan: Plan
  canRemove: boolean
  onLabelChange: (label: string) => void
  onCookAdjust: (deltaMs: number) => void
  onRemove: () => void
}) {
  const fallback = `Dish ${index + 1}`

  return (
    <div className="dish">
      <div className="dish__top">
        <input
          className="field__input dish__label"
          value={dish.label}
          placeholder={fallback}
          maxLength={24}
          enterKeyHint="done"
          aria-label={`Name of dish ${index + 1}`}
          onChange={(event) => onLabelChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        {canRemove && (
          <button
            className="dish__remove"
            aria-label={`Remove ${dish.label || fallback}`}
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>

      <div className="steps">
        <span className="steps__name">{formatCompact(dish.cookMs)}</span>
        <div className="steps__buttons">
          {COOK_STEPS.map((step) => (
            <button
              key={step}
              className="steps__button"
              disabled={step < 0 && dish.cookMs <= 0}
              aria-label={`${step > 0 ? 'Add' : 'Subtract'} ${Math.abs(step)} minutes from ${dish.label || fallback}`}
              onClick={() => onCookAdjust(step * 60_000)}
            >
              {step > 0 ? `+${step}` : step}
            </button>
          ))}
        </div>
      </div>

      <p className="dish__slot">
        {dish.startedAt === null
          ? `Goes on at ${formatClock(scheduledStart(dish, plan))}`
          : `Started at ${formatClock(dish.startedAt)}`}
      </p>
    </div>
  )
}
