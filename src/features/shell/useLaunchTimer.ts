import { useCallback, useState } from 'react'
import * as audio from '../../platform/audio'
import { useTimersContext } from '../timers/timersStore'
import { useNavigation } from './navigationStore'

/**
 * Starting a labelled timer from a reference entry, and saying so when it
 * cannot be done.
 *
 * The Guide used to send you to the timer screen whether or not it had managed
 * to create anything. With every row in use it created nothing, navigated
 * anyway, and left you looking at a list that did not contain what you had just
 * asked for. Silence would have been bad; navigating as though it worked was
 * worse, because it looks exactly like success.
 */
export function useLaunchTimer() {
  const timers = useTimersContext()
  const { goTo } = useNavigation()
  const [problem, setProblem] = useState<string | null>(null)

  const launch = useCallback(
    (label: string, minutes: number) => {
      // A real tap, which is the only moment iOS will let us open audio.
      audio.unlock()
      if (timers.startLabelled(label, minutes)) {
        setProblem(null)
        goTo('timers')
        return
      }
      setProblem(
        'Every timer is in use. Reset or remove one on the Timers tab, then try again.',
      )
    },
    [timers, goTo],
  )

  return { launch, problem }
}
