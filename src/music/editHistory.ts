import type { NoteEvent } from './types'

export type EditHistoryEntry = {
  label: string
  notes: NoteEvent[]
}

export type EditHistory = {
  future: EditHistoryEntry[]
  past: EditHistoryEntry[]
  present: NoteEvent[]
}

const maximumHistoryEntries = 60

export function createEditHistory(notes: NoteEvent[]): EditHistory {
  return { future: [], past: [], present: notes }
}

export function commitEdit(history: EditHistory, notes: NoteEvent[], label: string): EditHistory {
  if (notes === history.present) return history
  return { future: [], past: [...history.past, { label, notes: history.present }].slice(-maximumHistoryEntries), present: notes }
}

export function undoEdit(history: EditHistory): EditHistory {
  const previous = history.past.at(-1)
  if (!previous) return history
  return { future: [{ label: previous.label, notes: history.present }, ...history.future], past: history.past.slice(0, -1), present: previous.notes }
}

export function redoEdit(history: EditHistory): EditHistory {
  const next = history.future[0]
  if (!next) return history
  return { future: history.future.slice(1), past: [...history.past, { label: next.label, notes: history.present }], present: next.notes }
}
