import { analyzeHarmony } from '../../src/music/harmony'
import { defaultVoiceRanges, generateSatbArrangements } from '../../src/music/satb'
import type { NoteEvent } from '../../src/music/types'
import { describe, expect, it } from 'vitest'

function note(id: string, pitchMidi: number, startTick: number, phraseId: string, locked = false): NoteEvent {
  return { durationTicks: 960, id, locked, origin: 'edited', phraseId, pitchMidi, spelling: `N${pitchMidi}`, startTick, velocity: 96, voiceId: 'melody' }
}

function cadenceMelody() {
  return [note('one', 64, 0, 'one', true), note('two', 65, 960, 'two'), note('three', 67, 1920, 'three'), note('four', 64, 2880, 'four')]
}

describe('SATB generator', () => {
  it('generates four jointly valid voices while preserving the confirmed melody and its locks', () => {
    const melody = cadenceMelody()
    const before = structuredClone(melody)
    const harmony = analyzeHarmony(melody)
    const result = generateSatbArrangements(melody, harmony!, 'soprano')
    const arrangement = result.alternatives[0]
    const soprano = arrangement.parts.find((part) => part.id === 'soprano')!

    expect(result.error).toBeNull()
    expect(arrangement.parts.map((part) => part.id)).toEqual(['bass', 'tenor', 'alto', 'soprano'])
    expect(soprano.notes.map((entry) => [entry.pitchMidi, entry.startTick, entry.durationTicks, entry.locked])).toEqual(before.map((entry) => [entry.pitchMidi, entry.startTick, entry.durationTicks, entry.locked]))
    expect(arrangement.diagnostics.some((diagnostic) => diagnostic.severity === 'error')).toBe(false)
    expect(melody).toEqual(before)
  })

  it('creates independent inner lines instead of a fixed transposition of the melody', () => {
    const melody = cadenceMelody()
    const arrangement = generateSatbArrangements(melody, analyzeHarmony(melody)!, 'soprano').alternatives[0]
    const alto = arrangement.parts.find((part) => part.id === 'alto')!
    const soprano = arrangement.parts.find((part) => part.id === 'soprano')!
    const verticalIntervals = soprano.notes.map((entry, index) => entry.pitchMidi - alto.notes[index].pitchMidi)

    expect(new Set(verticalIntervals).size).toBeGreaterThan(1)
    expect(arrangement.diagnostics.some((diagnostic) => diagnostic.code === 'parallel-perfect')).toBe(false)
  })

  it('refuses an impossible selected tessitura rather than transposing the melody', () => {
    const melody = [note('too-high', 84, 0, 'one', true)]
    const result = generateSatbArrangements(melody, analyzeHarmony(melody)!, 'soprano', defaultVoiceRanges)

    expect(result.alternatives).toEqual([])
    expect(result.error).toMatch(/não cabe na tessitura/i)
    expect(melody[0]).toMatchObject({ locked: true, pitchMidi: 84 })
  })

  it('keeps the main line in tenor when that voice is selected', () => {
    const melody = [note('one', 60, 0, 'one'), note('two', 62, 960, 'two'), note('three', 64, 1920, 'three'), note('four', 60, 2880, 'four')]
    const result = generateSatbArrangements(melody, analyzeHarmony(melody)!, 'tenor')
    const tenor = result.alternatives[0]?.parts.find((part) => part.id === 'tenor')

    expect(result.error).toBeNull()
    expect(tenor?.notes.map((entry) => entry.pitchMidi)).toEqual(melody.map((entry) => entry.pitchMidi))
  })
})
