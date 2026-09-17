import { useState } from 'react'
import { grillPlan } from '../../core/grill'
import { formatTemperature } from '../../core/temperature'
import { STEAK_CUTS, type SteakCut } from '../../data/cuts'
import { STEAK_DONENESS } from '../../data/meats'
import { SOURCES } from '../../data/sources'
import { useSettings } from '../settings/settingsStore'
import { useTimersContext } from '../timers/timersStore'
import { useNavigation } from '../shell/navigationStore'
import * as audio from '../../platform/audio'

/**
 * Pick a cut, a thickness and a doneness, and get the temperature to pull it
 * at plus timers for the cooking, the turning and the rest.
 *
 * Built for the case Ryan described: three different cuts on the barbecue at
 * once, each wanting its own timing. So each one hands off to its own labelled
 * timer and they run side by side on the Timers screen.
 */
export function GrillSection() {
  const [cutId, setCutId] = useState(STEAK_CUTS[0].id)
  const cut = STEAK_CUTS.find((c) => c.id === cutId)!

  return (
    <>
      <p className="guide__intro">
        For a steak, time is the weakest guide there is. Thickness, how cold it
        started and how hot your coals are move it about far more than the cut
        does. The temperatures below are worth trusting. The times are there to
        tell you when to start paying attention.
      </p>

      <h2 className="guide__group">Cut</h2>
      <div className="chips">
        {STEAK_CUTS.map((option) => (
          <button
            key={option.id}
            className="chips__option"
            aria-pressed={option.id === cutId}
            onClick={() => setCutId(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* Remount on change so thickness and doneness reset to suit the cut. */}
      <CutDetail cut={cut} key={cut.id} />
    </>
  )
}

function CutDetail({ cut }: { cut: SteakCut }) {
  const { settings } = useSettings()
  const timers = useTimersContext()
  const { goTo } = useNavigation()

  const [thickness, setThickness] = useState(cut.thicknessesCm[0])
  const [donenessId, setDonenessId] = useState(cut.suits)

  const doneness =
    STEAK_DONENESS.find((d) => d.id === donenessId) ?? STEAK_DONENESS[1]
  const plan = grillPlan(thickness, donenessId)
  const unit = settings.temperatureUnit

  const startTimer = (label: string, minutes: number) => {
    // A real tap, which is when iOS lets us open the audio system.
    audio.unlock()
    timers.startLabelled(label, minutes)
    goTo('timers')
  }

  return (
    <>
      <p className="card__body" style={{ margin: '0 0 14px' }}>
        {cut.description}
      </p>
      <p className="grill__aka">Also sold as: {cut.alsoKnownAs}</p>

      <h2 className="guide__group">Thickness</h2>
      <div className="chips">
        {[...cut.thicknessesCm].sort((a, b) => a - b).map((option) => (
          <button
            key={option}
            className="chips__option"
            aria-pressed={option === thickness}
            onClick={() => setThickness(option)}
          >
            {option}cm
          </button>
        ))}
      </div>

      <h2 className="guide__group">Doneness</h2>
      <div className="chips">
        {STEAK_DONENESS.map((option) => (
          <button
            key={option.id}
            className="chips__option"
            aria-pressed={option.id === donenessId}
            onClick={() => setDonenessId(option.id!)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {donenessId !== cut.suits && (
        <p className="grill__aka">
          {cut.name} is usually best at{' '}
          {STEAK_DONENESS.find((d) => d.id === cut.suits)?.label.toLowerCase()}.
        </p>
      )}

      <div className="card grill__result">
        <h3 className="grill__heading">Take it off at</h3>
        <p className="grill__pull">
          {formatTemperature(doneness.celsius - 4, unit)}
          <span className="grill__pullNote">
            and it will climb to about {formatTemperature(doneness.celsius, unit)}{' '}
            while it rests
          </span>
        </p>
        <p className="card__source">
          {doneness.label}, per {SOURCES.thermapen.name}. {doneness.note}
        </p>

        <dl className="facts">
          <div className="facts__item">
            <dt className="facts__term">Method</dt>
            <dd className="facts__detail">
              {plan.approach === 'direct' ? 'Straight over the heat' : 'Reverse sear'}.{' '}
              {plan.reason}
            </dd>
          </div>
          <div className="facts__item">
            <dt className="facts__term">Rough time</dt>
            <dd className="facts__detail">
              {plan.approach === 'direct'
                ? `About ${plan.perSideMinutes} min a side, ${plan.totalMinutes} min in total.`
                : `Roughly ${plan.totalMinutes - 3} min away from the coals, then ${plan.perSideMinutes} min a side to sear.`}
            </dd>
          </div>
          <div className="facts__item">
            <dt className="facts__term">Turning</dt>
            <dd className="facts__detail">
              Every {plan.flipSeconds} seconds. Turning often browns just as well
              and cooks far more evenly than leaving it alone.
            </dd>
          </div>
          <div className="facts__item">
            <dt className="facts__term">Rest</dt>
            <dd className="facts__detail">{plan.restMinutes} minutes.</dd>
          </div>
        </dl>

        <p className="card__caveat">
          These times are our own estimate, not official guidance, and they are
          the roughest figures in the app. Cook to the temperature and use the
          clock only to know when to start checking.
        </p>

        <p className="card__tip">{cut.advice}</p>

        <button
          className="card__timer"
          onClick={() => startTimer(cut.name, plan.totalMinutes)}
        >
          Start timer for {cut.name}, {plan.totalMinutes} min
        </button>
        <div className="grill__extraTimers">
          <button
            className="wide-button"
            onClick={() => startTimer('Turn', plan.flipSeconds / 60)}
          >
            Turning timer, {plan.flipSeconds}s
          </button>
          <button
            className="wide-button"
            onClick={() => startTimer(`${cut.name} rest`, plan.restMinutes)}
          >
            Rest timer, {plan.restMinutes} min
          </button>
        </div>
      </div>
    </>
  )
}
