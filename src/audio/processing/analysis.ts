import type { AudioAnalysis, AudioBufferLike, DecodedAudio, EnergyFrame, SilenceRegion, WaveformPeak } from './types'

const defaultFrameDurationMs = 20
const defaultSilenceThreshold = 0.01
const minimumSilenceDurationMs = 300

export function downmixToMono(audioBuffer: AudioBufferLike): DecodedAudio {
  const monoPcm = new Float32Array(audioBuffer.length)

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel)
    for (let sample = 0; sample < audioBuffer.length; sample += 1) monoPcm[sample] += channelData[sample] / audioBuffer.numberOfChannels
  }

  return {
    channelCount: audioBuffer.numberOfChannels,
    decodedByteLength: audioBuffer.length * audioBuffer.numberOfChannels * Float32Array.BYTES_PER_ELEMENT,
    durationMs: Math.round(audioBuffer.duration * 1000),
    monoPcm,
    sampleRate: audioBuffer.sampleRate,
  }
}

export function createWaveform(samples: Float32Array, requestedBuckets = 180): WaveformPeak[] {
  if (samples.length === 0) return []

  const bucketCount = Math.min(requestedBuckets, samples.length)
  const samplesPerBucket = samples.length / bucketCount

  return Array.from({ length: bucketCount }, (_, bucketIndex) => {
    const start = Math.floor(bucketIndex * samplesPerBucket)
    const end = Math.max(start + 1, Math.floor((bucketIndex + 1) * samplesPerBucket))
    let min = 1
    let max = -1

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      const sample = samples[sampleIndex]
      min = Math.min(min, sample)
      max = Math.max(max, sample)
    }

    return { min, max }
  })
}

function calculateRms(samples: Float32Array, start: number, end: number) {
  let energy = 0
  for (let index = start; index < end; index += 1) energy += samples[index] ** 2
  return Math.sqrt(energy / Math.max(1, end - start))
}

function calculatePeak(samples: Float32Array, start: number, end: number) {
  let peak = 0
  for (let index = start; index < end; index += 1) peak = Math.max(peak, Math.abs(samples[index]))
  return peak
}

export function analyseEnergy(samples: Float32Array, sampleRate: number, frameDurationMs = defaultFrameDurationMs, silenceThreshold = defaultSilenceThreshold): EnergyFrame[] {
  if (samples.length === 0 || sampleRate <= 0) return []

  const samplesPerFrame = Math.max(1, Math.round((sampleRate * frameDurationMs) / 1000))
  const frames: EnergyFrame[] = []

  for (let start = 0; start < samples.length; start += samplesPerFrame) {
    const end = Math.min(samples.length, start + samplesPerFrame)
    const rms = calculateRms(samples, start, end)
    frames.push({
      startMs: Math.round((start / sampleRate) * 1000),
      endMs: Math.round((end / sampleRate) * 1000),
      rms,
      peak: calculatePeak(samples, start, end),
      isSilent: rms < silenceThreshold,
    })
  }

  return frames
}

export function detectSilenceRegions(frames: EnergyFrame[], minimumDurationMs = minimumSilenceDurationMs): SilenceRegion[] {
  const regions: SilenceRegion[] = []
  let startMs: number | null = null

  for (const frame of frames) {
    if (frame.isSilent && startMs === null) startMs = frame.startMs
    if (!frame.isSilent && startMs !== null) {
      if (frame.startMs - startMs >= minimumDurationMs) regions.push({ startMs, endMs: frame.startMs })
      startMs = null
    }
  }

  if (startMs !== null && frames.length > 0) {
    const endMs = frames.at(-1)?.endMs ?? startMs
    if (endMs - startMs >= minimumDurationMs) regions.push({ startMs, endMs })
  }

  return regions
}

export function createAudioAnalysis(decodedAudio: DecodedAudio): AudioAnalysis {
  const energyFrames = analyseEnergy(decodedAudio.monoPcm, decodedAudio.sampleRate)
  const averageRms = energyFrames.reduce((sum, frame) => sum + frame.rms, 0) / Math.max(1, energyFrames.length)
  const peak = energyFrames.reduce((currentPeak, frame) => Math.max(currentPeak, frame.peak), 0)

  return {
    averageRms,
    channelCount: decodedAudio.channelCount,
    durationMs: decodedAudio.durationMs,
    energyFrames,
    monoSampleCount: decodedAudio.monoPcm.length,
    peak,
    sampleRate: decodedAudio.sampleRate,
    silenceRegions: detectSilenceRegions(energyFrames),
    waveform: createWaveform(decodedAudio.monoPcm),
  }
}
