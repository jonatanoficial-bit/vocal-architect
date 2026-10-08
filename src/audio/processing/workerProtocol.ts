import type { AudioAnalysis } from './types'

export interface AnalyseAudioWorkerRequest {
  channelCount: number
  monoPcm: ArrayBuffer
  sampleRate: number
  type: 'analyse-audio'
}

export interface AnalyseAudioWorkerResult {
  analysis: AudioAnalysis
  type: 'analysis-complete'
}

export interface AnalyseAudioWorkerFailure {
  message: string
  type: 'analysis-failed'
}

export type AudioWorkerResponse = AnalyseAudioWorkerResult | AnalyseAudioWorkerFailure
