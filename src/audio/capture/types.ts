export type RecorderStatus = 'idle' | 'requesting-permission' | 'recording' | 'paused' | 'stopping' | 'ready' | 'error'

export interface AudioLevel {
  level: number
  clipping: boolean
}

export interface CapturedRecording {
  id: string
  name: string
  blob: Blob
  objectUrl: string
  mimeType: string
  durationMs: number
  capturedAt: string
}

export interface RecorderSupport {
  available: boolean
  message: string
}
