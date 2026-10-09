import { analyzeHarmony, analyzePhrases, chordPitchClasses, chordSymbol } from '../../src/music/harmony'
import type { NoteEvent } from '../../src/music/types'
import { describe, expect, it } from 'vitest'

function note(id: string, pitchMidi: number, startTick: number, phraseId?: string): NoteEvent {
  return { durationTicks: 480, id, locked: id === 'locked', origin: 'edited', phraseId, pitchMidi, spelling: `N${pitchMidi}`, startTick, velocity: 96, voiceId: 'melody' }
}

describe('harmony domain', () => {
  it('models chord tones and inversions without deriving data from screen coordinates', () => {
    expect(chordPitchClasses({ inversion: 0, quality: 'major', rootPitchClass: 0 })).toEqual([0, 4, 7])
    expect(chordSymbol({ inversion: 1, quality: 'major7', rootPitchClass: 0 })).toBe('Cmaj7/E')
  })

  it('segments phrases from transcription phrase identifiers and sustained gaps', () => {
    const phrases = analyzePhrases([note('a', 60, 0, 'first'), note('b', 64, 480, 'first'), note('c', 67, 2400, 'second')])

    expect(phrases).toHaveLength(2)
    expect(phrases.map((phrase) => phrase.noteIds)).toEqual([['a', 'b'], ['c']])
  })

  it('proposes a scored diatonic progression from a confirmed melody without changing the source notes', () => {
    const melody = [note('c', 60, 0, 'first'), note('e', 64, 480, 'first'), note('g', 67, 960, 'first'), note('g2', 67, 1920, 'second'), note('b', 71, 2400, 'second'), note('d', 62, 2880, 'second'), note('locked', 62, 3360, 'second')]
    const before = structuredClone(melody)
    const analysis = analyzeHarmony(melody)

    expect(analysis?.tonalContext).toMatchObject({ label: 'Dó maior', mode: 'major', tonic: 0 })
    expect(analysis?.chords.map((chord) => chord.symbol)).toEqual(['C', 'G'])
    expect(analysis?.chords.every((chord) => chord.score > 0.5)).toBe(true)
    expect(melody).toEqual(before)
    expect(melody.find((entry) => entry.id === 'locked')?.locked).toBe(true)
  })

  it('flags notes that conflict with the selected vertical harmony', () => {
    const analysis = analyzeHarmony([note('c', 60, 0), note('e', 64, 480), note('g', 67, 960), note('chromatic', 61, 1440)])

    expect(analysis?.conflicts.some((conflict) => conflict.noteId === 'chromatic' && conflict.kind === 'out-of-scale')).toBe(true)
  })
})
