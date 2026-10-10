import { analyzeHarmony } from '../../src/music/harmony'
import { createNotationScore, scoreToMusicXml, validateNotationScore } from '../../src/music/notation'
import { generateSatbArrangements } from '../../src/music/satb'
import { PPQ, type NoteEvent, type VocalPart } from '../../src/music/types'
import { describe, expect, it } from 'vitest'

function note(id: string, pitchMidi: number, startTick: number, durationTicks = PPQ): NoteEvent {
  return { durationTicks, id, locked: false, origin: 'generated', phraseId: id, pitchMidi, spelling: `N${pitchMidi}`, startTick, velocity: 88, voiceId: 'soprano' }
}

function part(notes: NoteEvent[]): VocalPart {
  return { comfortableMaximumMidi: 76, comfortableMinimumMidi: 62, id: 'soprano', name: 'Soprano', notes, rangeMaximumMidi: 81, rangeMinimumMidi: 60, role: 'Soprano' }
}

describe('notation and MusicXML', () => {
  it('creates a complete SATB score with clefs, meter, key, chords and valid measure durations', () => {
    const melody = [note('one', 64, 0), note('two', 65, PPQ), note('three', 67, PPQ * 2), note('four', 64, PPQ * 3)]
    const analysis = analyzeHarmony(melody)!
    const arrangement = generateSatbArrangements(melody, analysis, 'soprano').alternatives[0]
    const score = createNotationScore(arrangement.parts, analysis)
    const xml = scoreToMusicXml(score)

    expect(score.parts.map((entry) => entry.id)).toEqual(['soprano', 'alto', 'tenor', 'bass'])
    expect(score.parts.find((entry) => entry.id === 'soprano')?.clef).toMatchObject({ line: 2, sign: 'G' })
    expect(score.parts.find((entry) => entry.id === 'alto')?.clef).toMatchObject({ line: 3, sign: 'C' })
    expect(score.parts.find((entry) => entry.id === 'tenor')?.clef).toMatchObject({ octaveChange: -1, sign: 'G' })
    expect(score.parts.find((entry) => entry.id === 'bass')?.clef).toMatchObject({ line: 4, sign: 'F' })
    expect(score.chords).toHaveLength(4)
    expect(validateNotationScore(score)).toEqual([])
    expect(xml).toContain('<score-partwise version="4.0">')
    expect(xml).toContain('<time><beats>4</beats><beat-type>4</beat-type></time>')
    expect(xml).toContain('<harmony>')
    expect(xml).toContain('<part-name>Soprano</part-name>')
  })

  it('fills silence with rests and splits notes crossing a barline into tied notation events', () => {
    const score = createNotationScore([part([note('long', 64, PPQ, PPQ * 5)])], null)
    const firstMeasure = score.parts[0].measures[0].events
    const secondMeasure = score.parts[0].measures[1].events
    const xml = scoreToMusicXml(score)

    expect(firstMeasure[0]).toMatchObject({ durationTicks: PPQ, kind: 'rest' })
    expect(firstMeasure[1]).toMatchObject({ durationTicks: PPQ * 3, kind: 'note', tieStart: true, tieStop: false })
    expect(secondMeasure[0]).toMatchObject({ durationTicks: PPQ * 2, kind: 'note', tieStart: false, tieStop: true })
    expect(secondMeasure[1]).toMatchObject({ durationTicks: PPQ * 2, kind: 'rest' })
    expect(validateNotationScore(score)).toEqual([])
    expect(xml).toContain('<tie type="start"/>')
    expect(xml).toContain('<tie type="stop"/>')
    expect(xml).toContain('<rest/>')
  })
})
