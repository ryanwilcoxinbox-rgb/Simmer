import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './features/timers/timers-design.css'
import { TimersScreen } from './features/timers/TimersScreen'
import { GuideScreen } from './features/guide/GuideScreen'
import { SpicesScreen } from './features/spices/SpicesScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { SettingsProvider } from './features/settings/SettingsProvider'
import { TimersProvider } from './features/timers/TimersProvider'
import { PlanProvider } from './features/plan/PlanProvider'
import { CookingSafeguards } from './features/shell/CookingSafeguards'
import { NavigationContext, type TabId } from './features/shell/navigationStore'
import {
  GuideIcon,
  SettingsIcon,
  SpicesIcon,
  TimersIcon,
} from './features/shell/icons'

const TABS: {
  id: TabId
  label: string
  screen: () => React.JSX.Element
  icon: () => React.JSX.Element
}[] = [
  { id: 'timers', label: 'Timers', screen: TimersScreen, icon: TimersIcon },
  { id: 'guide', label: 'Guide', screen: GuideScreen, icon: GuideIcon },
  { id: 'spices', label: 'Spices', screen: SpicesScreen, icon: SpicesIcon },
  { id: 'settings', label: 'Settings', screen: SettingsScreen, icon: SettingsIcon },
]

export function App() {
  // Timers is the home screen, as the brief requires.
  const [activeTab, setActiveTab] = useState<TabId>('timers')
  const goTo = useCallback((tab: TabId) => setActiveTab(tab), [])
  const navigation = useMemo(() => ({ goTo }), [goTo])

  return (
    <SettingsProvider>
      <TimersProvider>
        <PlanProvider>
          <NavigationContext value={navigation}>
            {/* Above the tab switch on purpose: these must survive changing tab. */}
            <CookingSafeguards />
            <div className="app">
              <ScreenHost activeTab={activeTab} />

              <nav className="tabbar" aria-label="Sections">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      className="tabbar__tab"
                      aria-current={tab.id === activeTab ? 'page' : undefined}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </NavigationContext>
        </PlanProvider>
      </TimersProvider>
    </SettingsProvider>
  )
}

/**
 * Holds every screen mounted at once and shows one of them.
 *
 * The app used to render only the active screen, keyed by tab, which threw the
 * others away. That meant coming back to the Guide had forgotten which cut you
 * were reading, what you had searched for and how far down you were. Mid-cook,
 * having to find your place again each time is exactly the wrong thing to ask
 * of someone with their hands full.
 *
 * Keeping them mounted preserves all of that for free, because the components
 * never unmount. Scroll position is the one thing it does not preserve, since
 * a hidden element reports a scrollTop of zero, so each screen records its own
 * position as it scrolls and gets it back on the way in.
 */
function ScreenHost({ activeTab }: { activeTab: TabId }) {
  const elements = useRef(new Map<TabId, HTMLElement>())
  const positions = useRef(new Map<TabId, number>())

  useLayoutEffect(() => {
    const element = elements.current.get(activeTab)
    if (element) element.scrollTop = positions.current.get(activeTab) ?? 0
  }, [activeTab])

  return (
    <>
      {TABS.map((tab) => {
        const Screen = tab.screen
        return (
          <main
            key={tab.id}
            className="app__body"
            hidden={tab.id !== activeTab}
            aria-label={tab.label}
            ref={(element) => {
              if (element) elements.current.set(tab.id, element)
              else elements.current.delete(tab.id)
            }}
            // Recorded while scrolling, because by the time the screen is
            // hidden its scrollTop has already been reset to zero.
            onScroll={(event) =>
              positions.current.set(tab.id, event.currentTarget.scrollTop)
            }
          >
            <Screen />
          </main>
        )
      })}
    </>
  )
}
