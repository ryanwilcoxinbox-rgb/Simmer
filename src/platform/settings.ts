import {
  DEFAULT_SETTINGS,
  deserializeSettings,
  serializeSettings,
  type Settings,
} from '../core/settings'

const STORAGE_KEY = 'simmer.settings.v1'

export function loadSettings(): Settings {
  try {
    return deserializeSettings(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeSettings(settings))
  } catch {
    // Storage blocked or full. Preferences revert next launch; not fatal.
  }
}
