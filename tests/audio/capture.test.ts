import { microphoneErrorMessage } from '../../src/audio/capture/errors'
import { formatDuration, normalizeRecordingName } from '../../src/audio/capture/format'
import { calculateAudioLevel } from '../../src/audio/capture/level'
import { selectSupportedAudioMimeType } from '../../src/audio/capture/media'
import { describe, expect, it } from 'vitest'

describe('audio capture utilities', () => {
  it('reports silence and clipping from real analyser samples', () => {
    expect(calculateAudioLevel(new Uint8Array([128, 128, 128]))).toEqual({ level: 0, clipping: false })

    const clipped = calculateAudioLevel(new Uint8Array([128, 255]))
    expect(clipped.level).toBeGreaterThan(0.7)
    expect(clipped.clipping).toBe(true)
  })

  it('selects only a mime type supported by the current browser', () => {
    expect(selectSupportedAudioMimeType((mimeType) => mimeType === 'audio/mp4')).toBe('audio/mp4')
    expect(selectSupportedAudioMimeType(() => false)).toBeUndefined()
  })

  it('formats recording metadata for the interface', () => {
    expect(formatDuration(65_900)).toBe('01:05')
    expect(normalizeRecordingName('  Voz    principal  ')).toBe('Voz principal')
  })

  it('explains a denied microphone permission without exposing browser internals', () => {
    expect(microphoneErrorMessage({ name: 'NotAllowedError' })).toMatch(/acesso ao microfone foi negado/i)
  })
})
