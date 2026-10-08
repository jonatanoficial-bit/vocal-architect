import { downmixToMono } from './analysis'
import type { DecodedAudio } from './types'

type LegacyAudioContextWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

function getAudioContextConstructor() {
  if (typeof window === 'undefined') return undefined
  return window.AudioContext ?? (window as LegacyAudioContextWindow).webkitAudioContext
}

export async function decodeAudioBlob(blob: Blob): Promise<DecodedAudio> {
  const AudioContextConstructor = getAudioContextConstructor()
  if (!AudioContextConstructor) throw new Error('Seu navegador não oferece decodificação de áudio para processamento local.')

  const context = new AudioContextConstructor()
  try {
    const encodedAudio = await blob.arrayBuffer()
    const decodedAudio = await context.decodeAudioData(encodedAudio)
    return downmixToMono(decodedAudio)
  } finally {
    await context.close().catch(() => undefined)
  }
}
