import { addNote, defaultQuantizationTicks, detectAssistedKey, mergeNoteWithNext, quantizeNotes, splitNote, updateNote } from '../../src/music/editor'
import { commitEdit, createEditHistory, redoEdit, undoEdit } from '../../src/music/editHistory'
import type { NoteEvent } from '../../src/music/types'
import { describe, expect, it } from 'vitest'

function note(id: string, pitchMidi: number, startTick: number, durationTicks: number, locked = false): NoteEvent {
  return { durationTicks, id, locked, origin: 'imported', pitchMidi, spelling: `N${pitchMidi}`, startTick, velocity: 96, voiceId: 'melody' }
}

describe('melody editor domain', () => {
  it('edits an unlocked note through the canonical pitch, spelling and timing fields', () => {
    const original = [note('a', 60, 120, 480)]
    const edited = updateNote(original, 'a', { durationTicks: 240, pitchMidi: 62, startTick: 240 })

    expect(edited[0]).toMatchObject({ durationTicks: 240, origin: 'edited', pitchMidi: 62, spelling: 'D4', startTick: 240 })
    expect(original[0]).toMatchObject({ durationTicks: 480, pitchMidi: 60, startTick: 120 })
  })

  it('preserves locked notes during direct edits and quantization', () => {
    const locked = note('locked', 61, 125, 250, true)
    const source = [locked, note('free', 64, 125, 250)]

    expect(updateNote(source, 'locked', { pitchMidi: 70 })).toBe(source)
    const quantized = quantizeNotes(source, defaultQuantizationTicks)
    expect(quantized[0]).toBe(locked)
    expect(quantized[1]).toMatchObject({ durationTicks: 240, pitchMidi: 64, startTick: 240 })
  })

  it('splits and merges unlocked notes without losing their musical timing', () => {
    const source = [note('a', 60, 0, 480)]
    const split = splitNote(source, 'a')

    expect(split).toHaveLength(2)
    expect(split.map((entry) => [entry.startTick, entry.durationTicks])).toEqual([[0, 240], [240, 240]])
    const merged = mergeNoteWithNext(split, 'a')
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ durationTicks: 480, origin: 'edited', startTick: 0 })
  })

  it('keeps a bounded semantic history that undo and redo can restore', () => {
    const initial = [note('a', 60, 0, 240)]
    const changed = addNote(initial, { pitchMidi: 64, startTick: 240 })
    const committed = commitEdit(createEditHistory(initial), changed, 'Adicionar nota')
    const undone = undoEdit(committed)
    const redone = redoEdit(undone)

    expect(undone.present).toBe(initial)
    expect(redone.present).toBe(changed)
    expect(redone.past).toHaveLength(1)
  })

  it('offers a tonal candidate from weighted note durations without confirming it as fact', () => {
    const candidate = detectAssistedKey([note('c', 60, 0, 480), note('e', 64, 480, 480), note('g', 67, 960, 960)])

    expect(candidate).toMatchObject({ confidence: 1, label: 'Dó maior', mode: 'major', tonic: 0 })
  })
})
