import { useState } from 'react'
import { grillPlan } from '../../core/grill'
import { formatTemperature } from '../../core/temperature'
import {
  BBQ_CATEGORIES,
  BBQ_ITEMS,
  METHOD_NAMES,
  type BbqItem,
  type CookedThroughItem,
  type PreferenceItem,
} from '../../data/bbq'
import { STEAK_DONENESS } from '../../data/meats'
import { SOURCES } from '../../data/sources'
import { useSettings } from '../settings/settingsStore'
import { useLaunchTimer } from '../shell/useLaunchTimer'

/**
 * Pick something off the grill, say how big it is, and get the temperature to
 * take it off at plus timers for the cook, the turning and the rest.
 *
 * The screen branches on the one distinction that matters: whether this is a
 * whole cut you get to choose the doneness of, or something that has to be
 * cooked through. The second kind never shows a doneness picker at all, so
 * there is no way to ask the app for a medium rare chicken thigh.
 */
export function GrillSection() {
  const [itemId, setItemId] = useState(BBQ_ITEMS[0].id)
  const item = BBQ_ITEMS.find((i) => i.id === itemId)!

  return (
    <>
      <p className="guide__intro">
        On a barbecue, time is the weakest guide there is. How hot the coals
        are, how cold the meat started and the wind all move it about. The
        temperatures below are worth trusting. The times only tell you when to
        start paying attention.
      </p>

      {BBQ_CATEGORIES.map((category) => {
        const entries = BBQ_ITEMS.filter((i) => i.category === category)
        if (entries.length === 0) return null
        return (
          <section key={category}>
            <h2 className="guide__group">{category}</h2>
            <div className="chips">
              {entries.map((option) => (
                <button
                  key={option.id}
                  className="chips__option"
                  aria-pressed={option.id === itemId}
                  onClick={() => setItemId(option.id)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </section>
        )
      })}

      {/* Remount on change so size and doneness reset to suit the new item. */}
      <ItemDetail item={item} key={item.id} />
    </>
  )
}

function ItemDetail({ item }: { item: BbqItem }) {
  return (
    <>
      <h2 className="guide__group">{item.name}</h2>
      <p className="card__body" style={{ margin: '0 0 10px' }}>
        {item.description}
      </p>
      {item.alsoKnownAs && (
        <p className="grill__aka">Also sold as: {item.alsoKnownAs}</p>
      )}

      {item.kind === 'preference' ? (
        <PreferenceDetail item={item} />
      ) : (
        <CookedThroughDetail item={item} />
      )}
    </>
  )
}

/** Shared by both kinds: the buttons that hand off to real timers. */
function TimerButtons({
  name,
  totalMinutes,
  restMinutes,
  turnEverySeconds,
}: {
  name: string
  totalMinutes: number
  restMinutes: number
  turnEverySeconds?: number
}) {
  const { launch, problem } = useLaunchTimer()

  return (
    <>
      <button
        className="card__timer"
        onClick={() => launch(name, totalMinutes)}
      >
        Start timer for {name}, {totalMinutes} min
      </button>
      <div className="grill__extraTimers">
        {turnEverySeconds !== undefined && (
          <button
            className="wide-button"
            onClick={() => launch('Turn', turnEverySeconds / 60)}
          >
            Turning timer,{' '}
            {turnEverySeconds >= 60
              ? `${turnEverySeconds / 60} min`
              : `${turnEverySeconds}s`}
          </button>
        )}
        <button
          className="wide-button"
          onClick={() => launch(`${name} rest`, restMinutes)}
        >
          Rest timer, {restMinutes} min
        </button>
      </div>
      {problem && <p className="card__caveat" role="alert">{problem}</p>}
    </>
  )
}

function PreferenceDetail({ item }: { item: PreferenceItem }) {
  const { settings } = useSettings()
  const [thickness, setThickness] = useState(item.thicknessesCm[0])
  const [donenessId, setDonenessId] = useState(item.suits)

  const doneness =
    STEAK_DONENESS.find((d) => d.id === donenessId) ?? STEAK_DONENESS[1]
  const plan = grillPlan(thickness, donenessId)
  const unit = settings.temperatureUnit

  return (
    <>
      <h2 className="guide__group">Thickness</h2>
      <div className="chips">
        {[...item.thicknessesCm]
          .sort((a, b) => a - b)
          .map((option) => (
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
      {donenessId !== item.suits && (
        <p className="grill__aka">
          {item.name} is usually best at{' '}
          {STEAK_DONENESS.find((d) => d.id === item.suits)?.label.toLowerCase()}.
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
          <Fact
            term="Method"
            detail={`${plan.approach === 'direct' ? 'Straight over the heat' : 'Reverse sear'}. ${plan.reason}`}
          />
          <Fact
            term="Rough time"
            detail={
              plan.approach === 'direct'
                ? `About ${plan.perSideMinutes} min a side, ${plan.totalMinutes} min in total.`
                : `Roughly ${plan.totalMinutes - 3} min away from the coals, then ${plan.perSideMinutes} min a side to sear.`
            }
          />
          <Fact term="Turning" detail={`Every ${plan.flipSeconds} seconds.`} />
          <Fact term="Rest" detail={`${plan.restMinutes} minutes.`} />
        </dl>

        <Caveat />
        <p className="card__tip">{item.advice}</p>

        <TimerButtons
          name={item.name}
          totalMinutes={plan.totalMinutes}
          restMinutes={plan.restMinutes}
          turnEverySeconds={plan.flipSeconds}
        />
      </div>
    </>
  )
}

function CookedThroughDetail({ item }: { item: CookedThroughItem }) {
  const { settings } = useSettings()
  const [sizeLabel, setSizeLabel] = useState(item.sizes[0].label)
  const size = item.sizes.find((s) => s.label === sizeLabel) ?? item.sizes[0]
  const unit = settings.temperatureUnit

  return (
    <>
      <h2 className="guide__group">Size</h2>
      <div className="chips">
        {item.sizes.map((option) => (
          <button
            key={option.label}
            className="chips__option"
            aria-pressed={option.label === sizeLabel}
            onClick={() => setSizeLabel(option.label)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="card grill__result">
        <h3 className="grill__heading">Cook it through to</h3>
        <ul className="temps" style={{ marginTop: 0 }}>
          {item.temperatures.map((temperature) => (
            <li className="temps__row" key={temperature.label}>
              <span className="temps__value">
                {formatTemperature(temperature.celsius, unit)}
              </span>
              <span className="temps__detail">
                <span className="temps__label temps__label--safe">
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

        {/* Says out loud why there is no doneness choice here. */}
        <p className="grill__through">{item.whyThrough}</p>

        <dl className="facts">
          <Fact term="Fire" detail={METHOD_NAMES[item.method]} />
          <Fact term="Rough time" detail={`About ${size.minutes} minutes.`} />
          {item.turnEverySeconds !== undefined && (
            <Fact
              term="Turning"
              detail={
                item.turnEverySeconds >= 60
                  ? `Every ${item.turnEverySeconds / 60} minutes.`
                  : `Every ${item.turnEverySeconds} seconds.`
              }
            />
          )}
          <Fact term="Rest" detail={`${size.restMinutes} minutes.`} />
        </dl>

        <Caveat />
        <p className="card__tip">{item.advice}</p>

        <TimerButtons
          name={item.name}
          totalMinutes={size.minutes}
          restMinutes={size.restMinutes}
          turnEverySeconds={item.turnEverySeconds}
        />
      </div>
    </>
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

function Caveat() {
  return (
    <p className="card__caveat">
      These times are our own estimate, not official guidance, and they are the
      roughest figures in the app. Cook to the temperature and use the clock
      only to know when to start checking.
    </p>
  )
}
