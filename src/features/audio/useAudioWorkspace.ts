import { useCallback, useEffect, useRef, useState } from 'react'

import { createAudioAnalysis } from '../../audio/processing/analysis'
import { decodeAudioBlob } from '../../audio/processing/browserDecoder'
import type { AudioAnalysis, AudioAsset, AudioProcessingStatus, AudioSourceKind } from '../../audio/processing/types'
import { validateAudioBlob, validateDecodedAudio } from '../../audio/processing/validation'
import type { CapturedRecording } from '../../audio/capture/types'

type AudioInput = {
  blob: Blob
  name: string
  source: AudioSourceKind
}

function createAudioAssetId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `audio-${Date.now()}`
}

function processingErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes('decodificação de áudio')) return error.message
  return 'Não foi possível decodificar este áudio. Ele pode estar corrompido ou não ser compatível com este navegador.'
}

export function useAudioWorkspace() {
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [asset, setAsset] = useState<AudioAsset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<AudioProcessingStatus>('idle')
  const activeRequestRef = useRef(0)
  const assetUrlRef = useRef<string | null>(null)
  const disposedRef = useRef(false)

  const processAudio = useCallback(async ({ blob, name, source }: AudioInput) => {
    const requestId = activeRequestRef.current + 1
    activeRequestRef.current = requestId
    setError(null)
    setStatus('validating')

    const validationError = validateAudioBlob(blob, name)
    if (validationError) {
      setError(validationError)
      setStatus('error')
      return
    }

    try {
      setStatus('decoding')
      const decodedAudio = await decodeAudioBlob(blob)
      if (disposedRef.current || requestId !== activeRequestRef.current) return

      const decodedValidationError = validateDecodedAudio({
        decodedBytes: decodedAudio.decodedByteLength,
        durationMs: decodedAudio.durationMs,
      })
      if (decodedValidationError) {
        setError(decodedValidationError)
        setStatus('error')
        return
      }

      setStatus('analysing')
      const nextAnalysis = createAudioAnalysis(decodedAudio)
      if (disposedRef.current || requestId !== activeRequestRef.current) return

      const objectUrl = URL.createObjectURL(blob)
      if (assetUrlRef.current) URL.revokeObjectURL(assetUrlRef.current)
      assetUrlRef.current = objectUrl
      setAsset({
        id: createAudioAssetId(),
        name,
        objectUrl,
        mimeType: blob.type || 'audio/*',
        sizeBytes: blob.size,
        source,
      })
      setAnalysis(nextAnalysis)
      setStatus('ready')
    } catch (processingError) {
      if (disposedRef.current || requestId !== activeRequestRef.current) return
      setError(processingErrorMessage(processingError))
      setStatus('error')
    }
  }, [])

  const importAudioFile = useCallback((file: File) => processAudio({ blob: file, name: file.name, source: 'imported' }), [processAudio])
  const processRecordedAudio = useCallback((recording: CapturedRecording) => processAudio({ blob: recording.blob, name: recording.name, source: 'recorded' }), [processAudio])

  const clearAudio = useCallback(() => {
    activeRequestRef.current += 1
    if (assetUrlRef.current) URL.revokeObjectURL(assetUrlRef.current)
    assetUrlRef.current = null
    setAnalysis(null)
    setAsset(null)
    setError(null)
    setStatus('idle')
  }, [])

  useEffect(() => {
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      activeRequestRef.current += 1
      if (assetUrlRef.current) URL.revokeObjectURL(assetUrlRef.current)
    }
  }, [])

  return { analysis, asset, clearAudio, error, importAudioFile, processRecordedAudio, status }
}
