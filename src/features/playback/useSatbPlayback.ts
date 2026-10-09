import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { audibleVoices, createVoiceMixer, effectiveVoiceGain, mixerForPracticePreset, mixerVoices, type PracticePreset, type VoiceMixer } from '../../audio/playback/mixer'
import { arrangementEndTick, clampPlaybackTick, defaultPlaybackTempoBpm, normalizePlaybackRange, playbackEventsFrom, playbackPositionInRange, ticksToSeconds, type PlaybackRange } from '../../audio/playback/timing'
import type { VoiceName } from '../../music/satb'
import type { VocalPart } from '../../music/types'

export type PlaybackStatus = 'idle' | 'paused' | 'playing'

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
type ScheduledRun = { animationFrame: number; finishTimer: number; startTick: number; startTime: number; oscillators: OscillatorNode[]; range: PlaybackRange }
type VoiceAudioNodes = { gain: GainNode; panner: StereoPannerNode | null }

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

function audioContextConstructor() {
  if (typeof window === 'undefined') return null
  return window.AudioContext ?? (window as AudioWindow).webkitAudioContext ?? null
}

function stereoPanningSupported() {
  const Constructor = audioContextConstructor()
  return Boolean(Constructor && typeof Constructor.prototype.createStereoPanner === 'function')
}

function activeVoicesAt(parts: VocalPart[], tick: number, audible: Set<VoiceName>) {
  return parts.filter((part) => audible.has(part.id as VoiceName) && part.notes.some((note) => note.startTick <= tick && tick < note.startTick + note.durationTicks)).map((part) => part.id as VoiceName)
}

export function useSatbPlayback(parts: VocalPart[]) {
  const endTick = useMemo(() => arrangementEndTick(parts), [parts])
  const [activeVoices, setActiveVoices] = useState<VoiceName[]>([])
  const [error, setError] = useState<string | null>(null)
  const [focusVoice, setFocusVoice] = useState<VoiceName>('soprano')
  const [isSlowPractice, setIsSlowPractice] = useState(false)
  const [loop, setLoopState] = useState(false)
  const [loopRange, setLoopRangeState] = useState<PlaybackRange>(() => normalizePlaybackRange(0, endTick, endTick))
  const [mixer, setMixerState] = useState<VoiceMixer>(createVoiceMixer)
  const [positionTick, setPositionTick] = useState(0)
  const [practicePreset, setPracticePresetState] = useState<PracticePreset | 'custom'>('ensemble')
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [tempoBpm, setTempoBpmState] = useState(defaultPlaybackTempoBpm)
  const contextRef = useRef<AudioContext | null>(null)
  const loopRangeRef = useRef(loopRange)
  const loopRef = useRef(loop)
  const mixerRef = useRef<VoiceMixer>(createVoiceMixer())
  const nodesRef = useRef<Partial<Record<VoiceName, VoiceAudioNodes>>>({})
  const positionRef = useRef(positionTick)
  const runRef = useRef<ScheduledRun | null>(null)
  const slowTempoRestoreRef = useRef<number | null>(null)
  const startRef = useRef<((requestedTick: number) => Promise<boolean>) | null>(null)
  const statusRef = useRef<PlaybackStatus>(status)
  const tempoRef = useRef(tempoBpm)

  const setPosition = useCallback((next: number) => {
    positionRef.current = clampPlaybackTick(next, endTick)
    setPositionTick(positionRef.current)
  }, [endTick])

  const setPlaybackStatus = useCallback((next: PlaybackStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  const applyMixerToAudio = useCallback((nextMixer: VoiceMixer, context = contextRef.current) => {
    if (!context) return
    const audible = new Set(audibleVoices(nextMixer))
    for (const voice of mixerVoices) {
      const nodes = nodesRef.current[voice]
      if (!nodes) continue
      nodes.gain.gain.setTargetAtTime(audible.has(voice) ? effectiveVoiceGain(nextMixer, voice) : 0, context.currentTime, 0.012)
      if (nodes.panner) nodes.panner.pan.setTargetAtTime(nextMixer[voice].pan, context.currentTime, 0.012)
    }
  }, [])

  const commitMixer = useCallback((nextMixer: VoiceMixer, nextPreset: PracticePreset | 'custom' = 'custom') => {
    mixerRef.current = nextMixer
    setMixerState(nextMixer)
    setPracticePresetState(nextPreset)
    applyMixerToAudio(nextMixer)
  }, [applyMixerToAudio])

  const clearRun = useCallback(() => {
    const run = runRef.current
    if (!run) return
    window.clearTimeout(run.finishTimer)
    window.cancelAnimationFrame(run.animationFrame)
    for (const oscillator of run.oscillators) {
      try { oscillator.stop() } catch { /* The oscillator may have ended naturally. */ }
      oscillator.disconnect()
    }
    runRef.current = null
    setActiveVoices([])
  }, [])

  const ensureContext = useCallback(async () => {
    if (contextRef.current) return contextRef.current
    const Constructor = audioContextConstructor()
    if (!Constructor) return null
    const context = new Constructor()
    const master = context.createGain()
    master.gain.value = 0.32
    master.connect(context.destination)
    for (const voice of mixerVoices) {
      const gain = context.createGain()
      const panner = typeof context.createStereoPanner === 'function' ? context.createStereoPanner() : null
      if (panner) {
        gain.connect(panner)
        panner.connect(master)
      } else gain.connect(master)
      nodesRef.current[voice] = { gain, panner }
    }
    contextRef.current = context
    applyMixerToAudio(mixerRef.current, context)
    return context
  }, [applyMixerToAudio])

  const schedulePianoTone = useCallback((context: AudioContext, voice: VoiceName, midi: number, startTime: number, duration: number, oscillators: OscillatorNode[]) => {
    const destination = nodesRef.current[voice]?.gain
    if (!destination || duration <= 0.002) return
    const amplitude = Math.max(0.03, Math.min(0.16, 0.045 + duration * 0.025))
    for (const [type, multiple, level] of [['triangle', 1, 1], ['sine', 2, 0.24]] as const) {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const releaseStart = Math.max(startTime + 0.025, startTime + duration - 0.045)
      oscillator.type = type
      oscillator.frequency.setValueAtTime(midiToFrequency(midi) * multiple, startTime)
      envelope.gain.setValueAtTime(0.0001, startTime)
      envelope.gain.exponentialRampToValueAtTime(amplitude * level, startTime + 0.012)
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, amplitude * level * 0.38), releaseStart)
      envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
      oscillator.connect(envelope)
      envelope.connect(destination)
      oscillator.start(startTime)
      oscillator.stop(startTime + duration + 0.03)
      oscillators.push(oscillator)
    }
  }, [])

  const start = useCallback(async (requestedTick: number) => {
    let context: AudioContext | null
    try { context = await ensureContext() } catch { setError('Não foi possível iniciar o instrumento virtual neste navegador.'); return false }
    if (!context || endTick === 0) return false
    try { await context.resume() } catch { setError('O navegador bloqueou a reprodução. Toque em Reproduzir novamente para autorizar o áudio.'); return false }
    setError(null)
    clearRun()
    const range = loopRef.current ? loopRangeRef.current : normalizePlaybackRange(0, endTick, endTick)
    const requested = clampPlaybackTick(requestedTick, range.endTick)
    const startTick = requested >= range.endTick ? range.startTick : Math.max(range.startTick, requested)
    const startTime = context.currentTime + 0.045
    const oscillators: OscillatorNode[] = []
    for (const event of playbackEventsFrom(parts, startTick, tempoRef.current, range.endTick)) {
      const voice = event.voiceId as VoiceName
      if (mixerVoices.includes(voice)) schedulePianoTone(context, voice, event.note.pitchMidi, startTime + event.startOffsetSeconds, event.durationSeconds, oscillators)
    }
    setPosition(startTick)
    setPlaybackStatus('playing')
    const refreshPosition = () => {
      if (statusRef.current !== 'playing' || !runRef.current || contextRef.current !== context) return
      const currentTick = playbackPositionInRange(range, startTick, startTime, context.currentTime, tempoRef.current, loopRef.current)
      setPosition(currentTick)
      setActiveVoices(activeVoicesAt(parts, currentTick, new Set(audibleVoices(mixerRef.current))))
      runRef.current.animationFrame = window.requestAnimationFrame(refreshPosition)
    }
    const finishDelay = Math.max(1, Math.ceil((0.045 + ticksToSeconds(range.endTick - startTick, tempoRef.current)) * 1000))
    const finishTimer = window.setTimeout(() => {
      if (loopRef.current) { void startRef.current?.(loopRangeRef.current.startTick); return }
      clearRun()
      setPosition(range.endTick)
      setPlaybackStatus('idle')
    }, finishDelay)
    runRef.current = { animationFrame: window.requestAnimationFrame(refreshPosition), finishTimer, oscillators, range, startTick, startTime }
    return true
  }, [clearRun, endTick, ensureContext, parts, schedulePianoTone, setPlaybackStatus, setPosition])

  useEffect(() => {
    startRef.current = start
  }, [start])

  useEffect(() => {
    const nextRange = normalizePlaybackRange(loopRangeRef.current.startTick, loopRangeRef.current.endTick, endTick)
    loopRangeRef.current = nextRange
    setLoopRangeState(nextRange)
    if (positionRef.current > endTick) setPosition(endTick)
  }, [endTick, setPosition])

  const pause = useCallback(() => {
    const context = contextRef.current
    const run = runRef.current
    if (!context || !run || statusRef.current !== 'playing') return
    setPosition(playbackPositionInRange(run.range, run.startTick, run.startTime, context.currentTime, tempoRef.current, loopRef.current))
    clearRun()
    setPlaybackStatus('paused')
  }, [clearRun, setPlaybackStatus, setPosition])

  const stop = useCallback(() => {
    clearRun()
    setPosition(0)
    setPlaybackStatus('idle')
  }, [clearRun, setPlaybackStatus, setPosition])

  const seek = useCallback((tick: number) => {
    const range = loopRef.current ? loopRangeRef.current : normalizePlaybackRange(0, endTick, endTick)
    const next = Math.max(range.startTick, clampPlaybackTick(tick, range.endTick))
    if (statusRef.current === 'playing') void start(next)
    else setPosition(next)
  }, [endTick, setPosition, start])

  const restart = useCallback(() => { void start(loopRef.current ? loopRangeRef.current.startTick : 0) }, [start])

  const setLoop = useCallback((enabled: boolean) => {
    loopRef.current = enabled
    setLoopState(enabled)
    if (statusRef.current === 'playing') void start(positionRef.current)
  }, [start])

  const setLoopRange = useCallback((startTick: number, endTickValue: number) => {
    const next = normalizePlaybackRange(startTick, endTickValue, endTick)
    loopRangeRef.current = next
    setLoopRangeState(next)
    if (loopRef.current && statusRef.current === 'playing') void start(positionRef.current)
  }, [endTick, start])

  const resetLoopRange = useCallback(() => setLoopRange(0, endTick), [endTick, setLoopRange])

  const applyTempo = useCallback((value: number) => {
    const next = Math.max(40, Math.min(220, Math.round(value)))
    const context = contextRef.current
    const run = runRef.current
    const current = context && run ? playbackPositionInRange(run.range, run.startTick, run.startTime, context.currentTime, tempoRef.current, loopRef.current) : positionRef.current
    tempoRef.current = next
    setTempoBpmState(next)
    if (statusRef.current === 'playing') void start(current)
  }, [start])

  const setTempoBpm = useCallback((value: number) => {
    slowTempoRestoreRef.current = null
    setIsSlowPractice(false)
    applyTempo(value)
  }, [applyTempo])

  const toggleSlowPractice = useCallback(() => {
    if (slowTempoRestoreRef.current === null) {
      slowTempoRestoreRef.current = tempoRef.current
      setIsSlowPractice(true)
      applyTempo(Math.max(40, Math.round(tempoRef.current * 0.72)))
      return
    }
    const restored = slowTempoRestoreRef.current
    slowTempoRestoreRef.current = null
    setIsSlowPractice(false)
    applyTempo(restored)
  }, [applyTempo])

  const updateMix = useCallback((voice: VoiceName, patch: Partial<VoiceMixer[VoiceName]>) => {
    const current = mixerRef.current
    const next: VoiceMixer = { ...current, [voice]: { ...current[voice], ...patch, pan: Math.max(-1, Math.min(1, patch.pan ?? current[voice].pan)), volume: Math.max(0, Math.min(1, patch.volume ?? current[voice].volume)) } }
    commitMixer(next)
  }, [commitMixer])

  const applyPracticePreset = useCallback((preset: PracticePreset) => {
    commitMixer(mixerForPracticePreset(preset, focusVoice), preset)
  }, [commitMixer, focusVoice])

  const chooseFocusVoice = useCallback((voice: VoiceName) => {
    setFocusVoice(voice)
    if (practicePreset !== 'custom') commitMixer(mixerForPracticePreset(practicePreset, voice), practicePreset)
  }, [commitMixer, practicePreset])

  useEffect(() => () => {
    clearRun()
    const context = contextRef.current
    contextRef.current = null
    if (context && context.state !== 'closed') void context.close()
  }, [clearRun])

  return {
    activeVoices,
    applyPracticePreset,
    endTick,
    error,
    focusVoice,
    isSlowPractice,
    isSupported: audioContextConstructor() !== null,
    isStereoPanSupported: stereoPanningSupported(),
    loop,
    loopRange,
    mixer,
    pause,
    play: () => { void start(positionRef.current) },
    positionTick,
    practicePreset,
    resetLoopRange,
    restart,
    seek,
    setFocusVoice: chooseFocusVoice,
    setLoop,
    setLoopRange,
    setTempoBpm,
    status,
    stop,
    tempoBpm,
    toggleMute: (voice: VoiceName) => updateMix(voice, { muted: !mixerRef.current[voice].muted }),
    toggleSlowPractice,
    toggleSolo: (voice: VoiceName) => updateMix(voice, { solo: !mixerRef.current[voice].solo }),
    updatePan: (voice: VoiceName, pan: number) => updateMix(voice, { pan }),
    updateVolume: (voice: VoiceName, volume: number) => updateMix(voice, { volume }),
  }
}
