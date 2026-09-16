import { useEffect, useState } from 'react'

/**
 * A clock that re-renders the app a few times a second.
 *
 * This is NOT a countdown, despite the repeating interval. It never subtracts
 * anything and it holds no timer state. All it does is ask "what time is it
 * now?" so the screen can recalculate every readout from the stored
 * timestamps. That is why the display is still correct after iOS has frozen
 * the page for ten minutes: when it thaws, the next tick produces the right
 * answer with no catching up to do.
 *
 * The interval only runs when something is actually counting, so an idle app
 * is not waking the phone four times a second for nothing.
 */
const TICK_MS = 250

export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return

    // A stale clock while idle is harmless: with nothing running, every
    // readout comes from banked time alone and ignores `now` entirely. And on
    // the first render after a start, `now` being behind the start timestamp
    // is caught by the backwards-clock guard in elapsedMs, which reads it as
    // zero elapsed. So there is no need to sync before the first tick.
    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS)

    // iOS stops interval callbacks while the app is in the background, so the
    // first thing to do on the way back is read the clock again.
    const resync = () => {
      if (!document.hidden) setNow(Date.now())
    }
    document.addEventListener('visibilitychange', resync)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', resync)
    }
  }, [active])

  return now
}
