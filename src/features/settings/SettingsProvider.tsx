import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Settings } from '../../core/settings'
import { loadSettings, saveSettings } from '../../platform/settings'
import { SettingsContext } from './settingsStore'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const update = useCallback((change: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...change }))
  }, [])

  const value = useMemo(() => ({ settings, update }), [settings, update])

  return <SettingsContext value={value}>{children}</SettingsContext>
}
