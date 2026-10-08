import { useCallback, useRef, useState } from 'react'

import { transcribeMonophonicAudio } from '../../audio/transcription/transcribe'
import type { TranscriptionResult, TranscriptionSource, TranscriptionStatus } from '../../audio/transcription/types'
import type { DecodedAudio } from '../../audio/processing/types'

type TranscriptionInput = {
  assetId: string
  decodedAudio: DecodedAudio
  source: TranscriptionSource
}

function transcriptionErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Não foi possível reconhecer notas neste áudio.'
}

export function usePitchTranscription() {
  const [assetId, setAssetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [status, setStatus] = useState<TranscriptionStatus>('idle')
  const activeRequestRef = useRef(0)

  const transcribe = useCallback(async ({ assetId: nextAssetId, decodedAudio, source }: TranscriptionInput) => {
    const requestId = activeRequestRef.current + 1
    activeRequestRef.current = requestId
    setAssetId(nextAssetId)
    setError(null)
    setResult(null)
    setStatus('transcribing')

    await new Promise<void>((resolve) => window.setTimeout(resolve, 0))

    try {
      const nextResult = transcribeMonophonicAudio(decodedAudio, source)
      if (requestId !== activeRequestRef.current) return
      setResult(nextResult)
      setRevision((current) => current + 1)
      setStatus('ready')
    } catch (transcriptionError) {
      if (requestId !== activeRequestRef.current) return
      setError(transcriptionErrorMessage(transcriptionError))
      setStatus('error')
    }
  }, [])

  const clear = useCallback(() => {
    activeRequestRef.current += 1
    setAssetId(null)
    setError(null)
    setResult(null)
    setRevision(0)
    setStatus('idle')
  }, [])

  return { assetId, clear, error, result, revision, status, transcribe }
}
