/**
 * Temperature conversion and display. Pure, and deliberately tiny, because
 * getting a cooking temperature wrong is a food safety problem rather than a
 * cosmetic one.
 */

export type TemperatureUnit = 'C' | 'F'

export function toFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32
}

/**
 * Format a Celsius figure in the unit the user has chosen.
 *
 * Fahrenheit is rounded to a whole degree. Celsius keeps one decimal place
 * only when the source itself gave one, because official guidance quotes
 * figures like 62.8C (a conversion of 145F) and silently rounding that to 63C
 * would be inventing a number, which the brief forbids.
 */
export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'F') return `${Math.round(toFahrenheit(celsius))}°F`
  const rounded = Math.round(celsius * 10) / 10
  return `${rounded}°C`
}
