import type { VoiceName } from '../../music/satb'

export const mixerVoices: VoiceName[] = ['soprano', 'alto', 'tenor', 'bass']

export type PracticePreset = 'ensemble' | 'highlight' | 'isolated'

export type VoiceMix = {
  muted: boolean
  pan: number
  solo: boolean
  volume: number
}

export type VoiceMixer = Record<VoiceName, VoiceMix>

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

export function createVoiceMixer(): VoiceMixer {
  return Object.fromEntries(mixerVoices.map((voice) => [voice, { muted: false, pan: 0, solo: false, volume: 0.72 }])) as VoiceMixer
}

export function updateVoiceMix(mixer: VoiceMixer, voice: VoiceName, patch: Partial<VoiceMix>): VoiceMixer {
  const current = mixer[voice]
  return {
    ...mixer,
    [voice]: {
      ...current,
      ...patch,
      pan: clamp(patch.pan ?? current.pan, -1, 1),
      volume: clamp(patch.volume ?? current.volume, 0, 1),
    },
  }
}

export function audibleVoices(mixer: VoiceMixer) {
  const soloed = mixerVoices.filter((voice) => mixer[voice].solo)
  return mixerVoices.filter((voice) => (soloed.length > 0 ? soloed.includes(voice) : !mixer[voice].muted))
}

export function effectiveVoiceGain(mixer: VoiceMixer, voice: VoiceName) {
  return audibleVoices(mixer).includes(voice) ? mixer[voice].volume : 0
}

export function mixerForPracticePreset(preset: PracticePreset, focusVoice: VoiceName): VoiceMixer {
  const mixer = createVoiceMixer()
  if (preset === 'isolated') return Object.fromEntries(mixerVoices.map((voice) => [voice, { ...mixer[voice], muted: voice !== focusVoice, volume: voice === focusVoice ? 0.9 : mixer[voice].volume }])) as VoiceMixer
  if (preset === 'highlight') return Object.fromEntries(mixerVoices.map((voice) => [voice, { ...mixer[voice], volume: voice === focusVoice ? 0.9 : 0.22 }])) as VoiceMixer
  return mixer
}
