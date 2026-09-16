import { formatDuration } from '../../core/format'

/**
 * Milestone 1 shows the intended layout with the controls switched off, so
 * the sizing and contrast can be judged on a real phone before Milestone 2
 * makes any of it work.
 */
const PREVIEW_ROWS = [
  { label: 'Rice', mode: 'Countdown', ms: 15 * 60_000 },
  { label: 'Chicken', mode: 'Countdown', ms: 40 * 60_000 },
  { label: 'Veg', mode: 'Countdown', ms: 8 * 60_000 },
  { label: 'Sourdough proof', mode: 'Stopwatch', ms: 0 },
  { label: 'Timer 5', mode: 'Countdown', ms: 0 },
]

export function TimersScreen() {
  return (
    <>
      <h1 className="screen__title">Simmer</h1>

      <p className="notice">Screen stays on. Keep this app open for alarms.</p>

      <div className="rows rows--preview" aria-hidden="true">
        {PREVIEW_ROWS.map((row) => (
          <div className="row" key={row.label}>
            <div className="row__info">
              <div className="row__top">
                <span className="row__label">{row.label}</span>
                <span className="row__mode">{row.mode}</span>
              </div>
              <div className="row__time">{formatDuration(row.ms)}</div>
            </div>
            <div className="row__actions">
              <button className="row__button row__button--primary">Start</button>
              <button className="row__button">Reset</button>
            </div>
          </div>
        ))}
      </div>

      <div className="placeholder">
        <strong>Preview only</strong>
        These rows are a layout sketch so you can check the sizing on your
        phone. Working timers arrive in Milestone 2.
      </div>
    </>
  )
}
