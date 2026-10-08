export type NoteOrigin = 'recorded' | 'imported' | 'generated' | 'edited'

export interface NoteEvent {
  id: string
  pitchMidi: number
  spelling: string
  startTick: number
  durationTicks: number
  velocity: number
  voiceId: string
  phraseId?: string
  origin: NoteOrigin
  confidence?: number
  locked: boolean
}

export interface VocalPart {
  id: string
  name: string
  role: string
  notes: NoteEvent[]
  rangeMinimumMidi: number
  rangeMaximumMidi: number
  comfortableMinimumMidi: number
  comfortableMaximumMidi: number
}

export const PPQ = 960
