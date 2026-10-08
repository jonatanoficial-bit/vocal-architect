import { estimateFundamentalFrequency, frequencyToMidi, midiToSpelling } from '../../src/audio/transcription/pitch'
import { transcribeMonophonicAudio } from '../../src/audio/transcription/transcribe'
import { defaultTranscriptionConfig } from '../../src/audio/transcription/types'
import { describe, expect, it } from 'vitest'

const sampleRate = 8000

function silence(durationSeconds: number) {
  return new Float32Array(Math.round(durationSeconds * sampleRate))
}

function tone(frequencyHz: number, durationSeconds: number) {
  const samples = new Float32Array(Math.round(durationSeconds * sampleRate))
  for (let index = 0; index < samples.length; index += 1) samples[index] = .45 * Math.sin(2 * Math.PI * frequencyHz * index / sampleRate)
  return samples
}

function vibratoTone(durationSeconds: number) {
  const samples = new Float32Array(Math.round(durationSeconds * sampleRate))
  let phase = 0
  for (let index = 0; index < samples.length; index += 1) {
    const seconds = index / sampleRate
    const cents = 22 * Math.sin(2 * Math.PI * 5 * seconds)
    const frequency = 440 * 2 ** (cents / 1200)
    phase += 2 * Math.PI * frequency / sampleRate
    samples[index] = .45 * Math.sin(phase)
  }
  return samples
}

function concatenate(...parts: Float32Array[]) {
  const output = new Float32Array(parts.reduce((size, part) => size + part.length, 0))
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

function decoded(monoPcm: Float32Array) {
  return {
    channelCount: 1,
    decodedByteLength: monoPcm.byteLength,
    durationMs: Math.round(monoPcm.length * 1000 / sampleRate),
    monoPcm,
    sampleRate,
  }
}

describe('monophonic transcription', () => {
  it('estimates A4 with a high-confidence local YIN frame', () => {
    const estimate = estimateFundamentalFrequency(tone(440, .128), sampleRate, defaultTranscriptionConfig)

    expect(estimate.frequencyHz).not.toBeNull()
    expect(Math.abs((estimate.frequencyHz ?? 0) - 440)).toBeLessThan(1)
    expect(estimate.confidence).toBeGreaterThan(.9)
    expect(frequencyToMidi(estimate.frequencyHz ?? 0)).toBeCloseTo(69, 1)
    expect(midiToSpelling(69)).toBe('A4')
  })

  it('segments two sustained monophonic notes separated by a pause', () => {
    const pcm = concatenate(silence(.25), tone(440, .65), silence(.25), tone(523.25, .65), silence(.2))
    const result = transcribeMonophonicAudio(decoded(pcm), 'imported')

    expect(result.notes).toHaveLength(2)
    expect(result.notes.map((entry) => entry.note.pitchMidi)).toEqual([69, 72])
    expect(result.notes.every((entry) => entry.note.durationTicks > 0 && entry.note.startTick >= 0)).toBe(true)
    expect(result.diagnostics.acceptedFrames).toBeGreaterThan(0)
  })

  it('requires a persistent pitch change before creating the next note', () => {
    const result = transcribeMonophonicAudio(decoded(concatenate(tone(440, .6), tone(523.25, .6))), 'recorded')

    expect(result.notes.map((entry) => entry.note.pitchMidi)).toEqual([69, 72])
  })

  it('keeps moderate vibrato as one sustained note instead of a sequence of semitones', () => {
    const result = transcribeMonophonicAudio(decoded(concatenate(silence(.2), vibratoTone(.9), silence(.2))), 'recorded')

    expect(result.notes).toHaveLength(1)
    expect(result.notes[0].note.pitchMidi).toBe(69)
  })
})
