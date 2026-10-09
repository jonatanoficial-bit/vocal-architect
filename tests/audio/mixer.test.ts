import { audibleVoices, createVoiceMixer, effectiveVoiceGain, mixerForPracticePreset, updateVoiceMix } from '../../src/audio/playback/mixer'
import { describe, expect, it } from 'vitest'

describe('SATB practice mixer', () => {
  it('keeps every voice audible by default and honours mute without a solo', () => {
    const mixer = updateVoiceMix(createVoiceMixer(), 'tenor', { muted: true })

    expect(audibleVoices(mixer)).toEqual(['soprano', 'alto', 'bass'])
    expect(effectiveVoiceGain(mixer, 'tenor')).toBe(0)
  })

  it('gives solo priority over every mute state', () => {
    const mixer = updateVoiceMix(updateVoiceMix(createVoiceMixer(), 'bass', { muted: true }), 'alto', { solo: true })

    expect(audibleVoices(mixer)).toEqual(['alto'])
    expect(effectiveVoiceGain(mixer, 'soprano')).toBe(0)
    expect(effectiveVoiceGain(mixer, 'alto')).toBeGreaterThan(0)
  })

  it('creates isolated and highlighted study presets for the selected voice', () => {
    const isolated = mixerForPracticePreset('isolated', 'tenor')
    const highlighted = mixerForPracticePreset('highlight', 'tenor')

    expect(audibleVoices(isolated)).toEqual(['tenor'])
    expect(highlighted.tenor.volume).toBeGreaterThan(highlighted.soprano.volume)
  })

  it('clamps manual volume and panning values to safe mixer limits', () => {
    const mixer = updateVoiceMix(createVoiceMixer(), 'soprano', { pan: 3, volume: -1 })

    expect(mixer.soprano).toMatchObject({ pan: 1, volume: 0 })
  })
})
