import { useCallback, useEffect, useState } from 'react'
import { useNow } from '../../platform/useNow'
import { useWakeLock } from '../../platform/useWakeLock'
import * as audio from '../../platform/audio'
import { remainingMs, unacknowledgedFinished, type Timer } from '../../core/timers'
import { dueDishes, scheduledStart, type PlanDish } from '../../core/plan'
import { useSettings } from '../settings/settingsStore'
import { usePlan } from '../plan/usePlan'
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
  const plan = usePlan()
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
  const [planOpen, setPlanOpen] = useState(false)
  // Stable identity, so the sheet's key handler is not torn down and rebuilt
  // on every keystroke in the label field.
  const closeSheet = useCallback(() => setEditingId(null), [setEditingId])
  const closePlan = useCallback(() => setPlanOpen(false), [setPlanOpen])

  // Rule 2: hold the screen awake for as long as anything is counting.
  useWakeLock(timers.anyRunning)

  const finished = unacknowledgedFinished(timers.timers, now)
  const alarming = finished.length > 0
  /*
   * No prompting while the plan sheet is open. Creating a plan starts with a
   * dish due immediately, and being chimed at mid-sentence while typing its
   * name is no way to be greeted. The plan goes live when the sheet closes.
   */
  const dishesDue = livePlan && !planOpen ? dueDishes(livePlan, now) : []
  const prompting = dishesDue.length > 0

  // Rule 3 and 4: make a finished timer loud, including one that expired while
  // the app was in the background.
  useEffect(() => {
    if (!alarming) {
      audio.stopAlarm()
      return
    }

    const sound = () => {
      audio.resume()
      // Drop any copy queued in advance by the experiment, so the alarm is
      // not heard twice over.
      audio.disarmAll()
      audio.stopAlarm()
      audio.startAlarm()
    }
    sound()

    // On a cold start the audio system has never been opened, because iOS
    // only allows that during a tap. So a timer that expired while the app was
    // closed shows its banner in silence. Arrange for the very next touch
    // anywhere to open the audio system and sound the alarm properly.
    const soundOnFirstTap = () => {
      audio.unlock()
      sound()
    }
    if (!audio.isReady()) {
      document.addEventListener('pointerdown', soundOnFirstTap, { once: true })
    }

    // iOS suspends the audio system while the app is away, which silences a
    // running alarm. Coming back has to start it off again.
    const onVisible = () => {
      if (!document.hidden) sound()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('pointerdown', soundOnFirstTap)
      document.removeEventListener('visibilitychange', onVisible)
      audio.stopAlarm()
    }
  }, [alarming])

  /*
   * A dish falling due gets its own, softer sound. It also gives way entirely
   * while a timer alarm is going: two different repeating sounds at once is
   * noise, and "something has finished" is the more urgent of the two.
   */
  useEffect(() => {
    if (!prompting || alarming) {
      audio.stopPrompting()
      return
    }
    const chime = () => {
      audio.resume()
      audio.stopPrompting()
      audio.startPrompting()
    }
    chime()

    const chimeOnFirstTap = () => {
      audio.unlock()
      chime()
    }
    if (!audio.isReady()) {
      document.addEventListener('pointerdown', chimeOnFirstTap, { once: true })
    }
    const onVisible = () => {
      if (!document.hidden) chime()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('pointerdown', chimeOnFirstTap)
      document.removeEventListener('visibilitychange', onVisible)
      audio.stopPrompting()
    }
  }, [prompting, alarming])

  // The experiment's silent keep-alive only runs while it is switched on and
  // something is actually counting.
  useEffect(() => {
    audio.setKeepAlive(settings.backgroundAlarm && timers.anyRunning)
  }, [settings.backgroundAlarm, timers.anyRunning])

  // Keep the experiment's pre-booked alarms in step with what is running.
  // This lives in an effect rather than the Start handler so that pausing,
  // resetting and retargeting a timer all cancel its booking automatically,
  // rather than each needing to remember to.
  useEffect(() => {
    if (!settings.backgroundAlarm) {
      audio.disarmAll()
      return
    }
    const clock = Date.now()
    for (const timer of timers.timers) {
      const counting = timer.mode === 'countdown' && timer.runningSince !== null
      if (counting) {
        audio.arm(timer.id, remainingMs(timer, clock))
      } else {
        audio.disarm(timer.id)
      }
    }
  }, [settings.backgroundAlarm, timers.timers])

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
