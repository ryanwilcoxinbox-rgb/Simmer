/**
 * App preferences. Pure: parsing and defaults live here, the localStorage
 * call lives in src/platform/settings.ts.
 */

export type TemperatureUnit = 'C' | 'F'

export interface Settings {
  appearance: 'system' | 'light' | 'dark'
  /** Used by the Guide tab from Milestone 5 onwards. */
  temperatureUnit: TemperatureUnit
  /**
   * Experimental. Schedules each alarm on the audio hardware's own clock at
   * the moment a timer starts, rather than asking JavaScript to play it when
   * the timer ends. The hope is that iOS will honour an already-scheduled
   * sound even once it has frozen the page. Off by default because it is
   * unproven and it keeps a silent sound playing, which costs battery.
   */
  backgroundAlarm: boolean
  /**
   * Whether the first-run reminder about the ringer has been dismissed. We
   * cannot detect the silent switch from a web page, so the only defence is
   * telling the user plainly.
   */
  silentReminderDismissed: boolean
  /**
   * Whether the Home Screen prompt has been dismissed. Once dismissed it never
   * returns: it has nothing new to say the second time, and a prompt that
   * comes back is nagging.
   */
  installPromptDismissed: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  appearance: 'system',
  temperatureUnit: 'C',
  backgroundAlarm: false,
  silentReminderDismissed: false,
  installPromptDismissed: false,
}

export function serializeSettings(settings: Settings): string {
  return JSON.stringify(settings)
}

/** Anything unrecognised falls back to the default rather than throwing. */
export function deserializeSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return DEFAULT_SETTINGS
  }
  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS

  const stored = parsed as Record<string, unknown>
  return {
    appearance:
      stored.appearance === 'light' || stored.appearance === 'dark'
        ? stored.appearance
        : 'system',
    temperatureUnit:
      stored.temperatureUnit === 'F' || stored.temperatureUnit === 'C'
        ? stored.temperatureUnit
        : DEFAULT_SETTINGS.temperatureUnit,
    backgroundAlarm:
      typeof stored.backgroundAlarm === 'boolean'
        ? stored.backgroundAlarm
        : DEFAULT_SETTINGS.backgroundAlarm,
    silentReminderDismissed:
      typeof stored.silentReminderDismissed === 'boolean'
        ? stored.silentReminderDismissed
        : DEFAULT_SETTINGS.silentReminderDismissed,
    installPromptDismissed:
      typeof stored.installPromptDismissed === 'boolean'
        ? stored.installPromptDismissed
        : DEFAULT_SETTINGS.installPromptDismissed,
  }
}
