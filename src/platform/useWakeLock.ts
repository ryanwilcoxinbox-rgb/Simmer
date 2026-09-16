import { useEffect, useRef } from 'react'

/**
 * Holds the Screen Wake Lock while timers are running, so the phone does not
 * dim and lock itself mid-cook.
 *
 * The awkward part is that iOS drops the lock the instant the app leaves the
 * screen, and does NOT give it back when you return. So returning to the app
 * has to re-request it every single time, which is what the visibilitychange
 * listener below is for. Without that, the screen stays awake exactly once and
 * then quietly stops doing so for the rest of the session.
 *
 * The API is absent on some browsers and can reject even where it exists (low
 * battery, for one), so every path swallows failure. A timer that runs with a
 * dimming screen is worse than one that does not run at all.
 */
export function useWakeLock(active: boolean): void {
  const sentinel = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!('wakeLock' in navigator)) return

    let cancelled = false

    const acquire = async () => {
      if (cancelled || sentinel.current || document.hidden) return
      try {
        sentinel.current = await navigator.wakeLock.request('screen')
        // iOS fires this when it takes the lock away. Clearing our reference
        // means the next visibilitychange knows to ask again.
        sentinel.current.addEventListener('release', () => {
          sentinel.current = null
        })
      } catch {
        // Denied or unavailable. Carry on without it.
      }
    }

    const release = () => {
      const held = sentinel.current
      sentinel.current = null
      void held?.release().catch(() => {})
    }

    if (active) {
      void acquire()
    } else {
      release()
    }

    const onVisibilityChange = () => {
      if (!document.hidden && active) void acquire()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      release()
    }
  }, [active])
}

export function isWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}
