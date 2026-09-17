/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register'

/**
 * Keeping the installed app up to date.
 *
 * The problem this solves: a service worker only goes looking for a new
 * version when the page navigates. An app added to the Home Screen and left in
 * the app switcher may not navigate for days, so it can sit on a build from
 * last week while the server has had a new one all along. That is exactly what
 * happened to Arran, who reported that a feature was missing when it had been
 * live for days.
 *
 * So we ask, rather than waiting to be told: once a minute, and every time the
 * app comes back on screen, which is the moment that matters most because it
 * is when he is about to use it.
 */

const CHECK_EVERY_MS = 60_000

let checkNow: (() => void) | null = null

export function setupAutoUpdate(): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      const check = () => {
        // A failed check is not worth reporting. It means the phone is offline,
        // which for an offline-first app is a normal Tuesday.
        void registration.update().catch(() => {})
      }
      checkNow = check

      check()
      window.setInterval(check, CHECK_EVERY_MS)

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) check()
      })
    },
  })
}

/** Used by the Settings screen, so an update can be chased by hand. */
export function checkForUpdate(): boolean {
  if (!checkNow) return false
  checkNow()
  return true
}

/** The build this app is running, so Settings can prove which version it is. */
export function buildStamp(): string {
  try {
    return new Date(__BUILD_TIME__).toLocaleString()
  } catch {
    return 'unknown'
  }
}
