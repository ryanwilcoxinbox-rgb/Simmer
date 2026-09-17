import { useState } from 'react'
import { formatTemperature } from '../../core/temperature'
import { FSA_TIME_TEMPERATURES, MEATS, MEAT_GROUPS, type MeatEntry } from '../../data/meats'
import { COOKING_TERMS, type CookingTerm } from '../../data/terms'
import { SOURCES } from '../../data/sources'
import { GrillSection } from './GrillSection'
import { useSettings } from '../settings/settingsStore'
import { useTimersContext } from '../timers/timersStore'
import { useNavigation } from '../shell/navigationStore'
import * as audio from '../../platform/audio'

type Section = 'meat' | 'grill' | 'terms'

export function GuideScreen() {
  const [section, setSection] = useState<Section>('meat')

  return (
    <>
      <h1 className="screen__title">Guide</h1>

      <div className="segmented segmented--tabs">
        <button
          className="segmented__option"
          aria-pressed={section === 'meat'}
          onClick={() => setSection('meat')}
        >
          Meat
        </button>
        <button
          className="segmented__option"
          aria-pressed={section === 'grill'}
          onClick={() => setSection('grill')}
        >
          Steak and BBQ
        </button>
        <button
          className="segmented__option"
          aria-pressed={section === 'terms'}
          onClick={() => setSection('terms')}
        >
          Terms
        </button>
      </div>

      {section === 'meat' && <MeatSection />}
      {section === 'grill' && <GrillSection />}
      {section === 'terms' && <TermsSection />}
    </>
  )
}

function MeatSection() {
  const { settings } = useSettings()
  const [openId, setOpenId] = useState<string | null>(null)
  const unit = settings.temperatureUnit

  return (
    <>
      <p className="guide__intro">
        Internal temperatures come from the sources named beside them. Oven
        settings and times are a rough starting point only, so use the probe.
      </p>

      {MEAT_GROUPS.map((group) => {
        const entries = MEATS.filter((meat) => meat.group === group)
        if (entries.length === 0) return null
        return (
          <section key={group}>
            <h2 className="guide__group">{group}</h2>
            {entries.map((meat) => (
              <MeatCard
                key={meat.id}
                meat={meat}
                unit={unit}
                open={openId === meat.id}
                onToggle={() => setOpenId(openId === meat.id ? null : meat.id)}
              />
            ))}
          </section>
        )
      })}

      <section>
        <h2 className="guide__group">The FSA time and temperature ladder</h2>
        <div className="card">
          <p className="card__body">
            UK guidance says food is safe once the centre reaches any one of
            these. They are equivalent, so a lower temperature simply needs
            longer.
          </p>
          <ul className="ladder">
            {FSA_TIME_TEMPERATURES.map((step) => (
              <li className="ladder__row" key={step.celsius}>
                <span className="ladder__temp">
                  {formatTemperature(step.celsius, unit)}
                </span>
                <span className="ladder__hold">for {step.hold}</span>
              </li>
            ))}
          </ul>
          <p className="card__source">Source: {SOURCES.fsa.name}</p>
        </div>
      </section>

      <div className="placeholder">
        <strong>Where these numbers come from</strong>
        {Object.values(SOURCES).map((source) => (
          <span key={source.short}>
            {source.short}: {source.name}, checked {source.checked}
            <br />
          </span>
        ))}
      </div>
    </>
  )
}

function MeatCard({
  meat,
  unit,
  open,
  onToggle,
}: {
  meat: MeatEntry
  unit: 'C' | 'F'
  open: boolean
  onToggle: () => void
}) {
  const timers = useTimersContext()
  const { goTo } = useNavigation()

  const startTimer = () => {
    if (!meat.timer) return
    // A real tap, so this is the moment iOS will let us open the audio system.
    audio.unlock()
    timers.startLabelled(meat.timer.label, meat.timer.minutes)
    goTo('timers')
  }

  return (
    <div className="card">
      <button className="card__head" onClick={onToggle} aria-expanded={open}>
        <span className="card__name">{meat.name}</span>
        <span className="card__chevron">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <>
          <p className="card__body">{meat.summary}</p>

          <ul className="temps">
            {meat.temperatures.map((temperature) => (
              <li className="temps__row" key={`${temperature.label}-${temperature.celsius}`}>
                <span className="temps__value">
                  {formatTemperature(temperature.celsius, unit)}
                </span>
                <span className="temps__detail">
                  <span
                    className={`temps__label temps__label--${temperature.kind}`}
                  >
                    {temperature.label}
                  </span>
                  <span className="temps__source">
                    {SOURCES[temperature.source].short}
                  </span>
                  {temperature.note && (
                    <span className="temps__note">{temperature.note}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <dl className="facts">
            {meat.pullEarlyC !== undefined && (
              <Fact
                term="Carryover"
                detail={`Keeps cooking as it rests, so take it off about ${meat.pullEarlyC}°C below your target.`}
              />
            )}
            {meat.restMinutes !== undefined && (
              <Fact term="Rest" detail={`About ${meat.restMinutes} minutes.`} />
            )}
            {meat.ovenC !== undefined && (
              <Fact
                term="Oven"
                detail={`Around ${formatTemperature(meat.ovenC, unit)}. A starting point, not guidance.`}
              />
            )}
            {meat.timeGuide && <Fact term="Timing" detail={meat.timeGuide} />}
          </dl>

          {meat.needsVerification && (
            <p className="card__caveat">
              The oven setting and timing here are our own rough estimate, not
              taken from an official source. The internal temperature above is
              the one to trust.
            </p>
          )}

          {meat.timer && (
            <button className="card__timer" onClick={startTimer}>
              Start a {meat.timer.minutes} min timer for {meat.timer.label}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function Fact({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="facts__item">
      <dt className="facts__term">{term}</dt>
      <dd className="facts__detail">{detail}</dd>
    </div>
  )
}

function TermsSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <p className="guide__intro">
        Plain explanations of the words recipes use without explaining them.
      </p>
      {COOKING_TERMS.map((term) => (
        <TermCard
          key={term.id}
          term={term}
          open={openId === term.id}
          onToggle={() => setOpenId(openId === term.id ? null : term.id)}
        />
      ))}
    </>
  )
}

function TermCard({
  term,
  open,
  onToggle,
}: {
  term: CookingTerm
  open: boolean
  onToggle: () => void
}) {
  const timers = useTimersContext()
  const { goTo } = useNavigation()

  const startTimer = () => {
    if (!term.timer) return
    audio.unlock()
    timers.startLabelled(term.timer.label, term.timer.minutes)
    goTo('timers')
  }

  return (
    <div className="card">
      <button className="card__head" onClick={onToggle} aria-expanded={open}>
        <span className="card__name">
          {term.term}
          <span className="card__short">{term.short}</span>
        </span>
        <span className="card__chevron">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <>
          <p className="card__body">{term.detail}</p>
          {term.timer && (
            <button className="card__timer" onClick={startTimer}>
              Start a {term.timer.minutes} min timer for {term.timer.label}
            </button>
          )}
        </>
      )}
    </div>
  )
}
