import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { arrangementEndTick, clampPlaybackTick, defaultPlaybackTempoBpm, playbackEventsFrom, playbackPositionTick, ticksToSeconds } from '../../audio/playback/timing'
import type { VoiceName } from '../../music/satb'
import type { VocalPart } from '../../music/types'

export type PlaybackStatus = 'idle' | 'paused' | 'playing'

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
type ScheduledRun = { animationFrame: number; finishTimer: number; startTick: number; startTime: number; oscillators: OscillatorNode[] }

const voices: VoiceName[] = ['soprano', 'alto', 'tenor', 'bass']

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

function audioContextConstructor() {
  if (typeof window === 'undefined') return null
  return window.AudioContext ?? (window as AudioWindow).webkitAudioContext ?? null
}

function activeVoicesAt(parts: VocalPart[], tick: number, audible: Set<VoiceName>) {
  return parts.filter((part) => audible.has(part.id as VoiceName) && part.notes.some((note) => note.startTick <= tick && tick < note.startTick + note.durationTicks)).map((part) => part.id as VoiceName)
}

export function useSatbPlayback(parts: VocalPart[]) {
  const endTick = useMemo(() => arrangementEndTick(parts), [parts])
  const [activeVoices, setActiveVoices] = useState<VoiceName[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loop, setLoopState] = useState(false)
  const [positionTick, setPositionTick] = useState(0)
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [tempoBpm, setTempoBpmState] = useState(defaultPlaybackTempoBpm)
  const [voiceSelection, setVoiceSelectionState] = useState<VoiceName[]>(voices)
  const contextRef = useRef<AudioContext | null>(null)
  const gainsRef = useRef<Partial<Record<VoiceName, GainNode>>>({})
  const loopRef = useRef(loop)
  const positionRef = useRef(positionTick)
  const runRef = useRef<ScheduledRun | null>(null)
  const selectionRef = useRef(new Set<VoiceName>(voiceSelection))
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
    for (const voice of voices) {
      const gain = context.createGain()
      gain.gain.value = selectionRef.current.has(voice) ? 1 : 0
      gain.connect(master)
      gainsRef.current[voice] = gain
    }
    contextRef.current = context
    return context
  }, [])

  const schedulePianoTone = useCallback((context: AudioContext, voice: VoiceName, midi: number, startTime: number, duration: number, oscillators: OscillatorNode[]) => {
    const destination = gainsRef.current[voice]
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
    const startTick = clampPlaybackTick(requestedTick, endTick)
    const startTime = context.currentTime + 0.045
    const oscillators: OscillatorNode[] = []
    for (const event of playbackEventsFrom(parts, startTick, tempoRef.current)) schedulePianoTone(context, event.voiceId as VoiceName, event.note.pitchMidi, startTime + event.startOffsetSeconds, event.durationSeconds, oscillators)
    setPosition(startTick)
    setPlaybackStatus('playing')
    const refreshPosition = () => {
      if (statusRef.current !== 'playing' || !runRef.current || contextRef.current !== context) return
      const currentTick = playbackPositionTick(startTick, startTime, context.currentTime, tempoRef.current, endTick, loopRef.current)
      setPosition(currentTick)
      setActiveVoices(activeVoicesAt(parts, currentTick, selectionRef.current))
      runRef.current.animationFrame = window.requestAnimationFrame(refreshPosition)
    }
    const finishDelay = Math.max(1, Math.ceil((0.045 + ticksToSeconds(endTick - startTick, tempoRef.current)) * 1000))
    const finishTimer = window.setTimeout(() => {
      if (loopRef.current) { void startRef.current?.(0); return }
      clearRun()
      setPosition(endTick)
      setPlaybackStatus('idle')
    }, finishDelay)
    runRef.current = { animationFrame: window.requestAnimationFrame(refreshPosition), finishTimer, oscillators, startTick, startTime }
    return true
  }, [clearRun, endTick, ensureContext, parts, schedulePianoTone, setPlaybackStatus, setPosition])

  useEffect(() => {
    startRef.current = start
  }, [start])

  const pause = useCallback(() => {
    const context = contextRef.current
    const run = runRef.current
    if (!context || !run || statusRef.current !== 'playing') return
    setPosition(playbackPositionTick(run.startTick, run.startTime, context.currentTime, tempoRef.current, endTick, loopRef.current))
    clearRun()
    setPlaybackStatus('paused')
  }, [clearRun, endTick, setPlaybackStatus, setPosition])

  const stop = useCallback(() => {
    clearRun()
    setPosition(0)
    setPlaybackStatus('idle')
  }, [clearRun, setPlaybackStatus, setPosition])

  const seek = useCallback((tick: number) => {
    const next = clampPlaybackTick(tick, endTick)
    if (statusRef.current === 'playing') void start(next)
    else setPosition(next)
  }, [endTick, setPosition, start])

  const restart = useCallback(() => { void start(0) }, [start])

  const setLoop = useCallback((enabled: boolean) => {
    loopRef.current = enabled
    setLoopState(enabled)
  }, [])

  const setTempoBpm = useCallback((value: number) => {
    const next = Math.max(40, Math.min(220, Math.round(value)))
    const context = contextRef.current
    const run = runRef.current
    const current = context && run ? playbackPositionTick(run.startTick, run.startTime, context.currentTime, tempoRef.current, endTick, loopRef.current) : positionRef.current
    tempoRef.current = next
    setTempoBpmState(next)
    if (statusRef.current === 'playing') void start(current)
  }, [endTick, start])

  const setVoiceSelection = useCallback((next: VoiceName[]) => {
    const normalized = new Set(next)
    selectionRef.current = normalized
    setVoiceSelectionState(voices.filter((voice) => normalized.has(voice)))
    const context = contextRef.current
    if (context) for (const voice of voices) gainsRef.current[voice]?.gain.setTargetAtTime(normalized.has(voice) ? 1 : 0, context.currentTime, 0.012)
  }, [])

  useEffect(() => () => {
    clearRun()
    const context = contextRef.current
    contextRef.current = null
    if (context && context.state !== 'closed') void context.close()
  }, [clearRun])

  return { activeVoices, endTick, error, isSupported: audioContextConstructor() !== null, loop, pause, play: () => { void start(positionRef.current) }, positionTick, restart, seek, setLoop, setTempoBpm, setVoiceSelection, status, stop, tempoBpm, voiceSelection }
}
