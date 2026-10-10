import { midiToSpelling } from './pitch'
import type { VoiceName } from './satb'
import type { NoteEvent, VocalPart } from './types'

const voiceOrder: VoiceName[] = ['bass', 'tenor', 'alto', 'soprano']
const voiceLabels: Record<VoiceName, string> = { alto: 'Contralto', bass: 'Baixo', soprano: 'Soprano', tenor: 'Tenor' }

export type ArrangementIssue = {
  code: 'crossing' | 'locked' | 'overlap' | 'parallel-perfect' | 'range'
  message: string
  voice?: VoiceName
}

export type ArrangementEditResult = {
  issues: ArrangementIssue[]
  parts: VocalPart[]
}

export type ArrangementNotePatch = Pick<NoteEvent, 'durationTicks' | 'pitchMidi' | 'startTick'>

function cloneParts(parts: VocalPart[]) {
  return parts.map((part) => ({ ...part, notes: part.notes.map((note) => ({ ...note })) }))
}

function noteAt(notes: NoteEvent[], tick: number) {
  return notes.find((note) => note.startTick <= tick && tick < note.startTick + note.durationTicks) ?? null
}

function ordered(notes: NoteEvent[]) {
  return [...notes].sort((first, second) => first.startTick - second.startTick || first.pitchMidi - second.pitchMidi || first.id.localeCompare(second.id))
}

function isPerfect(interval: number) {
  const normalized = ((interval % 12) + 12) % 12
  return normalized === 0 || normalized === 7
}

export function validateEditableArrangement(parts: VocalPart[]): ArrangementIssue[] {
  const byVoice = Object.fromEntries(parts.map((part) => [part.id as VoiceName, part])) as Partial<Record<VoiceName, VocalPart>>
  const issues: ArrangementIssue[] = []

  for (const voice of voiceOrder) {
    const part = byVoice[voice]
    if (!part) continue
    const notes = ordered(part.notes)
    for (const note of notes) if (note.pitchMidi < part.rangeMinimumMidi || note.pitchMidi > part.rangeMaximumMidi) issues.push({ code: 'range', message: `${voiceLabels[voice]} ficaria fora da tessitura configurada.`, voice })
    for (let index = 1; index < notes.length; index += 1) if (notes[index - 1].startTick + notes[index - 1].durationTicks > notes[index].startTick) issues.push({ code: 'overlap', message: `${voiceLabels[voice]} não pode ter duas notas simultâneas nesta versão.`, voice })
  }

  const ticks = [...new Set(parts.flatMap((part) => part.notes.flatMap((note) => [note.startTick, note.startTick + note.durationTicks])))].sort((first, second) => first - second)
  const snapshots = ticks.map((tick) => ({ tick, pitches: voiceOrder.map((voice) => byVoice[voice] ? noteAt(byVoice[voice]!.notes, tick)?.pitchMidi ?? null : null) })).filter((snapshot) => snapshot.pitches.every((pitch) => pitch !== null)) as Array<{ tick: number; pitches: number[] }>
  for (const snapshot of snapshots) for (let index = 1; index < snapshot.pitches.length; index += 1) if (snapshot.pitches[index] <= snapshot.pitches[index - 1]) issues.push({ code: 'crossing', message: `A edição cria cruzamento entre ${voiceLabels[voiceOrder[index - 1]]} e ${voiceLabels[voiceOrder[index]]}.` })
  for (let index = 1; index < snapshots.length; index += 1) {
    const previous = snapshots[index - 1]
    const current = snapshots[index]
    for (let lower = 0; lower < voiceOrder.length - 1; lower += 1) for (let upper = lower + 1; upper < voiceOrder.length; upper += 1) {
      const firstMotion = current.pitches[upper] - previous.pitches[upper]
      const secondMotion = current.pitches[lower] - previous.pitches[lower]
      if (firstMotion !== 0 && secondMotion !== 0 && Math.sign(firstMotion) === Math.sign(secondMotion) && isPerfect(previous.pitches[upper] - previous.pitches[lower]) && isPerfect(current.pitches[upper] - current.pitches[lower])) issues.push({ code: 'parallel-perfect', message: 'A edição cria quinta ou oitava paralela entre duas vozes.' })
    }
  }
  return issues
}

export function updateArrangementNote(parts: VocalPart[], voice: VoiceName, noteId: string, patch: ArrangementNotePatch): ArrangementEditResult {
  const source = parts.find((part) => part.id === voice)
  const sourceNote = source?.notes.find((note) => note.id === noteId)
  if (!source || !sourceNote) return { issues: [{ code: 'range', message: 'A nota selecionada não existe mais no arranjo.' }], parts }
  if (sourceNote.locked) return { issues: [{ code: 'locked', message: 'Desbloqueie esta nota antes de editá-la.', voice }], parts }
  const nextParts = cloneParts(parts).map((part) => part.id !== voice ? part : {
    ...part,
    notes: ordered(part.notes.map((note) => note.id !== noteId ? note : {
      ...note,
      durationTicks: Math.max(1, Math.round(patch.durationTicks)),
      origin: 'edited' as const,
      pitchMidi: Math.max(0, Math.min(127, Math.round(patch.pitchMidi))),
      spelling: midiToSpelling(Math.max(0, Math.min(127, Math.round(patch.pitchMidi)))),
      startTick: Math.max(0, Math.round(patch.startTick)),
    })),
  })
  const issues = validateEditableArrangement(nextParts)
  return { issues, parts: issues.length > 0 ? parts : nextParts }
}

export function toggleArrangementNoteLock(parts: VocalPart[], voice: VoiceName, noteId: string): ArrangementEditResult {
  const exists = parts.some((part) => part.id === voice && part.notes.some((note) => note.id === noteId))
  if (!exists) return { issues: [{ code: 'range', message: 'A nota selecionada não existe mais no arranjo.' }], parts }
  return { issues: [], parts: cloneParts(parts).map((part) => part.id !== voice ? part : { ...part, notes: part.notes.map((note) => note.id === noteId ? { ...note, locked: !note.locked } : note) }) }
}

export function regenerateArrangementPhrase(parts: VocalPart[], replacement: VocalPart[], phraseId: string): ArrangementEditResult {
  const replacementByVoice = Object.fromEntries(replacement.map((part) => [part.id, part]))
  const nextParts = cloneParts(parts).map((part) => {
    const fresh = replacementByVoice[part.id]
    if (!fresh) return part
    const currentPhrase = part.notes.filter((note) => note.phraseId === phraseId)
    const freshPhrase = fresh.notes.filter((note) => note.phraseId === phraseId)
    const locked = currentPhrase.filter((note) => note.locked)
    const unlockedFresh = freshPhrase.filter((freshNote) => !locked.some((lockedNote) => lockedNote.id === freshNote.id))
    return { ...part, notes: ordered([...part.notes.filter((note) => note.phraseId !== phraseId), ...locked, ...unlockedFresh]) }
  })
  const issues = validateEditableArrangement(nextParts)
  return { issues, parts: issues.length > 0 ? parts : nextParts }
}

export function changedArrangementNotes(original: VocalPart[], current: VocalPart[]) {
  const originalNotes = new Map(original.flatMap((part) => part.notes.map((note) => [`${part.id}:${note.id}`, note])))
  return current.flatMap((part) => part.notes.filter((note) => {
    const before = originalNotes.get(`${part.id}:${note.id}`)
    return !before || before.pitchMidi !== note.pitchMidi || before.startTick !== note.startTick || before.durationTicks !== note.durationTicks || before.locked !== note.locked
  }).map((note) => ({ note, voice: part.id as VoiceName })))
}
