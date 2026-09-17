import { useEffect } from 'react'
import { useNow } from '../../platform/useNow'
import { useWakeLock } from '../../platform/useWakeLock'
import * as audio from '../../platform/audio'
import { remainingMs, unacknowledgedFinished } from '../../core/timers'
import { dueDishes } from '../../core/plan'
import { connectedPlan } from '../../core/planTimers'
import { useSettings } from '../settings/settingsStore'
import { usePlanContext } from '../plan/planStore'
import { useTimersContext } from '../timers/timersStore'

/**
 * Everything that has to keep working while Arran is cooking, wherever he
 * happens to be looking.
 *
 * This renders nothing. It exists purely to hold the wake lock and the alarms
 * above the tab bar.
 *
 * It used to live inside the Timers screen, and the app throws that screen
 * away when you change tab. So starting a timer and then opening the Guide
 * meant the screen stopped being held awake and, far worse, the alarm went
 * completely silent: a timer that expired while he was browsing made no sound
 * at all and only rang when he happened to come back. Measured, not guessed:
 * zero tones during the expiry, twelve on return.
 *
 * That was particularly bad because the Guide's whole purpose is launching
 * timers, so the most natural path through the app was also the one that lost
 * the alarm. Rules 2 and 3 are app-wide promises, so they live at app level.
 */
export function CookingSafeguards() {
  const timers = useTimersContext()
  const plan = usePlanContext()
  const { settings } = useSettings()

  // Tick while anything is counting or a plan is live, so the safeguards can
  // notice a timer finishing or a dish falling due.
  const now = useNow(timers.anyRunning || plan.plan !== null)

  const livePlan = connectedPlan(plan.plan, timers.timers, now)
  const finished = unacknowledgedFinished(timers.timers, now)
  const alarming = finished.length > 0
  // Hold off while the plan editor is open: being chimed at mid-sentence while
  // typing a dish name is no way to be greeted.
  const prompting =
    livePlan !== null && !plan.editorOpen && dueDishes(livePlan, now).length > 0

  // Rule 2: keep the screen awake for as long as anything is counting.
  useWakeLock(timers.anyRunning)

  // Rule 3 and 4: make a finished timer loud, including one that expired while
  // the app was in the background or on another tab.
  useEffect(() => {
    if (!alarming) {
      audio.stopAlarm()
      return
    }

    const sound = () => {
      audio.resume()
      // Drop any copy queued in advance by the experiment, so the alarm is not
      // heard twice over.
      audio.disarmAll()
      audio.stopAlarm()
      audio.startAlarm()
    }
    sound()

    // On a cold start the audio system has never been opened, because iOS only
    // allows that during a tap. So a timer that expired while the app was
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
   * A dish falling due gets its own, softer sound. It gives way entirely while
   * a timer alarm is going: two different repeating sounds at once is noise,
   * and "something has finished" is the more urgent of the two.
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

  // Keep the experiment's pre-booked alarms in step with what is running. This
  // lives in an effect rather than a Start handler so that pausing, resetting
  // and retargeting a timer all cancel its booking automatically.
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

  return null
}
