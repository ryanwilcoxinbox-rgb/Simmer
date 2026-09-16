import {
  allStarted,
  dishStatus,
  projectedReadyAt,
  scheduledStart,
  slippageMs,
  upcomingDishes,
  type Plan,
} from '../../core/plan'
import { formatClock, formatCompact, formatUntil } from '../../core/format'

interface Props {
  plan: Plan
  now: number
  onEdit: () => void
}

/**
 * The quiet state of a meal plan: what is coming and when. The loud state,
 * when something needs to go on right now, is PlanPrompt.
 */
/**
 * Below this, being behind is not worth mentioning. A few seconds pass just
 * filling the plan in, and "running 11s behind" is pedantry, not information.
 */
const WORTH_MENTIONING_MS = 60_000

export function PlanCard({ plan, now, onEdit }: Props) {
  const next = upcomingDishes(plan, now)[0]
  const slippage = slippageMs(plan, now)
  const slipped = slippage >= WORTH_MENTIONING_MS ? slippage : 0
  const done = allStarted(plan)

  return (
    <button className="plan" onClick={onEdit}>
      <span className="plan__row">
        <span className="plan__label">
          {done ? 'Everything is on' : 'Finish together'}
        </span>
        <span className="plan__edit">Edit</span>
      </span>

      <span className="plan__ready">
        Ready at {formatClock(projectedReadyAt(plan, now))}
      </span>

      {slipped > 0 && (
        <span className="plan__slip">
          Running {Math.round(slipped / 60_000)} min behind the{' '}
          {formatClock(plan.readyAt)} you asked for
        </span>
      )}

      {next ? (
        <span className="plan__next">
          Next: {next.label || 'unnamed dish'} at{' '}
          {formatClock(scheduledStart(next, plan))},{' '}
          {formatUntil(scheduledStart(next, plan) - now)}
        </span>
      ) : (
        <span className="plan__next">
          {done
            ? 'Nothing left to put on.'
            : 'Everything is due. Check the prompts above.'}
        </span>
      )}

      <span className="plan__dishes">
        {plan.dishes.map((dish) => {
          const status = dishStatus(dish, plan, now)
          return (
            <span className={`pill pill--${status}`} key={dish.id}>
              {dish.label || 'Dish'} {formatCompact(dish.cookMs)}
            </span>
          )
        })}
      </span>
    </button>
  )
}
