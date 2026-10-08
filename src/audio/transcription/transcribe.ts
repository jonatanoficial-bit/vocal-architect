import { PPQ, type NoteOrigin } from '../../music/types'
import type { DecodedAudio } from '../processing/types'
import { analyzePitchFrames, midiToFrequency, midiToSpelling } from './pitch'
import { defaultTranscriptionConfig, type PitchFrame, type TranscribedNote, type TranscriptionConfig, type TranscriptionResult, type TranscriptionSource } from './types'

function median(values: number[]) {
  const ordered = [...values].sort((first, second) => first - second)
  const middle = Math.floor(ordered.length / 2)
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle]
}

function smoothPitchFrames(frames: PitchFrame[], windowSize: number) {
  const radius = Math.floor(windowSize / 2)
  return frames.map((frame, index) => {
    if (frame.midiFloat === null) return frame
    const neighborhood: number[] = []
    for (let neighborIndex = Math.max(0, index - radius); neighborIndex <= Math.min(frames.length - 1, index + radius); neighborIndex += 1) {
      const candidate = frames[neighborIndex].midiFloat
      if (candidate !== null) neighborhood.push(candidate)
    }
    return { ...frame, midiFloat: neighborhood.length > 0 ? median(neighborhood) : frame.midiFloat }
  })
}

function toDurationTicks(milliseconds: number, bpm: number) {
  return Math.max(1, Math.round(milliseconds * bpm * PPQ / 60_000))
}

function toStartTick(milliseconds: number, bpm: number) {
  return Math.max(0, Math.round(milliseconds * bpm * PPQ / 60_000))
}

function toNoteOrigin(source: TranscriptionSource): NoteOrigin {
  return source
}

function createTranscribedNote(segment: PitchFrame[], index: number, phraseIndex: number, source: TranscriptionSource, config: TranscriptionConfig): TranscribedNote | null {
  const startMs = segment[0]?.startMs
  const endMs = segment.at(-1)?.endMs
  if (startMs === undefined || endMs === undefined || endMs - startMs < config.minimumNoteDurationMs) return null

  const pitches = segment.flatMap((frame) => frame.midiFloat === null ? [] : [frame.midiFloat])
  const frequencies = segment.flatMap((frame) => frame.frequencyHz === null ? [] : [frame.frequencyHz])
  if (pitches.length === 0 || frequencies.length === 0) return null

  const pitchMidi = Math.round(median(pitches))
  const averageFrequencyHz = median(frequencies)
  const confidence = segment.reduce((sum, frame) => sum + frame.confidence, 0) / segment.length
  const averageRms = segment.reduce((sum, frame) => sum + frame.rms, 0) / segment.length
  const centsDeviation = 1200 * Math.log2(averageFrequencyHz / midiToFrequency(pitchMidi))

  return {
    averageFrequencyHz,
    centsDeviation,
    confidence,
    endMs,
    note: {
      confidence,
      durationTicks: toDurationTicks(endMs - startMs, config.bpm),
      id: `detected-note-${index + 1}`,
      locked: false,
      origin: toNoteOrigin(source),
      phraseId: `phrase-${phraseIndex}`,
      pitchMidi,
      spelling: midiToSpelling(pitchMidi),
      startTick: toStartTick(startMs, config.bpm),
      velocity: Math.max(1, Math.min(127, Math.round(averageRms / .7 * 127))),
      voiceId: 'melody',
    },
    startMs,
    uncertain: confidence < config.uncertainConfidence,
  }
}

function segmentPitchFrames(frames: PitchFrame[], source: TranscriptionSource, config: TranscriptionConfig) {
  const notes: TranscribedNote[] = []
  let active: PitchFrame[] = []
  let pendingChange: PitchFrame[] = []
  let phraseIndex = 1
  let previousEndMs: number | null = null

  const appendActive = () => {
    const note = createTranscribedNote(active, notes.length, phraseIndex, source, config)
    if (note) {
      if (previousEndMs !== null && note.startMs - previousEndMs >= config.phraseBreakMs) phraseIndex += 1
      const updatedNote = note.note.phraseId === `phrase-${phraseIndex}` ? note : { ...note, note: { ...note.note, phraseId: `phrase-${phraseIndex}` } }
      notes.push(updatedNote)
      previousEndMs = updatedNote.endMs
    }
    active = []
    pendingChange = []
  }

  for (const frame of frames) {
    if (frame.midiFloat === null) {
      appendActive()
      continue
    }

    if (active.length === 0) {
      active = [frame]
      continue
    }

    const stablePitch = median(active.flatMap((candidate) => candidate.midiFloat === null ? [] : [candidate.midiFloat]))
    if (Math.abs(frame.midiFloat - stablePitch) < config.noteChangeToleranceSemitones) {
      active.push(...pendingChange, frame)
      pendingChange = []
      continue
    }

    pendingChange.push(frame)
    if (pendingChange.length >= config.noteChangePersistenceFrames) {
      const nextActive = pendingChange
      appendActive()
      active = nextActive
      pendingChange = []
    }
  }

  if (pendingChange.length > 0) active.push(...pendingChange)
  appendActive()
  return notes
}

export function transcribeMonophonicAudio(decodedAudio: DecodedAudio, source: TranscriptionSource, overrides: Partial<TranscriptionConfig> = {}): TranscriptionResult {
  const config = { ...defaultTranscriptionConfig, ...overrides }
  if (decodedAudio.durationMs > config.maximumDurationMs) throw new Error(`A transcrição local desta versão aceita até ${Math.round(config.maximumDurationMs / 1000)} segundos por análise.`)

  const rawFrames = analyzePitchFrames(decodedAudio.monoPcm, decodedAudio.sampleRate, config)
  const frames = smoothPitchFrames(rawFrames, config.smoothingWindowFrames)
  const notes = segmentPitchFrames(frames, source, config)
  const acceptedFrames = frames.filter((frame) => frame.midiFloat !== null).length
  const lowConfidenceFrames = frames.filter((frame) => frame.frequencyHz !== null && frame.midiFloat === null).length
  const warnings: string[] = []

  if (acceptedFrames === 0) warnings.push('Nenhuma altura confiável foi encontrada. Tente uma linha vocal monofônica, mais próxima do microfone e com menos ruído.')
  if (lowConfidenceFrames > acceptedFrames) warnings.push('Há muitos quadros de baixa confiança. Revise o resultado antes de qualquer uso musical.')
  if (notes.some((note) => note.uncertain)) warnings.push('Algumas notas têm confiança limitada e foram marcadas para revisão.')

  return {
    diagnostics: { acceptedFrames, analyzedFrames: frames.length, lowConfidenceFrames, warnings },
    frames,
    notes,
    tempoBpm: config.bpm,
  }
}
