import { useCallback, useEffect, useState } from 'react'
import { useNow } from '../../platform/useNow'
import { useWakeLock } from '../../platform/useWakeLock'
import * as audio from '../../platform/audio'
import { remainingMs, unacknowledgedFinished, type Timer } from '../../core/timers'
import { useSettings } from '../settings/settingsStore'
import { useTimers } from './useTimers'
import { TimerRow } from './TimerRow'
import { EditTimerSheet } from './EditTimerSheet'
import { AlarmBanner } from './AlarmBanner'

export function TimersScreen() {
  const timers = useTimers()
  const { settings } = useSettings()
  // The clock only ticks while something is counting, to save battery.
  const now = useNow(timers.anyRunning)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Stable identity, so the sheet's key handler is not torn down and rebuilt
  // on every keystroke in the label field.
  const closeSheet = useCallback(() => setEditingId(null), [])

  // Rule 2: hold the screen awake for as long as anything is counting.
  useWakeLock(timers.anyRunning)

  const due = unacknowledgedFinished(timers.timers, now)
  const alarming = due.length > 0

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

  const editingIndex = timers.timers.findIndex((t) => t.id === editingId)
  const editing = editingIndex === -1 ? null : timers.timers[editingIndex]
  const nameFor = (index: number) => `Timer ${index + 1}`
  const labelOf = (timer: Timer) =>
    timer.label || nameFor(timers.timers.indexOf(timer))

  return (
    <>
      <h1 className="screen__title">Simmer</h1>

      <AlarmBanner
        due={due}
        now={now}
        labelFor={labelOf}
        onDismiss={() => {
          audio.stopAlarm()
          audio.disarmAll()
          timers.acknowledgeAll()
        }}
      />

      {/* Rule 5: said on the screen where it matters, not in onboarding. */}
      <p className="notice">
        {timers.anyRunning
          ? 'Screen stays on. Keep this app open for alarms.'
          : 'Alarms only sound while this app is open on screen.'}
      </p>

      <div className="rows">
        {timers.timers.map((timer, index) => (
          <TimerRow
            key={timer.id}
            timer={timer}
            now={now}
            fallbackLabel={nameFor(index)}
            onStart={() => handleStart(timer)}
            onPause={() => timers.pause(timer.id)}
            onReset={() => timers.reset(timer.id)}
            onEdit={() => setEditingId(timer.id)}
          />
        ))}
      </div>

      {timers.canAdd && (
        <button className="add-row" onClick={timers.add}>
          Add a timer
        </button>
      )}

      {editing && (
        <EditTimerSheet
          timer={editing}
          fallbackLabel={nameFor(editingIndex)}
          canRemove={timers.canRemove}
          onLabelChange={(label) => timers.setLabel(editing.id, label)}
          onModeChange={(mode) => timers.setMode(editing.id, mode)}
          onDurationChange={(ms) => {
            // The finish line moved, so the booked alarm is now at the wrong
            // time. Dropping it lets the effect above book a corrected one.
            audio.disarm(editing.id)
            timers.setDuration(editing.id, ms)
          }}
          onRemove={() => {
            audio.disarm(editing.id)
            timers.remove(editing.id)
            closeSheet()
          }}
          onClose={closeSheet}
        />
      )}
    </>
  )
}
