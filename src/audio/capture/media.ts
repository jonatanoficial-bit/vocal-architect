import type { RecorderSupport } from './types'

const audioConstraints: MediaTrackConstraints = {
  autoGainControl: { ideal: false },
  channelCount: { ideal: 1 },
  echoCancellation: { ideal: false },
  noiseSuppression: { ideal: false },
}

export const audioMimeCandidates = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
] as const

export function selectSupportedAudioMimeType(isSupported: (mimeType: string) => boolean): string | undefined {
  return audioMimeCandidates.find((mimeType) => isSupported(mimeType))
}

export function getPreferredAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return undefined
  return selectSupportedAudioMimeType((mimeType) => MediaRecorder.isTypeSupported(mimeType))
}

export function getRecorderSupport(): RecorderSupport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { available: false, message: 'A compatibilidade de gravação não está disponível neste ambiente.' }
  }

  if (!window.isSecureContext) {
    return { available: false, message: 'A captura exige uma conexão segura (HTTPS ou localhost).' }
  }

  if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
    return { available: false, message: 'Este navegador não oferece acesso ao microfone.' }
  }

  if (typeof MediaRecorder === 'undefined') {
    return { available: false, message: 'Este navegador não oferece o gravador de áudio necessário.' }
  }

  return { available: true, message: 'Pronto para solicitar acesso ao microfone quando você iniciar uma gravação.' }
}

export function requestMicrophone(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false })
}

export function releaseMicrophone(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}
