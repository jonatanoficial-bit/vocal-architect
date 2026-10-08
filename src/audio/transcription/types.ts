import type { NoteEvent, NoteOrigin } from '../../music/types'

export interface PitchFrame {
  confidence: number
  endMs: number
  frequencyHz: number | null
  midiFloat: number | null
  rms: number
  startMs: number
}

export interface TranscribedNote {
  averageFrequencyHz: number
  centsDeviation: number
  confidence: number
  endMs: number
  note: NoteEvent
  startMs: number
  uncertain: boolean
}

export interface TranscriptionDiagnostics {
  acceptedFrames: number
  analyzedFrames: number
  lowConfidenceFrames: number
  warnings: string[]
}

export interface TranscriptionResult {
  diagnostics: TranscriptionDiagnostics
  frames: PitchFrame[]
  notes: TranscribedNote[]
  tempoBpm: number
}

export type TranscriptionStatus = 'idle' | 'transcribing' | 'ready' | 'error'

export interface TranscriptionConfig {
  bpm: number
  maximumDurationMs: number
  maximumFrequencyHz: number
  minimumConfidence: number
  minimumFrequencyHz: number
  minimumNoteDurationMs: number
  minimumRms: number
  noteChangePersistenceFrames: number
  noteChangeToleranceSemitones: number
  phraseBreakMs: number
  smoothingWindowFrames: number
  targetSampleRate: number
  uncertainConfidence: number
  yinThreshold: number
}

export const defaultTranscriptionConfig: TranscriptionConfig = {
  bpm: 120,
  maximumDurationMs: 90_000,
  maximumFrequencyHz: 1000,
  minimumConfidence: .72,
  minimumFrequencyHz: 80,
  minimumNoteDurationMs: 120,
  minimumRms: .015,
  noteChangePersistenceFrames: 5,
  noteChangeToleranceSemitones: .75,
  phraseBreakMs: 300,
  smoothingWindowFrames: 3,
  targetSampleRate: 8000,
  uncertainConfidence: .85,
  yinThreshold: .15,
}

export type TranscriptionSource = Extract<NoteOrigin, 'imported' | 'recorded'>
