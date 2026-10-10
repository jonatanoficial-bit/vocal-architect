import type { ChordQuality, HarmonyAnalysis } from './harmony'
import type { VoiceName } from './satb'
import { PPQ, type NoteEvent, type VocalPart } from './types'

export type NotationClef = { line: number; octaveChange?: -1; sign: 'C' | 'F' | 'G' }

export type NotationEvent = {
  durationTicks: number
  kind: 'note' | 'rest'
  pitchMidi?: number
  sourceNoteId?: string
  spelling?: string
  startTick: number
  tieStart: boolean
  tieStop: boolean
}

export type NotationMeasure = { events: NotationEvent[]; number: number; startTick: number }

export type NotationPart = { clef: NotationClef; id: string; measures: NotationMeasure[]; name: string; role: string }

export type NotationChord = { measureNumber: number; offsetTicks: number; quality: ChordQuality; rootPitchClass: number; symbol: string }

export type NotationScore = {
  chords: NotationChord[]
  divisions: number
  key: { fifths: number; label: string; mode: 'major' | 'minor' }
  measureTicks: number
  meter: { beatType: 4; beats: 4 }
  parts: NotationPart[]
  tempoBpm: number
}

const voiceOrder: VoiceName[] = ['soprano', 'alto', 'tenor', 'bass']
const majorFifths = [0, 7, 2, -3, 4, -1, 6, 1, -4, 3, -2, 5]
const minorFifths = [-3, 4, -1, -6, 1, -4, 3, -2, 5, 0, -5, 2]
const pitchSteps = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B']
const pitchAlters = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]

function orderedNotes(notes: NoteEvent[]) {
  return [...notes].sort((first, second) => first.startTick - second.startTick || first.pitchMidi - second.pitchMidi || first.id.localeCompare(second.id))
}

function clefForVoice(id: string): NotationClef {
  if (id === 'bass') return { line: 4, sign: 'F' }
  if (id === 'alto') return { line: 3, sign: 'C' }
  if (id === 'tenor') return { line: 2, octaveChange: -1, sign: 'G' }
  return { line: 2, sign: 'G' }
}

function appendSpan(events: NotationEvent[], startTick: number, durationTicks: number, note?: NoteEvent, tieStop = false, tieStart = false) {
  if (durationTicks <= 0) return
  events.push(note ? { durationTicks, kind: 'note', pitchMidi: note.pitchMidi, sourceNoteId: note.id, spelling: note.spelling, startTick, tieStart, tieStop } : { durationTicks, kind: 'rest', startTick, tieStart: false, tieStop: false })
}

function measuresForPart(part: VocalPart, measureCount: number, measureTicks: number) {
  const measures = Array.from({ length: measureCount }, (_, index) => ({ events: [] as NotationEvent[], number: index + 1, startTick: index * measureTicks }))
  let cursor = 0
  for (const note of orderedNotes(part.notes)) {
    const noteStart = Math.max(cursor, note.startTick)
    const noteEnd = Math.max(noteStart, note.startTick + note.durationTicks)
    let position = cursor
    while (position < noteStart) {
      const measure = Math.floor(position / measureTicks)
      const segmentEnd = Math.min(noteStart, (measure + 1) * measureTicks)
      appendSpan(measures[measure]?.events ?? [], position, segmentEnd - position)
      position = segmentEnd
    }
    position = noteStart
    while (position < noteEnd) {
      const measure = Math.floor(position / measureTicks)
      const segmentEnd = Math.min(noteEnd, (measure + 1) * measureTicks)
      appendSpan(measures[measure]?.events ?? [], position, segmentEnd - position, note, position > noteStart, segmentEnd < noteEnd)
      position = segmentEnd
    }
    cursor = Math.max(cursor, noteEnd)
  }
  while (cursor < measureCount * measureTicks) {
    const measure = Math.floor(cursor / measureTicks)
    const segmentEnd = Math.min(measureCount * measureTicks, (measure + 1) * measureTicks)
    appendSpan(measures[measure]?.events ?? [], cursor, segmentEnd - cursor)
    cursor = segmentEnd
  }
  return measures
}

function pitchClass(value: number) {
  return ((value % 12) + 12) % 12
}

function scoreEndTick(parts: VocalPart[]) {
  return Math.max(PPQ * 4, ...parts.flatMap((part) => part.notes.map((note) => note.startTick + note.durationTicks)))
}

export function createNotationScore(parts: VocalPart[], analysis: HarmonyAnalysis | null, tempoBpm = 96): NotationScore {
  const meter = { beatType: 4 as const, beats: 4 as const }
  const measureTicks = PPQ * meter.beats
  const measureCount = Math.max(1, Math.ceil(scoreEndTick(parts) / measureTicks))
  const sortIndex = (part: VocalPart) => {
    const index = voiceOrder.indexOf(part.id as VoiceName)
    return index < 0 ? voiceOrder.length : index
  }
  const sortedParts = [...parts].sort((first, second) => sortIndex(first) - sortIndex(second) || first.name.localeCompare(second.name))
  const key = analysis?.tonalContext
  const chords = analysis?.chords.flatMap((chord) => {
    const phrase = analysis.phrases.find((entry) => entry.id === chord.phraseId)
    if (!phrase) return []
    return [{ measureNumber: Math.floor(phrase.startTick / measureTicks) + 1, offsetTicks: phrase.startTick % measureTicks, quality: chord.chord.quality, rootPitchClass: chord.chord.rootPitchClass, symbol: chord.symbol }]
  }) ?? []
  return {
    chords,
    divisions: PPQ,
    key: { fifths: key ? (key.mode === 'major' ? majorFifths[key.tonic] : minorFifths[key.tonic]) : 0, label: key?.label ?? 'Dó maior', mode: key?.mode ?? 'major' },
    measureTicks,
    meter,
    parts: sortedParts.map((part) => ({ clef: clefForVoice(part.id), id: part.id, measures: measuresForPart(part, measureCount, measureTicks), name: part.name, role: part.role })),
    tempoBpm,
  }
}

export function validateNotationScore(score: NotationScore) {
  const issues: string[] = []
  if (score.parts.length === 0) issues.push('A partitura precisa de pelo menos uma parte.')
  for (const part of score.parts) {
    if (part.measures.length === 0) issues.push(`${part.name} não possui compassos.`)
    for (const measure of part.measures) {
      const duration = measure.events.reduce((total, event) => total + event.durationTicks, 0)
      if (duration !== score.measureTicks) issues.push(`${part.name}, compasso ${measure.number}: duração inválida.`)
      if (measure.events.some((event) => event.durationTicks <= 0)) issues.push(`${part.name}, compasso ${measure.number}: evento sem duração.`)
    }
  }
  return issues
}

function xmlEscape(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function pitchXml(midi: number) {
  const value = Math.round(midi)
  const index = pitchClass(value)
  return `<pitch><step>${pitchSteps[index]}</step>${pitchAlters[index] === 0 ? '' : `<alter>${pitchAlters[index]}</alter>`}<octave>${Math.floor(value / 12) - 1}</octave></pitch>`
}

function rhythmXml(durationTicks: number) {
  const rhythms: Array<{ duration: number; dots?: number; type: string }> = [
    { duration: PPQ * 4, type: 'whole' }, { dots: 1, duration: PPQ * 3, type: 'half' }, { duration: PPQ * 2, type: 'half' },
    { dots: 1, duration: PPQ * 1.5, type: 'quarter' }, { duration: PPQ, type: 'quarter' }, { dots: 1, duration: PPQ * .75, type: 'eighth' },
    { duration: PPQ / 2, type: 'eighth' }, { dots: 1, duration: PPQ * .375, type: '16th' }, { duration: PPQ / 4, type: '16th' }, { duration: PPQ / 8, type: '32nd' },
  ]
  const closest = rhythms.reduce((current, candidate) => Math.abs(candidate.duration - durationTicks) < Math.abs(current.duration - durationTicks) ? candidate : current)
  return `<duration>${durationTicks}</duration><voice>1</voice><type>${closest.type}</type>${closest.dots ? '<dot/>' : ''}`
}

function kindForMusicXml(quality: ChordQuality) {
  return { diminished: 'diminished', dominant7: 'dominant-seventh', major: 'major', major7: 'major-seventh', minor: 'minor', minor7: 'minor-seventh' }[quality]
}

function harmonyXml(chord: NotationChord) {
  const root = pitchClass(chord.rootPitchClass)
  return `<harmony><root><root-step>${pitchSteps[root]}</root-step>${pitchAlters[root] === 0 ? '' : `<root-alter>${pitchAlters[root]}</root-alter>`}</root><kind text="${xmlEscape(chord.symbol)}">${kindForMusicXml(chord.quality)}</kind>${chord.offsetTicks > 0 ? `<offset>${chord.offsetTicks}</offset>` : ''}</harmony>`
}

function eventXml(event: NotationEvent) {
  const ties = `${event.tieStop ? '<tie type="stop"/>' : ''}${event.tieStart ? '<tie type="start"/>' : ''}`
  const tied = `${event.tieStop ? '<tied type="stop"/>' : ''}${event.tieStart ? '<tied type="start"/>' : ''}`
  return `<note>${event.kind === 'rest' ? '<rest/>' : pitchXml(event.pitchMidi ?? 60)}${rhythmXml(event.durationTicks)}${ties}${tied ? `<notations>${tied}</notations>` : ''}</note>`
}

export function scoreToMusicXml(score: NotationScore) {
  const partList = score.parts.map((part) => `<score-part id="P-${xmlEscape(part.id)}"><part-name>${xmlEscape(part.name)}</part-name></score-part>`).join('')
  const parts = score.parts.map((part, partIndex) => `<part id="P-${xmlEscape(part.id)}">${part.measures.map((measure, measureIndex) => {
    const attributes = measureIndex === 0 ? `<attributes><divisions>${score.divisions}</divisions><key><fifths>${score.key.fifths}</fifths><mode>${score.key.mode}</mode></key><time><beats>${score.meter.beats}</beats><beat-type>${score.meter.beatType}</beat-type></time><clef><sign>${part.clef.sign}</sign><line>${part.clef.line}</line>${part.clef.octaveChange ? `<clef-octave-change>${part.clef.octaveChange}</clef-octave-change>` : ''}</clef></attributes><direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${score.tempoBpm}</per-minute></metronome></direction-type><sound tempo="${score.tempoBpm}"/></direction>` : ''
    const harmonies = partIndex === 0 ? score.chords.filter((chord) => chord.measureNumber === measure.number).map(harmonyXml).join('') : ''
    return `<measure number="${measure.number}">${attributes}${harmonies}${measure.events.map(eventXml).join('')}</measure>`
  }).join('')}</part>`).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"><score-partwise version="4.0"><work><work-title>Vocal Architect — arranjo SATB</work-title></work><part-list>${partList}</part-list>${parts}</score-partwise>`
}
