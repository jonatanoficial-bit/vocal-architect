import type { PitchFrame, TranscriptionConfig } from './types'
export { midiToSpelling } from '../../music/pitch'

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function frameRms(frame: Float32Array) {
  let sum = 0
  for (const sample of frame) sum += sample ** 2
  return Math.sqrt(sum / frame.length)
}

function interpolateLag(values: Float64Array, lag: number) {
  if (lag <= 1 || lag >= values.length - 1) return lag
  const before = values[lag - 1]
  const current = values[lag]
  const after = values[lag + 1]
  const denominator = before - 2 * current + after
  if (Math.abs(denominator) < Number.EPSILON) return lag
  return lag + clamp(.5 * (before - after) / denominator, -.5, .5)
}

export function frequencyToMidi(frequencyHz: number) {
  return 69 + 12 * Math.log2(frequencyHz / 440)
}

export function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function resamplePcm(samples: Float32Array, sourceSampleRate: number, targetSampleRate: number) {
  if (samples.length === 0 || sourceSampleRate === targetSampleRate) return samples

  const targetLength = Math.max(1, Math.floor(samples.length * targetSampleRate / sourceSampleRate))
  const resampled = new Float32Array(targetLength)
  const ratio = sourceSampleRate / targetSampleRate

  for (let index = 0; index < targetLength; index += 1) {
    const sourcePosition = index * ratio
    const sourceIndex = Math.floor(sourcePosition)
    const nextIndex = Math.min(samples.length - 1, sourceIndex + 1)
    const interpolation = sourcePosition - sourceIndex
    resampled[index] = samples[sourceIndex] * (1 - interpolation) + samples[nextIndex] * interpolation
  }

  return resampled
}

export function estimateFundamentalFrequency(frame: Float32Array, sampleRate: number, config: Pick<TranscriptionConfig, 'maximumFrequencyHz' | 'minimumFrequencyHz' | 'minimumRms' | 'yinThreshold'>) {
  const rms = frameRms(frame)
  if (rms < config.minimumRms) return { confidence: 0, frequencyHz: null, rms }

  const minimumLag = Math.max(2, Math.floor(sampleRate / config.maximumFrequencyHz))
  const maximumLag = Math.min(Math.floor(sampleRate / config.minimumFrequencyHz), Math.floor(frame.length / 2))
  if (minimumLag >= maximumLag) return { confidence: 0, frequencyHz: null, rms }

  const difference = new Float64Array(maximumLag + 1)
  const normalizedDifference = new Float64Array(maximumLag + 1)
  let runningSum = 0

  for (let lag = 1; lag <= maximumLag; lag += 1) {
    let sum = 0
    for (let sample = 0; sample < frame.length - lag; sample += 1) {
      const delta = frame[sample] - frame[sample + lag]
      sum += delta * delta
    }
    difference[lag] = sum
    runningSum += sum
    normalizedDifference[lag] = runningSum === 0 ? 1 : sum * lag / runningSum
  }

  let selectedLag = -1
  for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
    if (normalizedDifference[lag] < config.yinThreshold && normalizedDifference[lag] <= normalizedDifference[Math.min(maximumLag, lag + 1)]) {
      selectedLag = lag
      break
    }
  }

  if (selectedLag === -1) {
    let bestValue = Number.POSITIVE_INFINITY
    for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
      if (normalizedDifference[lag] < bestValue) {
        bestValue = normalizedDifference[lag]
        selectedLag = lag
      }
    }
  }

  const confidence = clamp(1 - normalizedDifference[selectedLag], 0, 1)
  if (confidence <= 0) return { confidence, frequencyHz: null, rms }

  const interpolatedLag = interpolateLag(normalizedDifference, selectedLag)
  return { confidence, frequencyHz: sampleRate / interpolatedLag, rms }
}

export function analyzePitchFrames(samples: Float32Array, sampleRate: number, config: TranscriptionConfig): PitchFrame[] {
  const analysisSamples = resamplePcm(samples, sampleRate, config.targetSampleRate)
  const frameSize = 1024
  const hopSize = 256
  const frames: PitchFrame[] = []

  for (let start = 0; start + frameSize <= analysisSamples.length; start += hopSize) {
    const frame = analysisSamples.slice(start, start + frameSize)
    const estimate = estimateFundamentalFrequency(frame, config.targetSampleRate, config)
    const isConfident = estimate.frequencyHz !== null && estimate.confidence >= config.minimumConfidence
    frames.push({
      confidence: estimate.confidence,
      endMs: Math.round((start + frameSize) * 1000 / config.targetSampleRate),
      frequencyHz: estimate.frequencyHz,
      midiFloat: isConfident && estimate.frequencyHz !== null ? frequencyToMidi(estimate.frequencyHz) : null,
      rms: estimate.rms,
      startMs: Math.round(start * 1000 / config.targetSampleRate),
    })
  }

  return frames
}
