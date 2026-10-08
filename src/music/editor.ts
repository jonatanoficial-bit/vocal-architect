import type { NoteEvent } from './types'
import { clampMidi, midiToSpelling } from './pitch'

export const defaultQuantizationTicks = 240

export type NotePatch = Partial<Pick<NoteEvent, 'durationTicks' | 'pitchMidi' | 'startTick'>>

export type KeyCandidate = {
  confidence: number
  label: string
  mode: 'major' | 'minor'
  tonic: number
}

function clampTick(tick: number) {
  return Math.max(0, Math.round(tick))
}

function clampDuration(durationTicks: number) {
  return Math.max(1, Math.round(durationTicks))
}

function isLocked(note: NoteEvent | undefined) {
  return note?.locked === true
}

function markEdited(note: NoteEvent, patch: NotePatch): NoteEvent {
  const pitchMidi = patch.pitchMidi === undefined ? note.pitchMidi : clampMidi(patch.pitchMidi)
  return {
    ...note,
    durationTicks: patch.durationTicks === undefined ? note.durationTicks : clampDuration(patch.durationTicks),
    origin: 'edited',
    pitchMidi,
    spelling: midiToSpelling(pitchMidi),
    startTick: patch.startTick === undefined ? note.startTick : clampTick(patch.startTick),
  }
}

function nextNoteId(notes: NoteEvent[]) {
  let candidate = notes.length + 1
  while (notes.some((note) => note.id === `manual-note-${candidate}`)) candidate += 1
  return `manual-note-${candidate}`
}

function ordered(notes: NoteEvent[]) {
  return [...notes].sort((first, second) => first.startTick - second.startTick || first.pitchMidi - second.pitchMidi || first.id.localeCompare(second.id))
}

export function updateNote(notes: NoteEvent[], noteId: string, patch: NotePatch) {
  const note = notes.find((candidate) => candidate.id === noteId)
  if (!note || isLocked(note)) return notes
  return notes.map((candidate) => candidate.id === noteId ? markEdited(candidate, patch) : candidate)
}

export function toggleNoteLock(notes: NoteEvent[], noteId: string) {
  return notes.map((note) => note.id === noteId ? { ...note, locked: !note.locked } : note)
}

export function addNote(notes: NoteEvent[], seed: Partial<NoteEvent> = {}) {
  const pitchMidi = clampMidi(seed.pitchMidi ?? 60)
  const note: NoteEvent = {
    confidence: undefined,
    durationTicks: clampDuration(seed.durationTicks ?? defaultQuantizationTicks),
    id: nextNoteId(notes),
    locked: false,
    origin: 'edited',
    phraseId: seed.phraseId,
    pitchMidi,
    spelling: midiToSpelling(pitchMidi),
    startTick: clampTick(seed.startTick ?? 0),
    velocity: Math.max(1, Math.min(127, Math.round(seed.velocity ?? 96))),
    voiceId: seed.voiceId ?? 'melody',
  }
  return ordered([...notes, note])
}

export function deleteNote(notes: NoteEvent[], noteId: string) {
  const note = notes.find((candidate) => candidate.id === noteId)
  if (!note || isLocked(note)) return notes
  return notes.filter((candidate) => candidate.id !== noteId)
}

export function duplicateNote(notes: NoteEvent[], noteId: string) {
  const note = notes.find((candidate) => candidate.id === noteId)
  if (!note || isLocked(note)) return notes
  return addNote(notes, { ...note, id: undefined, locked: false, origin: 'edited', startTick: note.startTick + note.durationTicks })
}

export function splitNote(notes: NoteEvent[], noteId: string) {
  const note = notes.find((candidate) => candidate.id === noteId)
  if (!note || isLocked(note) || note.durationTicks < 2) return notes
  const firstDuration = Math.floor(note.durationTicks / 2)
  const secondDuration = note.durationTicks - firstDuration
  const first = markEdited(note, { durationTicks: firstDuration })
  const second: NoteEvent = { ...first, durationTicks: secondDuration, id: nextNoteId(notes), startTick: note.startTick + firstDuration }
  return ordered(notes.flatMap((candidate) => candidate.id === noteId ? [first, second] : [candidate]))
}

export function mergeNoteWithNext(notes: NoteEvent[], noteId: string) {
  const currentIndex = ordered(notes).findIndex((note) => note.id === noteId)
  const sortedNotes = ordered(notes)
  const current = sortedNotes[currentIndex]
  const next = sortedNotes[currentIndex + 1]
  if (!current || !next || isLocked(current) || isLocked(next)) return notes
  const endTick = Math.max(current.startTick + current.durationTicks, next.startTick + next.durationTicks)
  const merged = markEdited(current, { durationTicks: endTick - current.startTick })
  return ordered(notes.flatMap((note) => note.id === current.id ? [merged] : note.id === next.id ? [] : [note]))
}

export function quantizeNotes(notes: NoteEvent[], gridTicks = defaultQuantizationTicks) {
  const grid = Math.max(1, Math.round(gridTicks))
  return notes.map((note) => {
    if (note.locked) return note
    const startTick = Math.max(0, Math.round(note.startTick / grid) * grid)
    const durationTicks = Math.max(grid, Math.round(note.durationTicks / grid) * grid)
    return markEdited(note, { durationTicks, startTick })
  })
}

const keyNames = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si']
const majorScale = [0, 2, 4, 5, 7, 9, 11]
const minorScale = [0, 2, 3, 5, 7, 8, 10]

export function detectAssistedKey(notes: NoteEvent[]): KeyCandidate | null {
  if (notes.length === 0) return null
  const totalWeight = notes.reduce((sum, note) => sum + note.durationTicks, 0)
  const candidates: KeyCandidate[] = []

  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const [mode, scale] of [['major', majorScale], ['minor', minorScale]] as const) {
      const inScaleWeight = notes.reduce((sum, note) => sum + (scale.includes((note.pitchMidi - tonic + 120) % 12) ? note.durationTicks : 0), 0)
      candidates.push({ confidence: totalWeight === 0 ? 0 : inScaleWeight / totalWeight, label: `${keyNames[tonic]} ${mode === 'major' ? 'maior' : 'menor'}`, mode, tonic })
    }
  }

  return candidates.sort((first, second) => second.confidence - first.confidence || first.tonic - second.tonic)[0]
}
