import { useCallback, useState } from 'react'
import { useNow } from '../../platform/useNow'
import * as audio from '../../platform/audio'
import { unacknowledgedFinished, type Timer } from '../../core/timers'
import { dueDishes, scheduledStart, type PlanDish } from '../../core/plan'
import { useSettings } from '../settings/settingsStore'
import { usePlanContext } from '../plan/planStore'
import { PlanCard } from '../plan/PlanCard'
import { PlanPrompt } from '../plan/PlanPrompt'
import { PlanSheet } from '../plan/PlanSheet'
import { connectedPlan } from '../../core/planTimers'
import { formatClock, formatCompact } from '../../core/format'
import { useTimersContext } from './timersStore'
import { TimerRow } from './TimerRow'
import { EditTimerSheet } from './EditTimerSheet'
import { AlarmBanner } from './AlarmBanner'
import { PotMark } from '../shell/icons'

export function TimersScreen() {
  const timers = useTimersContext()
  const plan = usePlanContext()
  const { settings, update } = useSettings()

  /*
   * The clock has to tick while a plan is live even with nothing counting,
   * because the plan is watching for the moment a dish falls due. Without the
   * second condition a plan would sit silent until something else woke the
   * screen up.
   */
  const now = useNow(timers.anyRunning || plan.plan !== null)
  const livePlan = connectedPlan(plan.plan, timers.timers, now)
  const linkedIds = new Set(livePlan?.dishes.map((dish) => dish.id))

  const [editingId, setEditingId] = useState<string | null>(null)
  const planOpen = plan.editorOpen
  const setPlanOpen = plan.setEditorOpen
  // Stable identity, so the sheet's key handler is not torn down and rebuilt
  // on every keystroke in the label field.
  const closeSheet = useCallback(() => setEditingId(null), [setEditingId])
  const closePlan = useCallback(() => setPlanOpen(false), [setPlanOpen])

  const finished = unacknowledgedFinished(timers.timers, now)
  /*
   * No prompting while the plan sheet is open. Creating a plan starts with a
   * dish due immediately, and being chimed at mid-sentence while typing its
   * name is no way to be greeted. The plan goes live when the sheet closes.
   */
  const dishesDue = livePlan && !planOpen ? dueDishes(livePlan, now) : []

  const handleStart = (timer: Timer) => {
    // Rule 4: the audio system must be opened inside the tap itself. Doing it
    // when the timer ends is too late, and the alarm is silently dropped.
    audio.unlock()
    timers.start(timer.id)
  }

  /*
   * One tap does both halves of the job: the plan records that the food went
   * on, and a labelled countdown starts for it. Keeping these together is what
   * makes prompting as cheap as auto-starting would have been, without the
   * timer ever running ahead of the food.
   */
  const handleStartDish = (dish: PlanDish) => {
    audio.unlock()
    const clock = Date.now()
    plan.startDish(dish.id, clock)
    if (timers.timers.some((timer) => timer.id === dish.id)) timers.start(dish.id)
    else timers.startPlanned(dish, clock)
  }

  const editingIndex = timers.timers.findIndex((t) => t.id === editingId)
  const editing = editingIndex === -1 ? null : timers.timers[editingIndex]
  const nameFor = (index: number) => `Timer ${index + 1}`
  const labelOf = (timer: Timer) =>
    timer.label || nameFor(timers.timers.indexOf(timer))

  return (
    <>
      <header className="timer-header"><h1 className="timer-brand">simmer<span>.</span></h1><PotMark /></header>

      <AlarmBanner
        due={finished}
        now={now}
        labelFor={labelOf}
        onDismiss={() => {
          audio.stopAlarm()
          audio.disarmAll()
          timers.acknowledgeAll()
        }}
      />

      {livePlan && (
        <PlanPrompt
          plan={livePlan}
          due={dishesDue}
          now={now}
          onStart={handleStartDish}
        />
      )}

      {/*
        A one-off nudge, because a web page cannot read the silent switch and
        so cannot warn you at the moment it actually matters. It is a nudge
        only. The standing line below is the real safeguard, per rule 5.
      */}
      {!settings.silentReminderDismissed && (
        <div className="reminder">
          <p className="reminder__text">
            <strong>Check your ringer is on.</strong> Simmer cannot tell whether
            your phone is on silent, and an alarm you cannot hear is no use.
            There is a test button in Settings.
          </p>
          <button
            className="reminder__ok"
            onClick={() => update({ silentReminderDismissed: true })}
          >
            Got it
          </button>
        </div>
      )}

      {/* Rule 5: said on the screen where it matters, not in onboarding. */}
      <p className="notice">
        {timers.anyRunning
          ? 'Screen stays on. Keep the app open and your ringer on.'
          : 'Alarms need this app open and your ringer on.'}
      </p>

      {livePlan && (
        <PlanCard plan={livePlan} now={now} onEdit={() => setPlanOpen(true)} />
      )}

      {plan.plan === null && (
        <button
          className="add-row add-row--plan"
          onClick={() => {
            setPlanOpen(true)
          }}
        >
          <span>Finish together</span><span className="plan-entry__hint">Plan when each dish goes on <span aria-hidden="true">↗</span></span>
        </button>
      )}

      {livePlan && <section className="planned-timers" aria-label="Meal plan timers">
        <h2 className="planned-timers__heading">Your meal · connected timers</h2>
        {livePlan.dishes.map((dish) => {
          const timer = timers.timers.find((item) => item.id === dish.id)
          return timer ? <TimerRow key={dish.id} timer={timer} now={now} fallbackLabel="Dish" linkedToPlan
            onStart={() => handleStart(timer)} onPause={() => timers.pause(timer.id)} onEdit={() => setEditingId(timer.id)} />
            : <div className="row row--scheduled" key={dish.id}><div className="row__info"><span className="row__label">{dish.label || 'Dish'}</span><span className="scheduled-time">{formatCompact(dish.cookMs)} cooking</span><span className="row__mode">{dish.startedAt === null ? 'Start at ' + formatClock(scheduledStart(dish, livePlan)) : 'Started before this update · timer not linked'}</span></div><button className="row__button" aria-label={`${dish.startedAt === null ? 'Start' : 'Restart'} ${dish.label || 'dish'}`} onClick={() => handleStartDish(dish)}>{dish.startedAt === null ? 'Start' : 'Restart'}</button></div>
        })}
        {livePlan.dishes.some((dish) => { const timer = timers.timers.find((item) => item.id === dish.id); return timer && timer.runningSince === null && timer.accumulatedMs > 0 }) && <p className="field__hint">A meal timer is paused. The ready time assumes you resume now.</p>}
      </section>}
      <div className="timers-heading"><h2>{livePlan ? 'Other timers' : 'Your timers'} <span>{timers.timers.filter((timer) => !linkedIds.has(timer.id)).length}</span></h2>{timers.canAdd && <button onClick={timers.add}>+ Add timer</button>}</div>
      <div className="rows">
        {timers.timers.filter((timer) => !linkedIds.has(timer.id)).map((timer) => (
          <TimerRow
            key={timer.id}
            timer={timer}
            now={now}
            fallbackLabel={labelOf(timer)}
            onStart={() => handleStart(timer)}
            onPause={() => timers.pause(timer.id)}
            onEdit={() => setEditingId(timer.id)}
          />
        ))}
      </div>


      {editing && (
        <EditTimerSheet
          timer={editing}
          fallbackLabel={nameFor(editingIndex)}
          canRemove={timers.canRemove && !linkedIds.has(editing.id)}
          linkedToPlan={linkedIds.has(editing.id)}
          onLabelChange={(label) => timers.setLabel(editing.id, label)}
          onModeChange={(mode) => timers.setMode(editing.id, mode)}
          onDurationChange={(ms) => {
            // The finish line moved, so the booked alarm is now at the wrong
            // time. Dropping it lets the effect above book a corrected one.
            audio.disarm(editing.id)
            timers.setDuration(editing.id, ms)
          }}
          onReset={() => { audio.disarm(editing.id); timers.reset(editing.id) }}
          onRemove={() => {
            audio.disarm(editing.id)
            timers.remove(editing.id)
            closeSheet()
          }}
          onClose={closeSheet}
        />
      )}

      {planOpen && (
        <PlanSheet plan={livePlan} now={now}
          onSave={(next) => {
            for (const dish of next.dishes) {
              if (timers.timers.some((timer) => timer.id === dish.id)) {
                audio.disarm(dish.id)
                timers.setLabel(dish.id, dish.label)
                timers.setDuration(dish.id, dish.cookMs)
              }
            }
            audio.unlock()
            plan.save(next)
            closePlan()
          }}
          onClear={() => { plan.clear(); closePlan() }}
          onClose={closePlan} />
      )}
    </>
  )
}
