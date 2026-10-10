import { changedArrangementNotes, regenerateArrangementPhrase, toggleArrangementNoteLock, updateArrangementNote, validateEditableArrangement } from '../../src/music/arrangementEditor'
import { analyzeHarmony } from '../../src/music/harmony'
import { generateSatbArrangements } from '../../src/music/satb'
import type { NoteEvent, VocalPart } from '../../src/music/types'
import { describe, expect, it } from 'vitest'

function melodyNote(id: string, pitchMidi: number, startTick: number, phraseId: string): NoteEvent {
  return { durationTicks: 960, id, locked: false, origin: 'edited', phraseId, pitchMidi, spelling: `N${pitchMidi}`, startTick, velocity: 96, voiceId: 'melody' }
}

function arrangement() {
  const melody = [melodyNote('one', 64, 0, 'one'), melodyNote('two', 65, 960, 'two'), melodyNote('three', 67, 1920, 'three'), melodyNote('four', 64, 2880, 'four')]
  return generateSatbArrangements(melody, analyzeHarmony(melody)!, 'soprano').alternatives[0]!.parts
}

describe('arrangement editor domain', () => {
  it('edits an unlocked generated voice without mutating the original arrangement', () => {
    const source = arrangement()
    const bass = source.find((part) => part.id === 'bass')!
    const result = updateArrangementNote(source, 'bass', bass.notes[0].id, { durationTicks: bass.notes[0].durationTicks, pitchMidi: bass.notes[0].pitchMidi + 1, startTick: bass.notes[0].startTick })

    expect(result.issues).toEqual([])
    expect(result.parts.find((part) => part.id === 'bass')!.notes[0]).toMatchObject({ origin: 'edited', pitchMidi: bass.notes[0].pitchMidi + 1 })
    expect(source.find((part) => part.id === 'bass')!.notes[0].pitchMidi).toBe(bass.notes[0].pitchMidi)
  })

  it('rejects edits that make one voice overlap itself or cross another voice', () => {
    const source = arrangement()
    const bass = source.find((part) => part.id === 'bass')!
    const overlap = updateArrangementNote(source, 'bass', bass.notes[1].id, { durationTicks: bass.notes[1].durationTicks, pitchMidi: bass.notes[1].pitchMidi, startTick: 120 })
    const crossing = updateArrangementNote(source, 'bass', bass.notes[0].id, { durationTicks: bass.notes[0].durationTicks, pitchMidi: 80, startTick: 0 })

    expect(overlap.issues.some((issue) => issue.code === 'overlap')).toBe(true)
    expect(overlap.parts).toEqual(source)
    expect(crossing.issues.some((issue) => issue.code === 'range' || issue.code === 'crossing')).toBe(true)
    expect(crossing.parts).toEqual(source)
  })

  it('locks a note and preserves it during phrase regeneration', () => {
    const source = arrangement()
    const tenor = source.find((part) => part.id === 'tenor')!
    const locked = toggleArrangementNoteLock(source, 'tenor', tenor.notes[0].id).parts
    const replacement: VocalPart[] = locked.map((part) => ({ ...part, notes: part.notes.map((note) => note.phraseId === 'one' ? { ...note, pitchMidi: note.pitchMidi + 1 } : { ...note }) }))
    const result = regenerateArrangementPhrase(locked, replacement, 'one')

    expect(result.issues).toEqual([])
    expect(result.parts.find((part) => part.id === 'tenor')!.notes[0]).toMatchObject({ locked: true, pitchMidi: tenor.notes[0].pitchMidi })
  })

  it('reports changes for a comparison view and detects no errors in the source', () => {
    const source = arrangement()
    const alto = source.find((part) => part.id === 'alto')!
    const edited = toggleArrangementNoteLock(source, 'alto', alto.notes[0].id).parts

    expect(validateEditableArrangement(source)).toEqual([])
    expect(changedArrangementNotes(source, edited)).toHaveLength(1)
  })
})
