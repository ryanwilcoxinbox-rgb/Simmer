interface Props {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Shown when a search returns nothing, so the screen is never just blank. */
  resultCount?: number
}

/**
 * One search box, used by both reference screens.
 *
 * type="search" rather than "text" so iOS offers a clear button and a Search
 * key, and the font size stays at 16px or above because anything smaller makes
 * Safari zoom the page in when the field is focused.
 */
export function SearchField({ value, onChange, placeholder, resultCount }: Props) {
  return (
    <div className="search">
      <input
        className="field__input search__input"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
          if (event.key === 'Escape') onChange('')
        }}
      />
      {value !== '' && (
        <button className="search__clear" onClick={() => onChange('')}>
          Clear
        </button>
      )}
      {value !== '' && resultCount !== undefined && (
        <p className="search__count" role="status">
          {resultCount === 0
            ? 'Nothing matches that.'
            : `${resultCount} ${resultCount === 1 ? 'match' : 'matches'}`}
        </p>
      )}
    </div>
  )
}
