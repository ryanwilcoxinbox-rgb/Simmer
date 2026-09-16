/**
 * Inline SVG icons.
 *
 * Inline rather than an icon font or a sprite file: there are only five, they
 * inherit currentColor so they follow the theme for free, and nothing has to
 * be fetched before the app can draw itself. That last part matters for a PWA
 * opened in a kitchen with poor signal.
 */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function TimersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <circle cx="12" cy="13.5" r="7.5" {...stroke} />
      <path d="M12 9.5v4l2.5 1.5" {...stroke} />
      <path d="M9.5 2.5h5" {...stroke} />
    </svg>
  )
}

export function GuideIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d="M3 4.5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3Z" {...stroke} />
      <path d="M21 4.5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21Z" {...stroke} />
    </svg>
  )
}

export function SpicesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d="M8.5 2.5h7v3h-7z" {...stroke} />
      <path d="M7 5.5h10a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a1 1 0 0 1 1-1Z" {...stroke} />
      <path d="M9.5 10.5h5M9.5 14h5" {...stroke} />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d="M3 7h12M19 7h2M3 17h2M9 17h12" {...stroke} />
      <circle cx="17" cy="7" r="2.2" {...stroke} />
      <circle cx="7" cy="17" r="2.2" {...stroke} />
    </svg>
  )
}

/** The pot from the app icon, for the top of the timer screen. */
export function PotMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="mark">
      <g className="mark__steam" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M23 21c-3-3 3-5 0-8" />
        <path d="M32 19c-3-3 3-5 0-8" />
        <path d="M41 21c-3-3 3-5 0-8" />
      </g>
      <g fill="currentColor">
        <circle cx="32" cy="27" r="2.6" />
        <rect x="13" y="29" width="38" height="4.5" rx="2.25" />
        <rect x="18" y="35" width="28" height="18" rx="5" />
        <rect x="9" y="40" width="9" height="4" rx="2" />
        <rect x="46" y="40" width="9" height="4" rx="2" />
      </g>
    </svg>
  )
}
