interface Props {
  label: string
  options: readonly string[]
  /** null means no filter, shown as "All". */
  value: string | null
  onChange: (value: string | null) => void
  /** How many entries the current filter leaves, for the count on "All". */
  total: number
}

/**
 * A single-select row of category chips, with All first.
 *
 * Single-select rather than multi on purpose. Multi-select filters need a
 * clear-all, an explanation of whether they combine as and or or, and a way to
 * show a partial state. None of that earns its place on six categories, and
 * all of it is another thing to understand while holding a pan.
 */
export function FilterChips({ label, options, value, onChange, total }: Props) {
  return (
    <div className="filters" role="group" aria-label={label}>
      <button
        className="chips__option chips__option--filter"
        aria-pressed={value === null}
        onClick={() => onChange(null)}
      >
        All <span className="filters__count">{total}</span>
      </button>
      {options.map((option) => (
        <button
          key={option}
          className="chips__option chips__option--filter"
          aria-pressed={value === option}
          // Tapping the active filter again clears it, which is what people try.
          onClick={() => onChange(value === option ? null : option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
