import type { InstallAdvice } from '../../core/install'
import { promptInstall } from '../../platform/install'

interface Props {
  advice: InstallAdvice
  onDismiss: () => void
}

/**
 * Asks once, politely, to be put on the Home Screen.
 *
 * Worth asking because installed is genuinely a different app: no Safari
 * chrome, the full screen, and better behaviour when it is not in front. It is
 * also the state every bit of the iOS work assumed.
 *
 * It never appears once installed, and dismissing it is permanent. A prompt
 * that comes back is nagging, and this one has nothing new to say the second
 * time.
 */
export function InstallPrompt({ advice, onDismiss }: Props) {
  return (
    <div className="install">
      <p className="install__lead">
        <strong>Add Simmer to your Home Screen.</strong> It opens full screen
        without the browser bars, and the alarms behave better.
      </p>

      {advice === 'ios-safari' && (
        <ol className="install__steps">
          <li>
            Tap the Share button at the bottom of Safari, the square with an
            arrow coming out of it.
          </li>
          <li>Scroll down and tap "Add to Home Screen".</li>
          <li>Tap "Add", then open Simmer from the new icon.</li>
        </ol>
      )}

      {/*
        The case that catches people out. Every browser on an iPhone is Safari
        underneath, but only Safari itself can add to the Home Screen: the
        option is not in Chrome's menu at all. Sending someone looking for it
        would be worse than saying nothing.
      */}
      {advice === 'ios-other-browser' && (
        <p className="install__note">
          On an iPhone, only Safari can do this. Open this same page in Safari
          and the option will appear under the Share button.
        </p>
      )}

      {advice === 'android-menu' && (
        <ol className="install__steps">
          <li>Open your browser's menu, the three dots.</li>
          <li>Tap "Install app" or "Add to Home screen".</li>
        </ol>
      )}

      {advice === 'desktop' && (
        <p className="install__note">
          You are on a computer. Simmer is built for a phone, so this is worth
          doing there instead.
        </p>
      )}

      <div className="install__actions">
        {advice === 'prompt-available' && (
          <button
            className="install__add"
            onClick={async () => {
              if (await promptInstall()) onDismiss()
            }}
          >
            Add to Home Screen
          </button>
        )}
        <button className="install__dismiss" onClick={onDismiss}>
          {advice === 'prompt-available' ? 'Not now' : "Done, don't show again"}
        </button>
      </div>
    </div>
  )
}
