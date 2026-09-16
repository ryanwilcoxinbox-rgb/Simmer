import { useCallback, useState } from 'react'
import { useNow } from '../../platform/useNow'
import { useTimers } from './useTimers'
import { TimerRow } from './TimerRow'
import { EditTimerSheet } from './EditTimerSheet'

export function TimersScreen() {
  const timers = useTimers()
  // The clock only ticks while something is counting, to save battery.
  const now = useNow(timers.anyRunning)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Stable identity, so the sheet's key handler is not torn down and rebuilt
  // on every keystroke in the label field.
  const closeSheet = useCallback(() => setEditingId(null), [])

  const editingIndex = timers.timers.findIndex((t) => t.id === editingId)
  const editing = editingIndex === -1 ? null : timers.timers[editingIndex]
  const nameFor = (index: number) => `Timer ${index + 1}`

  return (
    <>
      <h1 className="screen__title">Simmer</h1>

      <p className="notice">Screen stays on. Keep this app open for alarms.</p>

      <div className="rows">
        {timers.timers.map((timer, index) => (
          <TimerRow
            key={timer.id}
            timer={timer}
            now={now}
            fallbackLabel={nameFor(index)}
            onStart={() => timers.start(timer.id)}
            onPause={() => timers.pause(timer.id)}
            onReset={() => timers.reset(timer.id)}
            onEdit={() => setEditingId(timer.id)}
          />
        ))}
      </div>

      {timers.canAdd && (
        <button className="add-row" onClick={timers.add}>
          Add a timer
        </button>
      )}

      {editing && (
        <EditTimerSheet
          timer={editing}
          fallbackLabel={nameFor(editingIndex)}
          canRemove={timers.canRemove}
          onLabelChange={(label) => timers.setLabel(editing.id, label)}
          onModeChange={(mode) => timers.setMode(editing.id, mode)}
          onDurationChange={(ms) => timers.setDuration(editing.id, ms)}
          onRemove={() => {
            timers.remove(editing.id)
            closeSheet()
          }}
          onClose={closeSheet}
        />
      )}
    </>
  )
}
