/**
 * Working out how, or whether, to tell someone to install Simmer.
 *
 * Adding it to the Home Screen is not a nicety. Installed, it opens without
 * Safari's chrome, gets the whole screen, and behaves better when it is not in
 * front. Run as a browser tab it is a worse app in every one of those ways.
 *
 * The instructions genuinely differ by browser, and one case matters more than
 * the rest: on an iPhone, only Safari can add to the Home Screen. Open the
 * link in Chrome and the option simply is not in the menu. Telling a Chrome
 * user to "tap Share, then Add to Home Screen" sends them looking for
 * something that is not there, which is worse than saying nothing.
 *
 * Pure, so the awkward combinations can be tested without owning the devices.
 */

export type InstallAdvice =
  /** Already installed, or running standalone. Say nothing. */
  | 'installed'
  /** iPhone or iPad in Safari: the Share sheet route. */
  | 'ios-safari'
  /** iPhone or iPad in another browser: it cannot be done from here at all. */
  | 'ios-other-browser'
  /** The browser has offered us a real install prompt to trigger. */
  | 'prompt-available'
  /** Android without a prompt: the browser menu route. */
  | 'android-menu'
  /** A desktop browser. Installing is possible but hardly the point. */
  | 'desktop'

export interface Environment {
  userAgent: string
  /** Already launched from the Home Screen. */
  standalone: boolean
  /** The browser fired beforeinstallprompt and we kept it. */
  canPrompt: boolean
  /** Distinguishes an iPad, which claims to be a Mac, from a real Mac. */
  maxTouchPoints: number
}

/** iPadOS reports itself as a Macintosh, and only a touchscreen gives it away. */
export function isApplePhoneOrTablet(env: Environment): boolean {
  if (/iPhone|iPod|iPad/.test(env.userAgent)) return true
  return /Macintosh/.test(env.userAgent) && env.maxTouchPoints > 1
}

/**
 * Every iOS browser is Safari underneath, so they all say "Safari" in the user
 * agent. Only the wrappers add their own marker, which makes the markers the
 * reliable thing to look for rather than the word Safari.
 */
export function isIosSafari(env: Environment): boolean {
  if (!isApplePhoneOrTablet(env)) return false
  return !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|GSA/.test(env.userAgent)
}

export function installAdvice(env: Environment): InstallAdvice {
  if (env.standalone) return 'installed'

  if (isApplePhoneOrTablet(env)) {
    return isIosSafari(env) ? 'ios-safari' : 'ios-other-browser'
  }

  // Android and desktop Chrome hand us a prompt we can fire ourselves, which
  // is always better than describing a menu.
  if (env.canPrompt) return 'prompt-available'
  if (/Android/.test(env.userAgent)) return 'android-menu'
  return 'desktop'
}

/** Whether it is worth interrupting someone with this at all. */
export function shouldOfferInstall(advice: InstallAdvice): boolean {
  return advice !== 'installed'
}
