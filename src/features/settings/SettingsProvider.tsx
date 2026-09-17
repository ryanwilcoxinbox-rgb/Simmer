import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings } from '../../core/settings'
import { loadSettings, saveSettings } from '../../platform/settings'
import { SettingsContext } from './settingsStore'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const theme = settings.appearance === 'system'
        ? media.matches ? 'dark' : 'light'
        : settings.appearance
      document.documentElement.dataset.theme = theme
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        'content', theme === 'dark' ? '#191e1b' : '#f6f3eb',
      )
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [settings.appearance])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const update = useCallback((change: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...change }))
  }, [])

  const value = useMemo(() => ({ settings, update }), [settings, update])

  return <SettingsContext value={value}>{children}</SettingsContext>
}
