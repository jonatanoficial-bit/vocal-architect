import { formatDuration } from '../../audio/capture/format'
import type { TranscribedNote, TranscriptionResult, TranscriptionStatus } from '../../audio/transcription/types'
import type { AudioAsset, AudioProcessingStatus, DecodedAudio } from '../../audio/processing/types'

type Props = {
  asset: AudioAsset | null
  decodedAudio: DecodedAudio | null
  error: string | null
  processingStatus: AudioProcessingStatus
  result: TranscriptionResult | null
  status: TranscriptionStatus
  onTranscribe: () => void
}

function formatFrequency(frequencyHz: number) {
  return `${frequencyHz.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Hz`
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`
}

function noteClassName(note: TranscribedNote) {
  return note.uncertain ? 'transcribed-note uncertain' : 'transcribed-note'
}

function DetectedNote({ note }: { note: TranscribedNote }) {
  return <li className={noteClassName(note)}>
    <strong>{note.note.spelling}</strong>
    <span>{formatDuration(note.startMs)} — {formatDuration(note.endMs)}</span>
    <small>{formatFrequency(note.averageFrequencyHz)} · confiança {formatConfidence(note.confidence)}</small>
    {note.uncertain ? <em>Revisar</em> : null}
  </li>
}

export function TranscriptionPanel({ asset, decodedAudio, error, processingStatus, result, status, onTranscribe }: Props) {
  const isAudioProcessing = processingStatus === 'validating' || processingStatus === 'decoding' || processingStatus === 'analysing'
  const canTranscribe = Boolean(asset && decodedAudio && !isAudioProcessing && status !== 'transcribing')

  return <section className="transcription-panel" aria-labelledby="transcription-title">
    <div className="transcription-heading">
      <div><p className="eyebrow">Reconhecimento local · Lote 05</p><h3 id="transcription-title">Transcrição monofônica</h3></div>
      <button className="button primary" type="button" disabled={!canTranscribe} onClick={onTranscribe}>{status === 'transcribing' ? 'Reconhecendo…' : 'Reconhecer notas'}</button>
    </div>
    {!asset || !decodedAudio ? <p className="transcription-empty">Importe ou grave uma linha vocal válida para habilitar o reconhecimento de notas.</p> : <p className="transcription-intro">Detector local YIN para uma voz principal, até 90 segundos. Ele não separa acordes, vozes sobrepostas ou instrumentos.</p>}
    {status === 'transcribing' ? <div className="transcription-state" role="status"><strong>Analisando a frequência fundamental localmente</strong><span>O arquivo não é enviado a um servidor.</span></div> : null}
    {error ? <div className="recorder-error" role="alert">{error}</div> : null}
    {status === 'ready' && result ? <TranscriptionResultView result={result} /> : null}
  </section>
}

function TranscriptionResultView({ result }: { result: TranscriptionResult }) {
  const { diagnostics, notes } = result
  return <div className="transcription-result" aria-live="polite">
    <div className="transcription-summary"><strong>{notes.length === 0 ? 'Nenhuma nota confiável' : `${notes.length} nota${notes.length === 1 ? '' : 's'} reconhecida${notes.length === 1 ? '' : 's'}`}</strong><span>{diagnostics.acceptedFrames}/{diagnostics.analyzedFrames} janelas aceitas · pulso-base {result.tempoBpm} BPM</span></div>
    {notes.length > 0 ? <ol className="transcribed-notes" aria-label="Notas detectadas">{notes.map((note) => <DetectedNote key={note.note.id} note={note} />)}</ol> : <p className="transcription-empty">Tente uma gravação solo mais limpa, com volume estável e pouca reverberação.</p>}
    {diagnostics.warnings.length > 0 ? <ul className="transcription-warnings">{diagnostics.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
    <p className="transcription-note">As notas exibidas são uma primeira leitura: trechos marcados para revisão e transições contínuas podem ser corrigidos no editor de melodia abaixo.</p>
  </div>
}
