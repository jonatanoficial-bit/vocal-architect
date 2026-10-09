import { midiToSpelling } from './pitch'
import type { HarmonicCandidate, HarmonyAnalysis } from './harmony'
import type { NoteEvent, VocalPart } from './types'

export type VoiceName = 'soprano' | 'alto' | 'tenor' | 'bass'

export type VoiceRange = {
  comfortableMaximumMidi: number
  comfortableMinimumMidi: number
  maximumMidi: number
  minimumMidi: number
}

export type SatbDiagnostic = {
  code: 'cadence' | 'crossing' | 'melody-preservation' | 'parallel-perfect' | 'range' | 'spacing'
  message: string
  severity: 'error' | 'warning'
  voice?: VoiceName
}

export type SatbArrangement = {
  diagnostics: SatbDiagnostic[]
  id: string
  melodyVoice: VoiceName
  parts: VocalPart[]
  score: number
}

export type SatbGenerationResult = {
  alternatives: SatbArrangement[]
  error: string | null
}

type Voicing = Record<VoiceName, number>
type SearchState = { score: number; voicings: Voicing[] }

const voiceOrder: VoiceName[] = ['bass', 'tenor', 'alto', 'soprano']
const voiceLabels: Record<VoiceName, string> = { alto: 'Contralto', bass: 'Baixo', soprano: 'Soprano', tenor: 'Tenor' }

export const defaultVoiceRanges: Record<VoiceName, VoiceRange> = {
  soprano: { comfortableMaximumMidi: 76, comfortableMinimumMidi: 62, maximumMidi: 81, minimumMidi: 60 },
  alto: { comfortableMaximumMidi: 69, comfortableMinimumMidi: 57, maximumMidi: 74, minimumMidi: 55 },
  tenor: { comfortableMaximumMidi: 64, comfortableMinimumMidi: 50, maximumMidi: 69, minimumMidi: 48 },
  bass: { comfortableMaximumMidi: 55, comfortableMinimumMidi: 40, maximumMidi: 60, minimumMidi: 40 },
}

function pitchClass(value: number) {
  return ((value % 12) + 12) % 12
}

function orderedNotes(notes: NoteEvent[]) {
  return [...notes].sort((first, second) => first.startTick - second.startTick || first.pitchMidi - second.pitchMidi || first.id.localeCompare(second.id))
}

function phraseMelody(phraseId: string, analysis: HarmonyAnalysis, melody: NoteEvent[]) {
  const phrase = analysis.phrases.find((entry) => entry.id === phraseId)
  const ids = new Set(phrase?.noteIds ?? [])
  return orderedNotes(melody.filter((note) => ids.has(note.id)))
}

function pitchesForToneClasses(tones: number[], range: VoiceRange, previous: number | undefined) {
  const pitches: number[] = []
  for (let pitch = range.minimumMidi; pitch <= range.maximumMidi; pitch += 1) if (tones.includes(pitchClass(pitch))) pitches.push(pitch)
  return pitches.sort((first, second) => {
    const firstDistance = previous === undefined ? Math.abs(first - (range.comfortableMinimumMidi + range.comfortableMaximumMidi) / 2) : Math.abs(first - previous)
    const secondDistance = previous === undefined ? Math.abs(second - (range.comfortableMinimumMidi + range.comfortableMaximumMidi) / 2) : Math.abs(second - previous)
    return firstDistance - secondDistance || first - second
  }).slice(0, 7)
}

function movementCost(previous: Voicing | undefined, current: Voicing, chord: HarmonicCandidate, isFinal: boolean, ranges: Record<VoiceName, VoiceRange>) {
  let cost = 0
  if (pitchClass(current.bass) !== chord.chord.rootPitchClass) cost += 0.3
  if (isFinal && chord.function === 'tonic' && pitchClass(current.bass) === chord.chord.rootPitchClass) cost -= 0.55
  for (const voice of voiceOrder) {
    const range = ranges[voice]
    const pitch = current[voice]
    if (pitch < range.comfortableMinimumMidi || pitch > range.comfortableMaximumMidi) cost += 0.18
    if (previous) {
      const leap = Math.abs(pitch - previous[voice])
      cost += leap * 0.055
      if (leap > 7) cost += (leap - 7) * 0.4
    }
  }
  return cost
}

function movesInSameDirection(first: number, second: number, nextFirst: number, nextSecond: number) {
  const firstDirection = Math.sign(nextFirst - first)
  const secondDirection = Math.sign(nextSecond - second)
  return firstDirection !== 0 && firstDirection === secondDirection
}

function hasParallelPerfect(previous: Voicing | undefined, current: Voicing) {
  if (!previous) return false
  for (let firstIndex = 0; firstIndex < voiceOrder.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < voiceOrder.length; secondIndex += 1) {
      const first = voiceOrder[firstIndex]
      const second = voiceOrder[secondIndex]
      const priorInterval = Math.abs(previous[second] - previous[first]) % 12
      const nextInterval = Math.abs(current[second] - current[first]) % 12
      if ((priorInterval === 0 || priorInterval === 7) && priorInterval === nextInterval && movesInSameDirection(previous[first], previous[second], current[first], current[second])) return true
    }
  }
  return false
}

function voicingsForPhrase(chord: HarmonicCandidate, melodyNotes: NoteEvent[], melodyVoice: VoiceName, ranges: Record<VoiceName, VoiceRange>, previous: Voicing | undefined) {
  const anchor = melodyNotes[0]
  if (!anchor) return []
  const roleIndex = voiceOrder.indexOf(melodyVoice)
  const lowestMelodyPitch = Math.min(...melodyNotes.map((note) => note.pitchMidi))
  const highestMelodyPitch = Math.max(...melodyNotes.map((note) => note.pitchMidi))
  const tones = chord.chord.quality === 'diminished' ? [0, 3, 6].map((interval) => pitchClass(chord.chord.rootPitchClass + interval)) : chord.chord.quality === 'minor' ? [0, 3, 7].map((interval) => pitchClass(chord.chord.rootPitchClass + interval)) : [0, 4, 7].map((interval) => pitchClass(chord.chord.rootPitchClass + interval))
  const result: Voicing[] = []
  const current = {} as Voicing

  const visit = (index: number) => {
    if (index === voiceOrder.length) { result.push({ ...current }); return }
    const voice = voiceOrder[index]
    const lowerVoice = voiceOrder[index - 1]
    const lowerPitch = lowerVoice ? current[lowerVoice] : undefined
    const choices = voice === melodyVoice ? [anchor.pitchMidi] : pitchesForToneClasses(tones, ranges[voice], previous?.[voice])
    for (const pitch of choices) {
      if (pitch < ranges[voice].minimumMidi || pitch > ranges[voice].maximumMidi) continue
      if (index < roleIndex && pitch >= lowestMelodyPitch) continue
      if (index > roleIndex && pitch <= highestMelodyPitch) continue
      if (lowerPitch !== undefined && pitch <= lowerPitch) continue
      if (lowerPitch !== undefined && index >= 2 && pitch - lowerPitch > 12) continue
      current[voice] = pitch
      visit(index + 1)
    }
  }

  visit(0)
  return result
}

function createPart(voice: VoiceName, melodyVoice: VoiceName, melody: NoteEvent[], analysis: HarmonyAnalysis, voicings: Voicing[], ranges: Record<VoiceName, VoiceRange>): VocalPart {
  const range = ranges[voice]
  const notes = voice === melodyVoice ? orderedNotes(melody).map((note) => ({ ...note, voiceId: voice })) : analysis.phrases.map((phrase, index) => ({
    durationTicks: Math.max(1, phrase.endTick - phrase.startTick),
    id: `satb-${voice}-${index + 1}`,
    locked: false,
    origin: 'generated' as const,
    phraseId: phrase.id,
    pitchMidi: voicings[index][voice],
    spelling: midiToSpelling(voicings[index][voice]),
    startTick: phrase.startTick,
    velocity: 88,
    voiceId: voice,
  }))
  return { comfortableMaximumMidi: range.comfortableMaximumMidi, comfortableMinimumMidi: range.comfortableMinimumMidi, id: voice, name: voiceLabels[voice], notes, rangeMaximumMidi: range.maximumMidi, rangeMinimumMidi: range.minimumMidi, role: voiceLabels[voice] }
}

function noteAt(notes: NoteEvent[], tick: number) {
  return notes.find((note) => note.startTick <= tick && tick < note.startTick + note.durationTicks) ?? null
}

function validateArrangement(parts: VocalPart[], melody: NoteEvent[], analysis: HarmonyAnalysis, melodyVoice: VoiceName, voicings: Voicing[]) {
  const diagnostics: SatbDiagnostic[] = []
  const byVoice = Object.fromEntries(parts.map((part) => [part.id as VoiceName, part])) as Record<VoiceName, VocalPart>
  const copiedMelody = byVoice[melodyVoice].notes
  if (copiedMelody.length !== melody.length || copiedMelody.some((note, index) => note.pitchMidi !== melody[index].pitchMidi || note.startTick !== melody[index].startTick || note.durationTicks !== melody[index].durationTicks || note.locked !== melody[index].locked)) diagnostics.push({ code: 'melody-preservation', message: 'A melodia principal não foi preservada integralmente.', severity: 'error', voice: melodyVoice })

  for (const voice of voiceOrder) for (const note of byVoice[voice].notes) if (note.pitchMidi < byVoice[voice].rangeMinimumMidi || note.pitchMidi > byVoice[voice].rangeMaximumMidi) diagnostics.push({ code: 'range', message: `${voiceLabels[voice]} fora da tessitura configurada.`, severity: 'error', voice })

  const ticks = [...new Set(parts.flatMap((part) => part.notes.map((note) => note.startTick)))].sort((first, second) => first - second)
  for (const tick of ticks) {
    const pitches = voiceOrder.map((voice) => noteAt(byVoice[voice].notes, tick)?.pitchMidi ?? null)
    if (pitches.some((pitch) => pitch === null)) continue
    for (let index = 1; index < pitches.length; index += 1) {
      const lower = pitches[index - 1] as number
      const upper = pitches[index] as number
      if (upper <= lower) diagnostics.push({ code: 'crossing', message: `Cruzamento entre ${voiceLabels[voiceOrder[index - 1]]} e ${voiceLabels[voiceOrder[index]]}.`, severity: 'error' })
      if (index >= 2 && upper - lower > 12) diagnostics.push({ code: 'spacing', message: `Espaçamento amplo entre ${voiceLabels[voiceOrder[index - 1]]} e ${voiceLabels[voiceOrder[index]]}.`, severity: 'warning' })
    }
  }
  for (let index = 1; index < voicings.length; index += 1) if (hasParallelPerfect(voicings[index - 1], voicings[index])) diagnostics.push({ code: 'parallel-perfect', message: 'Quinta ou oitava paralela detectada entre mudanças harmônicas.', severity: 'error' })
  if (analysis.chords.at(-1)?.function !== 'tonic') diagnostics.push({ code: 'cadence', message: 'A última frase não encerra em função de tônica; revise a cadência.', severity: 'warning' })
  return diagnostics
}

function sourceMelodyFitsRange(melody: NoteEvent[], range: VoiceRange) {
  return melody.every((note) => note.pitchMidi >= range.minimumMidi && note.pitchMidi <= range.maximumMidi)
}

export function generateSatbArrangements(melody: NoteEvent[], analysis: HarmonyAnalysis, melodyVoice: VoiceName, ranges: Record<VoiceName, VoiceRange> = defaultVoiceRanges): SatbGenerationResult {
  if (melody.length === 0) return { alternatives: [], error: 'Confirme uma melodia com pelo menos uma nota antes de gerar o arranjo.' }
  if (!sourceMelodyFitsRange(melody, ranges[melodyVoice])) return { alternatives: [], error: `A melodia não cabe na tessitura de ${voiceLabels[melodyVoice]}. Ela não foi transposta automaticamente.` }
  if (analysis.chords.length !== analysis.phrases.length) return { alternatives: [], error: 'A análise harmônica está incompleta; gere uma nova análise antes do arranjo.' }

  let states: SearchState[] = [{ score: 0, voicings: [] }]
  for (let index = 0; index < analysis.chords.length; index += 1) {
    const chord = analysis.chords[index]
    const notes = phraseMelody(chord.phraseId, analysis, melody)
    const next: SearchState[] = []
    for (const state of states) {
      const previous = state.voicings.at(-1)
      for (const voicing of voicingsForPhrase(chord, notes, melodyVoice, ranges, previous)) {
        if (hasParallelPerfect(previous, voicing)) continue
        next.push({ score: state.score + movementCost(previous, voicing, chord, index === analysis.chords.length - 1, ranges), voicings: [...state.voicings, voicing] })
      }
    }
    states = next.sort((first, second) => first.score - second.score).slice(0, 24)
    if (states.length === 0) return { alternatives: [], error: `Não há disposição SATB válida para a frase ${index + 1} dentro das tessituras e restrições atuais.` }
  }

  const alternatives: SatbArrangement[] = []
  const seen = new Set<string>()
  for (const state of states) {
    const signature = state.voicings.map((voicing) => voiceOrder.map((voice) => voicing[voice]).join(',')).join('|')
    if (seen.has(signature)) continue
    seen.add(signature)
    const parts = voiceOrder.map((voice) => createPart(voice, melodyVoice, melody, analysis, state.voicings, ranges))
    const diagnostics = validateArrangement(parts, melody, analysis, melodyVoice, state.voicings)
    if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) continue
    alternatives.push({ diagnostics, id: `satb-${alternatives.length + 1}`, melodyVoice, parts, score: Math.max(0, Math.round(100 - state.score * 10)) })
    if (alternatives.length === 3) break
  }
  return alternatives.length > 0 ? { alternatives, error: null } : { alternatives: [], error: 'As alternativas encontradas violam restrições rígidas de SATB. Ajuste a tessitura ou revise a harmonia.' }
}
