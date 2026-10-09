import { detectAssistedKey, type KeyCandidate } from './editor'
import type { NoteEvent } from './types'

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'major7' | 'minor7' | 'dominant7'
export type HarmonicFunction = 'tonic' | 'predominant' | 'dominant'
export type HarmonyConflictKind = 'non-chord-tone' | 'out-of-scale'

export type ChordDefinition = {
  inversion: 0 | 1 | 2 | 3
  quality: ChordQuality
  rootPitchClass: number
}

export type HarmonicPhrase = {
  endTick: number
  id: string
  noteIds: string[]
  startTick: number
}

export type HarmonyConflict = { kind: HarmonyConflictKind; noteId: string; phraseId: string }

export type HarmonicCandidate = {
  chord: ChordDefinition
  conflictCount: number
  degree: string
  function: HarmonicFunction
  label: string
  phraseId: string
  score: number
  symbol: string
}

export type HarmonyAnalysis = {
  candidates: HarmonicCandidate[]
  chords: HarmonicCandidate[]
  confidence: number
  conflicts: HarmonyConflict[]
  phrases: HarmonicPhrase[]
  tonalContext: KeyCandidate
}

type DegreeDefinition = {
  degree: string
  function: HarmonicFunction
  quality: Extract<ChordQuality, 'major' | 'minor' | 'diminished'>
  scaleOffset: number
}

const pitchClassNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const majorScale = [0, 2, 4, 5, 7, 9, 11]
const minorScale = [0, 2, 3, 5, 7, 8, 10]
const majorDegrees: DegreeDefinition[] = [
  { degree: 'I', function: 'tonic', quality: 'major', scaleOffset: 0 },
  { degree: 'ii', function: 'predominant', quality: 'minor', scaleOffset: 2 },
  { degree: 'iii', function: 'tonic', quality: 'minor', scaleOffset: 4 },
  { degree: 'IV', function: 'predominant', quality: 'major', scaleOffset: 5 },
  { degree: 'V', function: 'dominant', quality: 'major', scaleOffset: 7 },
  { degree: 'vi', function: 'tonic', quality: 'minor', scaleOffset: 9 },
  { degree: 'vii°', function: 'dominant', quality: 'diminished', scaleOffset: 11 },
]
const minorDegrees: DegreeDefinition[] = [
  { degree: 'i', function: 'tonic', quality: 'minor', scaleOffset: 0 },
  { degree: 'ii°', function: 'predominant', quality: 'diminished', scaleOffset: 2 },
  { degree: 'III', function: 'tonic', quality: 'major', scaleOffset: 3 },
  { degree: 'iv', function: 'predominant', quality: 'minor', scaleOffset: 5 },
  { degree: 'v', function: 'dominant', quality: 'minor', scaleOffset: 7 },
  { degree: 'VI', function: 'tonic', quality: 'major', scaleOffset: 8 },
  { degree: 'VII', function: 'dominant', quality: 'major', scaleOffset: 10 },
]

function normalizePitchClass(value: number) {
  return ((value % 12) + 12) % 12
}

function qualityIntervals(quality: ChordQuality) {
  switch (quality) {
    case 'minor': return [0, 3, 7]
    case 'diminished': return [0, 3, 6]
    case 'major7': return [0, 4, 7, 11]
    case 'minor7': return [0, 3, 7, 10]
    case 'dominant7': return [0, 4, 7, 10]
    default: return [0, 4, 7]
  }
}

export function chordPitchClasses(chord: ChordDefinition) {
  return qualityIntervals(chord.quality).map((interval) => normalizePitchClass(chord.rootPitchClass + interval))
}

export function chordSymbol(chord: ChordDefinition) {
  const suffix = { diminished: 'dim', dominant7: '7', major: '', major7: 'maj7', minor: 'm', minor7: 'm7' }[chord.quality]
  const tones = chordPitchClasses(chord)
  const bass = tones[Math.min(chord.inversion, tones.length - 1)]
  return `${pitchClassNames[normalizePitchClass(chord.rootPitchClass)]}${suffix}${chord.inversion === 0 ? '' : `/${pitchClassNames[bass]}`}`
}

export function chordLabel(chord: ChordDefinition) {
  const quality = { diminished: 'diminuto', dominant7: 'com sétima dominante', major: 'maior', major7: 'com sétima maior', minor: 'menor', minor7: 'com sétima menor' }[chord.quality]
  return `${pitchClassNames[normalizePitchClass(chord.rootPitchClass)]} ${quality}${chord.inversion === 0 ? '' : `, inversão ${chord.inversion}`}`
}

function orderedNotes(notes: NoteEvent[]) {
  return [...notes].sort((first, second) => first.startTick - second.startTick || first.pitchMidi - second.pitchMidi || first.id.localeCompare(second.id))
}

export function analyzePhrases(notes: NoteEvent[]): HarmonicPhrase[] {
  const sorted = orderedNotes(notes)
  if (sorted.length === 0) return []
  const phrases: NoteEvent[][] = []
  let current: NoteEvent[] = []
  let previousEnd = -1
  let previousPhraseId: string | undefined
  for (const note of sorted) {
    const beginsNewPhrase = current.length > 0 && (note.phraseId !== previousPhraseId || note.startTick - previousEnd > 960)
    if (beginsNewPhrase) { phrases.push(current); current = [] }
    current.push(note)
    previousEnd = Math.max(previousEnd, note.startTick + note.durationTicks)
    previousPhraseId = note.phraseId
  }
  if (current.length > 0) phrases.push(current)
  return phrases.map((phrase, index) => ({
    endTick: Math.max(...phrase.map((note) => note.startTick + note.durationTicks)),
    id: phrase[0].phraseId ?? `phrase-${index + 1}`,
    noteIds: phrase.map((note) => note.id),
    startTick: Math.min(...phrase.map((note) => note.startTick)),
  }))
}

function candidateDefinitions(key: KeyCandidate) {
  const degrees = key.mode === 'major' ? majorDegrees : minorDegrees
  return degrees.map((definition) => ({
    chord: { inversion: 0 as const, quality: definition.quality, rootPitchClass: normalizePitchClass(key.tonic + definition.scaleOffset) },
    degree: definition.degree,
    function: definition.function,
  }))
}

function phraseNotes(phrase: HarmonicPhrase, notes: NoteEvent[]) {
  const ids = new Set(phrase.noteIds)
  return notes.filter((note) => ids.has(note.id))
}

function functionTransitionBonus(previous: HarmonicFunction | null, next: HarmonicFunction, isFinalPhrase: boolean) {
  if (previous === null) return next === 'tonic' ? 0.08 : 0
  if (previous === 'predominant' && next === 'dominant') return 0.16
  if (previous === 'dominant' && next === 'tonic') return 0.2
  if (previous === next) return -0.05
  if (isFinalPhrase && next === 'tonic') return 0.14
  return 0
}

function candidateScore(chord: ChordDefinition, notes: NoteEvent[], key: KeyCandidate) {
  const tones = chordPitchClasses(chord)
  const scale = key.mode === 'major' ? majorScale : minorScale
  const totalDuration = notes.reduce((total, note) => total + note.durationTicks, 0) || 1
  const weighted = notes.reduce((total, note) => {
    const pitchClass = normalizePitchClass(note.pitchMidi)
    if (tones.includes(pitchClass)) return total + note.durationTicks
    if (scale.includes(normalizePitchClass(pitchClass - key.tonic))) return total + note.durationTicks * 0.22
    return total - note.durationTicks * 0.5
  }, 0)
  return Math.max(0, Math.min(1, weighted / totalDuration))
}

function conflictsFor(phrase: HarmonicPhrase, chord: ChordDefinition, notes: NoteEvent[], key: KeyCandidate) {
  const tones = chordPitchClasses(chord)
  const scale = key.mode === 'major' ? majorScale : minorScale
  return phraseNotes(phrase, notes).flatMap((note) => {
    const pitchClass = normalizePitchClass(note.pitchMidi)
    if (tones.includes(pitchClass)) return []
    return [{
      kind: scale.includes(normalizePitchClass(pitchClass - key.tonic)) ? 'non-chord-tone' as const : 'out-of-scale' as const,
      noteId: note.id,
      phraseId: phrase.id,
    }]
  })
}

export function analyzeHarmony(notes: NoteEvent[]): HarmonyAnalysis | null {
  const tonalContext = detectAssistedKey(notes)
  if (!tonalContext || notes.length === 0) return null
  const phrases = analyzePhrases(notes)
  const definitions = candidateDefinitions(tonalContext)
  const candidates = phrases.flatMap((phrase) => definitions.map((definition) => {
    const conflicts = conflictsFor(phrase, definition.chord, notes, tonalContext)
    return {
      chord: definition.chord,
      conflictCount: conflicts.length,
      degree: definition.degree,
      function: definition.function,
      label: chordLabel(definition.chord),
      phraseId: phrase.id,
      score: candidateScore(definition.chord, phraseNotes(phrase, notes), tonalContext),
      symbol: chordSymbol(definition.chord),
    }
  }))

  let previousFunction: HarmonicFunction | null = null
  const chords = phrases.map((phrase, index) => {
    const forPhrase = candidates.filter((candidate) => candidate.phraseId === phrase.id)
    const isFinalPhrase = index === phrases.length - 1
    const ranked = [...forPhrase].sort((first, second) => {
      const firstScore = first.score + functionTransitionBonus(previousFunction, first.function, isFinalPhrase)
      const secondScore = second.score + functionTransitionBonus(previousFunction, second.function, isFinalPhrase)
      return secondScore - firstScore || first.conflictCount - second.conflictCount || first.degree.localeCompare(second.degree)
    })
    const selected = ranked[0]
    previousFunction = selected.function
    return selected
  })

  const conflicts = chords.flatMap((candidate) => {
    const phrase = phrases.find((entry) => entry.id === candidate.phraseId)
    return phrase ? conflictsFor(phrase, candidate.chord, notes, tonalContext) : []
  })
  const confidence = chords.length === 0 ? 0 : chords.reduce((total, chord) => total + chord.score, 0) / chords.length

  return { candidates, chords, confidence, conflicts, phrases, tonalContext }
}
