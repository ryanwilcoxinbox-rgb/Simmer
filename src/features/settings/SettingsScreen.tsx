import { useState } from 'react'
import * as audio from '../../platform/audio'
import { buildStamp, checkForUpdate } from '../../platform/appUpdate'
import { isWakeLockSupported } from '../../platform/useWakeLock'
import { useSettings } from './settingsStore'

export function SettingsScreen() {
  const { settings, update } = useSettings()
  const [updateNote, setUpdateNote] = useState<string | null>(null)

  const testAlarm = () => {
    // Opened inside the tap, exactly as the real alarm is.
    audio.unlock()
    audio.stopAlarm()
    audio.startAlarm()
    window.setTimeout(audio.stopAlarm, 2600)
  }

  return (
    <>
      <h1 className="screen__title">Settings</h1>

      <div className="field">
        <span className="field__label">Alarm</span>
        <button className="wide-button" onClick={testAlarm}>
          Test the alarm sound
        </button>
        <p className="field__hint">
          Try this with your phone's silent switch turned on. That is the most
          common reason an alarm is never heard.
        </p>
      </div>

      <div className="field">
        <span className="field__label">Background alarm (experimental)</span>
        <div className="segmented">
          {[false, true].map((on) => (
            <button
              key={String(on)}
              className="segmented__option"
              aria-pressed={settings.backgroundAlarm === on}
              onClick={() => update({ backgroundAlarm: on })}
            >
              {on ? 'On' : 'Off'}
            </button>
          ))}
        </div>
        <p className="field__hint">
          Books each alarm with the phone's audio hardware the moment you press
          Start, instead of playing it when the timer ends. It may let an alarm
          sound while Simmer is in the background. It is unproven, and it uses
          more battery. Leave it off unless you are testing it.
        </p>
      </div>

      <div className="field">
        <span className="field__label">Temperature units</span>
        <div className="segmented">
          {(['C', 'F'] as const).map((unit) => (
            <button
              key={unit}
              className="segmented__option"
              aria-pressed={settings.temperatureUnit === unit}
              onClick={() => update({ temperatureUnit: unit })}
            >
              {unit === 'C' ? 'Celsius' : 'Fahrenheit'}
            </button>
          ))}
        </div>
        <p className="field__hint">
          Changes every temperature shown in the Guide.
        </p>
      </div>

      <div className="field">
        <span className="field__label">Version</span>
        <button
          className="wide-button"
          onClick={() => {
            setUpdateNote(
              checkForUpdate()
                ? 'Checking. If there is a new version it will load shortly.'
                : 'Cannot check right now. Close the app fully and reopen it.',
            )
          }}
        >
          Check for updates
        </button>
        <p className="field__hint">
          This copy was built {buildStamp()}. Simmer checks for a new version
          every minute and whenever you come back to it, so you should not
          normally need this button.
        </p>
        {updateNote && <p className="field__hint">{updateNote}</p>}
      </div>

      <div className="placeholder">
        <strong>What this phone supports</strong>
        Keeping the screen awake: {isWakeLockSupported() ? 'yes' : 'no'}
        <br />
        Alarm sound: {audio.isSupported() ? 'yes' : 'no'}
        <br />
        Playing through the silent switch:{' '}
        {audio.audioSessionSupport() === 'supported'
          ? 'the phone offers it, test it above'
          : 'not offered by this browser'}
      </div>
    </>
  )
}
