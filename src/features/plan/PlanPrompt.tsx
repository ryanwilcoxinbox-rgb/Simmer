import { dishStatus, scheduledStart, type Plan, type PlanDish } from '../../core/plan'
import { formatClock, formatCompact, formatSince } from '../../core/format'

interface Props {
  plan: Plan
  due: PlanDish[]
  now: number
  onStart: (dish: PlanDish) => void
}

/**
 * The loud half of a meal plan: what needs to go on the heat right now.
 *
 * Tapping the button does two things at once, and that is the point. It tells
 * the plan the food has gone on, and it starts a labelled countdown for it. So
 * "put the rice on" costs one tap, the same as auto-starting would, but the
 * timer only ever begins when the food actually did.
 */
export function PlanPrompt({ plan, due, now, onStart }: Props) {
  if (due.length === 0) return null

  return (
    <div className="prompt" role="alert">
      {due.map((dish) => {
        const late = dishStatus(dish, plan, now) === 'overdue'
        const lateBy = now - scheduledStart(dish, plan)

        return (
          <div className="prompt__item" key={dish.id}>
            <p className="prompt__text">
              Put the <strong>{dish.label || 'next dish'}</strong> on
              {late ? (
                <span className="prompt__late">
                  {' '}
                  Due at {formatClock(scheduledStart(dish, plan))},{' '}
                  {formatSince(lateBy)}.
                </span>
              ) : (
                <span className="prompt__cook">
                  {' '}
                  It takes {formatCompact(dish.cookMs)}.
                </span>
              )}
            </p>
            <button className="prompt__start" onClick={() => onStart(dish)}>
              Started it, begin the timer
            </button>
          </div>
        )
      })}
    </div>
  )
}
