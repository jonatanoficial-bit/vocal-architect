export type AudioSourceKind = 'imported' | 'recorded'

export interface AudioAsset {
  id: string
  name: string
  objectUrl: string
  mimeType: string
  sizeBytes: number
  source: AudioSourceKind
}

export interface DecodedAudio {
  channelCount: number
  decodedByteLength: number
  durationMs: number
  monoPcm: Float32Array
  sampleRate: number
}

export interface WaveformPeak {
  max: number
  min: number
}

export interface EnergyFrame {
  endMs: number
  isSilent: boolean
  peak: number
  rms: number
  startMs: number
}

export interface SilenceRegion {
  endMs: number
  startMs: number
}

export interface AudioAnalysis {
  averageRms: number
  channelCount: number
  durationMs: number
  energyFrames: EnergyFrame[]
  monoSampleCount: number
  peak: number
  sampleRate: number
  silenceRegions: SilenceRegion[]
  waveform: WaveformPeak[]
}

export type AudioProcessingStatus = 'idle' | 'validating' | 'decoding' | 'analysing' | 'ready' | 'error'

export interface AudioBufferLike {
  duration: number
  getChannelData(channel: number): Float32Array
  length: number
  numberOfChannels: number
  sampleRate: number
}
