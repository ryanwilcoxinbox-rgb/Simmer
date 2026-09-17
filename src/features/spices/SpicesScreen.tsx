import { useCallback, useEffect, useState } from 'react'
import {
  BLENDS,
  FLAVOUR_GROUPS,
  NON_SPICE_NOTES,
  SPICES,
  type Spice,
} from '../../data/spices'
import { loadNotes, saveNotes } from '../../platform/notes'
import type { Notes } from '../../core/notes'
import { matchesQuery } from '../../core/search'
import { SearchField } from '../shell/SearchField'
import { FilterChips } from '../shell/FilterChips'

type Section = 'spices' | 'blends'

const SPICE_NAMES = new Map<string, string>([
  ...SPICES.map((spice) => [spice.id, spice.name] as const),
  ...Object.entries(NON_SPICE_NOTES),
])

export function SpicesScreen() {
  const [section, setSection] = useState<Section>('spices')
  const [notes, setNotes] = useState<Notes>(loadNotes)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const setNote = useCallback((id: string, note: string) => {
    setNotes((current) => {
      if (note === '') {
        const { [id]: _removed, ...rest } = current
        return rest
      }
      return { ...current, [id]: note }
    })
  }, [])

  return (
    <>
      <h1 className="screen__title">Spices</h1>

      <div className="segmented segmented--tabs">
        <button
          className="segmented__option"
          aria-pressed={section === 'spices'}
          onClick={() => setSection('spices')}
        >
          Spices
        </button>
        <button
          className="segmented__option"
          aria-pressed={section === 'blends'}
          onClick={() => setSection('blends')}
        >
          Blends
        </button>
      </div>

      {section === 'spices' ? (
        <SpiceList notes={notes} onNoteChange={setNote} />
      ) : (
        <BlendList />
      )}
    </>
  )
}

function SpiceList({
  notes,
  onNoteChange,
}: {
  notes: Notes
  onNoteChange: (id: string, note: string) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string | null>(null)

  const found = SPICES.filter((spice) =>
    matchesQuery(query, [
      spice.name,
      spice.group,
      spice.description,
      spice.tip,
      ...spice.goesWith,
      // Searching a pairing should find the spices that pair with it.
      ...spice.pairsWith.map((id) => SPICE_NAMES.get(id)),
    ]),
  )
  const matching =
    group === null ? found : found.filter((spice) => spice.group === group)
  /** Tapping a pairing opens that spice, clearing any search in the way. */
  const jumpTo = (id: string) => {
    setQuery('')
    setGroup(null)
    setOpenId(id)
    requestAnimationFrame(() => {
      document.getElementById('spice-' + id)?.scrollIntoView({ block: 'center' })
    })
  }

  return (
    <>
      <p className="guide__intro">
        Grouped by what they taste like rather than where they grow, because
        that is the question you have with a jar in your hand. Every spice has a
        notes field for your own findings.
      </p>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search spices"
        resultCount={matching.length}
      />

      <FilterChips
        label="Filter by flavour"
        options={FLAVOUR_GROUPS}
        value={group}
        onChange={setGroup}
        total={found.length}
      />

      {FLAVOUR_GROUPS.map((flavour) => {
        const entries = matching.filter((spice) => spice.group === flavour)
        if (entries.length === 0) return null
        return (
          <section key={flavour}>
            <h2 className="guide__group">{flavour}</h2>
            {entries.map((spice) => (
              <SpiceCard
                key={spice.id}
                spice={spice}
                note={notes[spice.id] ?? ''}
                onNoteChange={(note) => onNoteChange(spice.id, note)}
                open={openId === spice.id}
                onToggle={() => setOpenId(openId === spice.id ? null : spice.id)}
                onJumpTo={jumpTo}
              />
            ))}
          </section>
        )
      })}
    </>
  )
}

function SpiceCard({
  spice,
  note,
  onNoteChange,
  open,
  onToggle,
  onJumpTo,
}: {
  spice: Spice
  note: string
  onNoteChange: (note: string) => void
  open: boolean
  onToggle: () => void
  onJumpTo: (id: string) => void
}) {
  /** Pairings we hold as spices can be jumped to; the rest are just words. */
  const isSpice = (id: string) => SPICES.some((s) => s.id === id)

  return (
    <div className="card" id={`spice-${spice.id}`}>
      <button className="card__head" onClick={onToggle} aria-expanded={open}>
        <span className="card__name">
          {spice.name}
          {note !== '' && <span className="card__flag">Your notes</span>}
        </span>
        <span className="card__chevron">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <>
          <p className="card__body">{spice.description}</p>

          <dl className="facts">
            <div className="facts__item">
              <dt className="facts__term">Pairs with</dt>
              <dd className="facts__detail">
                {/*
                  Tappable, because a pairing is a question: "what is coriander
                  seed like?" Reading it as plain text meant scrolling back
                  through the flavour groups to find out.
                */}
                <span className="pairings">
                  {spice.pairsWith.map((id) =>
                    isSpice(id) ? (
                      <button
                        key={id}
                        className="pairings__link"
                        onClick={() => onJumpTo(id)}
                      >
                        {SPICE_NAMES.get(id)}
                      </button>
                    ) : (
                      <span className="pairings__plain" key={id}>
                        {SPICE_NAMES.get(id) ?? id}
                      </span>
                    ),
                  )}
                </span>
              </dd>
            </div>
            <div className="facts__item">
              <dt className="facts__term">Good in</dt>
              <dd className="facts__detail">{spice.goesWith.join(', ')}</dd>
            </div>
          </dl>

          {spice.tip && <p className="card__tip">{spice.tip}</p>}

          <label className="field">
            <span className="field__label">Your notes</span>
            <textarea
              className="field__input field__input--area"
              value={note}
              rows={3}
              placeholder="What you have tried, what worked, what did not."
              onChange={(event) => onNoteChange(event.target.value)}
            />
          </label>
        </>
      )}
    </div>
  )
}

function BlendList() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <p className="guide__intro">
        Classic blends and what tends to go in them. Recipes vary enormously by
        region and by household, so treat these as a sketch rather than a
        formula.
      </p>

      {BLENDS.map((blend) => (
        <div className="card" key={blend.id}>
          <button
            className="card__head"
            onClick={() => setOpenId(openId === blend.id ? null : blend.id)}
            aria-expanded={openId === blend.id}
          >
            <span className="card__name">
              {blend.name}
              <span className="card__short">{blend.origin}</span>
            </span>
            <span className="card__chevron">
              {openId === blend.id ? 'Hide' : 'Show'}
            </span>
          </button>

          {openId === blend.id && (
            <>
              <p className="card__body">{blend.description}</p>

              <ul className="recipe">
                {blend.components.map((component) => (
                  <li className="recipe__row" key={component.id}>
                    <span className="recipe__parts">{component.parts}</span>
                    <span className="recipe__spice">
                      {SPICE_NAMES.get(component.id) ?? component.id}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="card__source">
                Parts by volume. One part as a teaspoon makes a small jar. Our
                starting point, not the recipe: every one of these varies by
                region and household, so adjust it and note what you changed.
              </p>

              {blend.note && <p className="card__tip">{blend.note}</p>}
            </>
          )}
        </div>
      ))}
    </>
  )
}
