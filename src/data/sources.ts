/**
 * Where every temperature in this app comes from.
 *
 * The rule from the brief: never invent a cooking temperature. Every figure
 * shown to the user carries one of these sources, and the UI names it next to
 * the number, because UK and US guidance genuinely disagree and the user
 * deserves to know which one they are looking at.
 */

export type SourceId = 'fsa' | 'usda' | 'thermapen'

export interface Source {
  name: string
  short: string
  url: string
  /** When a human last read the figures off the page. */
  checked: string
  /** Whether this is food-safety guidance or culinary preference. */
  authority: 'safety' | 'culinary'
}

export const SOURCES: Record<SourceId, Source> = {
  fsa: {
    name: 'UK Food Standards Agency',
    short: 'FSA (UK)',
    url: 'https://www.gov.uk/government/publications/cooking-your-food/cooking-your-food',
    checked: '2026-09-16',
    authority: 'safety',
  },
  usda: {
    name: 'USDA Food Safety and Inspection Service',
    short: 'USDA (US)',
    url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart',
    checked: '2026-09-16',
    authority: 'safety',
  },
  thermapen: {
    name: 'Thermapen (ETI)',
    short: 'Thermapen',
    url: 'https://thermapen.co.uk/pages/steak-temperature-guide',
    checked: '2026-09-16',
    authority: 'culinary',
  },
}
