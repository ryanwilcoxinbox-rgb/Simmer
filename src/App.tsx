import { useState } from 'react'
import './App.css'
import { TimersScreen } from './features/timers/TimersScreen'
import { GuideScreen } from './features/guide/GuideScreen'
import { SpicesScreen } from './features/spices/SpicesScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { SettingsProvider } from './features/settings/SettingsProvider'

const TABS = [
  { id: 'timers', label: 'Timers', screen: TimersScreen },
  { id: 'guide', label: 'Guide', screen: GuideScreen },
  { id: 'spices', label: 'Spices', screen: SpicesScreen },
  { id: 'settings', label: 'Settings', screen: SettingsScreen },
] as const

type TabId = (typeof TABS)[number]['id']

export function App() {
  // Timers is the home screen, as the brief requires.
  const [activeTab, setActiveTab] = useState<TabId>('timers')
  const Screen = TABS.find((t) => t.id === activeTab)!.screen

  return (
    <SettingsProvider>
      <div className="app">
        <main className="app__body">
          <Screen />
        </main>

        <nav className="tabbar" aria-label="Sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="tabbar__tab"
              aria-current={tab.id === activeTab ? 'page' : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </SettingsProvider>
  )
}
