import { analyseEnergy, createAudioAnalysis, createWaveform, detectSilenceRegions, downmixToMono } from '../../src/audio/processing/analysis'
import { validateAudioBlob, validateDecodedAudio } from '../../src/audio/processing/validation'
import { describe, expect, it } from 'vitest'

describe('audio processing utilities', () => {
  it('downmixes channels into PCM mono without mutating the original channel data', () => {
    const left = new Float32Array([0, 1, -.5])
    const right = new Float32Array([0, -.5, .5])
    const decoded = downmixToMono({
      duration: .003,
      getChannelData: (channel) => channel === 0 ? left : right,
      length: 3,
      numberOfChannels: 2,
      sampleRate: 1000,
    })

    expect(Array.from(decoded.monoPcm)).toEqual([0, .25, 0])
    expect(decoded.decodedByteLength).toBe(24)
    expect(Array.from(left)).toEqual([0, 1, -.5])
  })

  it('creates actual waveform peaks and only keeps sustained silence regions', () => {
    const samples = new Float32Array(1000)
    samples.fill(.5, 400, 800)
    const energy = analyseEnergy(samples, 1000, 100)

    expect(detectSilenceRegions(energy, 300)).toEqual([{ startMs: 0, endMs: 400 }])
    const waveform = createWaveform(new Float32Array([-.6, .7, -.2, .2]), 2)
    expect(waveform[0].min).toBeCloseTo(-.6)
    expect(waveform[0].max).toBeCloseTo(.7)
    expect(waveform[1].min).toBeCloseTo(-.2)
    expect(waveform[1].max).toBeCloseTo(.2)

    const analysis = createAudioAnalysis({ channelCount: 1, decodedByteLength: 4000, durationMs: 1000, monoPcm: samples, sampleRate: 1000 })
    expect(analysis.silenceRegions).toEqual([{ startMs: 0, endMs: 400 }])
    expect(analysis.energyFrames).toHaveLength(50)
  })

  it('rejects invalid and unsafe inputs before they enter the decoder', () => {
    expect(validateAudioBlob(new Blob(['not audio'], { type: 'text/plain' }), 'notes.txt')).toMatch(/arquivo de áudio compatível/i)
    expect(validateAudioBlob(new Blob([], { type: 'audio/wav' }), 'voice.wav')).toMatch(/arquivo está vazio/i)
    expect(validateDecodedAudio({ decodedBytes: 0, durationMs: 0 })).toMatch(/duração válida/i)
    expect(validateDecodedAudio({ decodedBytes: 97 * 1024 * 1024, durationMs: 1000 })).toMatch(/memória segura/i)
  })
})
