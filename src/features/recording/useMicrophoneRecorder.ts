import { useCallback, useEffect, useRef, useState } from 'react'

import { microphoneErrorMessage } from '../../audio/capture/errors'
import { normalizeRecordingName } from '../../audio/capture/format'
import { calculateAudioLevel } from '../../audio/capture/level'
import { getPreferredAudioMimeType, getRecorderSupport, releaseMicrophone, requestMicrophone } from '../../audio/capture/media'
import type { AudioLevel, CapturedRecording, RecorderStatus } from '../../audio/capture/types'

type AudioGraph = {
  analyser: AnalyserNode
  context: AudioContext
  source: MediaStreamAudioSourceNode
}

type LegacyAudioContextWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

const emptyLevel: AudioLevel = { level: 0, clipping: false }

function createRecordingId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `recording-${Date.now()}`
}

export function useMicrophoneRecorder() {
  const [support] = useState(getRecorderSupport)
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<AudioLevel>(emptyLevel)
  const [durationMs, setDurationMs] = useState(0)
  const [recording, setRecording] = useState<CapturedRecording | null>(null)

  const audioGraphRef = useRef<AudioGraph | null>(null)
  const durationMsRef = useRef(0)
  const durationTimerRef = useRef<number | undefined>(undefined)
  const finalDurationRef = useRef(0)
  const levelAnimationRef = useRef<number | undefined>(undefined)
  const pauseStartedAtRef = useRef<number | null>(null)
  const pausedDurationRef = useRef(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingStartedAtRef = useRef<number | null>(null)
  const recordingUrlRef = useRef<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const discardOnStopRef = useRef(false)
  const disposedRef = useRef(false)
  const failedRef = useRef(false)

  const clearDurationTimer = useCallback(() => {
    if (durationTimerRef.current !== undefined) {
      window.clearInterval(durationTimerRef.current)
      durationTimerRef.current = undefined
    }
  }, [])

  const getElapsedDuration = useCallback(() => {
    if (recordingStartedAtRef.current === null) return durationMsRef.current
    const end = pauseStartedAtRef.current ?? performance.now()
    return Math.max(0, Math.round(end - recordingStartedAtRef.current - pausedDurationRef.current))
  }, [])

  const updateDuration = useCallback(() => {
    const nextDuration = getElapsedDuration()
    durationMsRef.current = nextDuration
    setDurationMs(nextDuration)
  }, [getElapsedDuration])

  const startDurationTimer = useCallback(() => {
    clearDurationTimer()
    durationTimerRef.current = window.setInterval(updateDuration, 250)
  }, [clearDurationTimer, updateDuration])

  const stopAudioAnalysis = useCallback(() => {
    if (levelAnimationRef.current !== undefined) {
      window.cancelAnimationFrame(levelAnimationRef.current)
      levelAnimationRef.current = undefined
    }

    const audioGraph = audioGraphRef.current
    if (!audioGraph) return

    audioGraph.source.disconnect()
    audioGraph.analyser.disconnect()
    void audioGraph.context.close().catch(() => undefined)
    audioGraphRef.current = null
  }, [])

  const releaseCaptureResources = useCallback(() => {
    clearDurationTimer()
    stopAudioAnalysis()
    releaseMicrophone(streamRef.current)
    streamRef.current = null
    recorderRef.current = null
    recordingStartedAtRef.current = null
    pauseStartedAtRef.current = null
    pausedDurationRef.current = 0
  }, [clearDurationTimer, stopAudioAnalysis])

  const clearCapturedRecording = useCallback(() => {
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current)
    recordingUrlRef.current = null
    setRecording(null)
  }, [])

  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    const AudioContextConstructor = window.AudioContext ?? (window as LegacyAudioContextWindow).webkitAudioContext
    if (!AudioContextConstructor) return

    try {
      const context = new AudioContextConstructor()
      const analyser = context.createAnalyser()
      const source = context.createMediaStreamSource(stream)

      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.82
      const samples = new Uint8Array(analyser.fftSize)
      source.connect(analyser)
      audioGraphRef.current = { analyser, context, source }

      const measure = () => {
        if (audioGraphRef.current?.analyser !== analyser) return
        analyser.getByteTimeDomainData(samples)
        setLevel(calculateAudioLevel(samples))
        levelAnimationRef.current = window.requestAnimationFrame(measure)
      }

      if (context.state === 'suspended') void context.resume().catch(() => undefined)
      measure()
    } catch {
      stopAudioAnalysis()
    }
  }, [stopAudioAnalysis])

  const finishRecording = useCallback((mimeType: string, chunks: BlobPart[], name: string) => {
    if (disposedRef.current) return

    const shouldDiscard = discardOnStopRef.current
    const didFail = failedRef.current
    const duration = finalDurationRef.current
    const blob = new Blob(chunks, { type: mimeType })

    releaseCaptureResources()
    setLevel(emptyLevel)
    discardOnStopRef.current = false
    failedRef.current = false

    if (shouldDiscard) {
      durationMsRef.current = 0
      setDurationMs(0)
      setStatus('idle')
      return
    }

    if (didFail) return

    if (blob.size === 0) {
      setError('A gravação não gerou áudio. Verifique o microfone e tente novamente.')
      setStatus('error')
      return
    }

    const objectUrl = URL.createObjectURL(blob)
    recordingUrlRef.current = objectUrl
    setRecording({
      id: createRecordingId(),
      name,
      blob,
      objectUrl,
      mimeType,
      durationMs: duration,
      capturedAt: new Date().toISOString(),
    })
    setStatus('ready')
  }, [releaseCaptureResources])

  const startRecording = useCallback(async (requestedName: string) => {
    if (!support.available) {
      setError(support.message)
      setStatus('error')
      return
    }

    clearCapturedRecording()
    clearDurationTimer()
    durationMsRef.current = 0
    finalDurationRef.current = 0
    setDurationMs(0)
    setLevel(emptyLevel)
    setError(null)
    setStatus('requesting-permission')
    discardOnStopRef.current = false
    failedRef.current = false

    let stream: MediaStream | null = null

    try {
      stream = await requestMicrophone()
      if (disposedRef.current) {
        releaseMicrophone(stream)
        return
      }

      streamRef.current = stream
      const mimeType = getPreferredAudioMimeType()
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      const name = normalizeRecordingName(requestedName)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      mediaRecorder.onerror = () => {
        failedRef.current = true
        releaseCaptureResources()
        if (disposedRef.current) return
        setLevel(emptyLevel)
        setError('A gravação foi interrompida por um erro do navegador. Tente novamente.')
        setStatus('error')
      }
      mediaRecorder.onstop = () => finishRecording(mediaRecorder.mimeType || mimeType || 'audio/webm', chunks, name)

      recorderRef.current = mediaRecorder
      startAudioAnalysis(stream)
      recordingStartedAtRef.current = performance.now()
      mediaRecorder.start(1000)
      startDurationTimer()
      setStatus('recording')
    } catch (captureError) {
      if (stream && stream !== streamRef.current) releaseMicrophone(stream)
      releaseCaptureResources()
      if (disposedRef.current) return
      setLevel(emptyLevel)
      setError(microphoneErrorMessage(captureError))
      setStatus('error')
    }
  }, [clearCapturedRecording, clearDurationTimer, finishRecording, releaseCaptureResources, startAudioAnalysis, startDurationTimer, support])

  const pauseRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording' || typeof recorder.pause !== 'function') {
      setError('Pausar não é suportado por este navegador durante esta captura.')
      return
    }

    updateDuration()
    pauseStartedAtRef.current = performance.now()
    clearDurationTimer()
    recorder.pause()
    setStatus('paused')
  }, [clearDurationTimer, updateDuration])

  const resumeRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'paused' || typeof recorder.resume !== 'function') {
      setError('Retomar não é suportado por este navegador durante esta captura.')
      return
    }

    if (pauseStartedAtRef.current !== null) {
      pausedDurationRef.current += performance.now() - pauseStartedAtRef.current
      pauseStartedAtRef.current = null
    }
    recorder.resume()
    startDurationTimer()
    setStatus('recording')
  }, [startDurationTimer])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) return

    updateDuration()
    finalDurationRef.current = durationMsRef.current
    clearDurationTimer()
    setStatus('stopping')

    if (recorder.state !== 'inactive') recorder.stop()
  }, [clearDurationTimer, updateDuration])

  const cancelRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) return

    discardOnStopRef.current = true
    clearDurationTimer()
    setStatus('stopping')
    if (recorder.state !== 'inactive') recorder.stop()
  }, [clearDurationTimer])

  const discardRecording = useCallback(() => {
    clearCapturedRecording()
    durationMsRef.current = 0
    setDurationMs(0)
    setError(null)
    setStatus('idle')
  }, [clearCapturedRecording])

  useEffect(() => {
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null
        recorder.stop()
      }
      releaseCaptureResources()
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current)
    }
  }, [releaseCaptureResources])

  return {
    cancelRecording,
    discardRecording,
    durationMs,
    error,
    level,
    pauseRecording,
    recording,
    resumeRecording,
    startRecording,
    status,
    stopRecording,
    support,
  }
}
