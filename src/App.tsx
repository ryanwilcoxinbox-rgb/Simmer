import { useCallback, useMemo, useState } from 'react'
import './App.css'
import './features/timers/timers-design.css'
import { TimersScreen } from './features/timers/TimersScreen'
import { GuideScreen } from './features/guide/GuideScreen'
import { SpicesScreen } from './features/spices/SpicesScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { SettingsProvider } from './features/settings/SettingsProvider'
import { TimersProvider } from './features/timers/TimersProvider'
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
  const Screen = TABS.find((t) => t.id === activeTab)!.screen

  return (
    <SettingsProvider>
      <TimersProvider>
        <NavigationContext value={navigation}>
          <div className="app">
            {/* Remounting on tab change resets each screen's scroll position. */}
            <main className="app__body" key={activeTab}>
              <Screen />
            </main>

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
      </TimersProvider>
    </SettingsProvider>
  )
}
