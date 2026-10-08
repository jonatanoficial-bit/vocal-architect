import type { AudioLevel } from './types'

const clippingThreshold = 0.98

export function calculateAudioLevel(samples: Uint8Array): AudioLevel {
  if (samples.length === 0) return { level: 0, clipping: false }

  let energy = 0
  let clipping = false

  for (const sample of samples) {
    const normalizedSample = (sample - 128) / 128
    energy += normalizedSample ** 2
    clipping ||= Math.abs(normalizedSample) >= clippingThreshold
  }

  return { level: Math.min(1, Math.sqrt(energy / samples.length)), clipping }
}
