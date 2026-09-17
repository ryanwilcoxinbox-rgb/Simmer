import { describe, expect, it } from 'vitest'
import {
  installAdvice,
  isApplePhoneOrTablet,
  isIosSafari,
  shouldOfferInstall,
  type Environment,
} from './install'

/** Real user agent strings, trimmed to the parts that decide the answer. */
const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0 Mobile/15E148 Safari/604.1',
  iphoneFirefox:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/130.0 Mobile/15E148 Safari/605.1.15',
  ipadSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  mac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36',
  windowsChrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
}

const env = (overrides: Partial<Environment>): Environment => ({
  userAgent: UA.iphoneSafari,
  standalone: false,
  canPrompt: false,
  maxTouchPoints: 5,
  ...overrides,
})

describe('already installed', () => {
  it('says nothing at all once running from the Home Screen', () => {
    expect(installAdvice(env({ standalone: true }))).toBe('installed')
    expect(shouldOfferInstall('installed')).toBe(false)
  })

  it('stays quiet even where a prompt is on offer', () => {
    expect(
      installAdvice(env({ userAgent: UA.androidChrome, standalone: true, canPrompt: true })),
    ).toBe('installed')
  })
})

describe('iPhone and iPad', () => {
  it('gives Safari the Share sheet route', () => {
    expect(installAdvice(env({ userAgent: UA.iphoneSafari }))).toBe('ios-safari')
  })

  /*
   * The case worth getting right. Every iOS browser reports "Safari" because
   * they are all Safari underneath, but only actual Safari can add to the Home
   * Screen. Telling a Chrome user to tap Share and look for Add to Home Screen
   * sends them hunting for something that is not in the menu.
   */
  it('tells other iOS browsers they need Safari, rather than a menu that is not there', () => {
    expect(installAdvice(env({ userAgent: UA.iphoneChrome }))).toBe('ios-other-browser')
    expect(installAdvice(env({ userAgent: UA.iphoneFirefox }))).toBe('ios-other-browser')
  })

  it('never offers a Chrome prompt on iOS, even if one were somehow reported', () => {
    expect(installAdvice(env({ userAgent: UA.iphoneChrome, canPrompt: true }))).toBe(
      'ios-other-browser',
    )
  })

  it('spots an iPad, which claims to be a Mac, by its touchscreen', () => {
    expect(isApplePhoneOrTablet(env({ userAgent: UA.ipadSafari, maxTouchPoints: 5 }))).toBe(true)
    expect(installAdvice(env({ userAgent: UA.ipadSafari, maxTouchPoints: 5 }))).toBe('ios-safari')
  })

  it('does not mistake a real Mac for an iPad', () => {
    const desktop = env({ userAgent: UA.mac, maxTouchPoints: 0 })
    expect(isApplePhoneOrTablet(desktop)).toBe(false)
    expect(isIosSafari(desktop)).toBe(false)
    expect(installAdvice(desktop)).toBe('desktop')
  })
})

describe('Android and desktop', () => {
  it('uses the real prompt when the browser offers one', () => {
    expect(installAdvice(env({ userAgent: UA.androidChrome, canPrompt: true }))).toBe(
      'prompt-available',
    )
  })

  it('falls back to the browser menu on Android without one', () => {
    expect(installAdvice(env({ userAgent: UA.androidChrome }))).toBe('android-menu')
  })

  it('treats a desktop browser as a desktop browser', () => {
    expect(installAdvice(env({ userAgent: UA.windowsChrome, maxTouchPoints: 0 }))).toBe('desktop')
  })
})
