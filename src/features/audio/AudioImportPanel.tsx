import type { AudioProcessingStatus } from '../../audio/processing/types'
import { audioFileAccept } from '../../audio/processing/validation'

const processingMessages: Partial<Record<AudioProcessingStatus, string>> = {
  validating: 'Validando o arquivo selecionado…',
  decoding: 'Decodificando o áudio localmente…',
  analysing: 'Calculando waveform, energia e silêncios…',
}

export function AudioImportPanel({ onImportAudio, status }: { onImportAudio: (file: File) => void; status: AudioProcessingStatus }) {
  const isProcessing = status === 'validating' || status === 'decoding' || status === 'analysing'

  return (
    <section className="audio-import" aria-labelledby="audio-import-title">
      <div><p className="eyebrow">Arquivo local</p><h3 id="audio-import-title">Importar áudio</h3></div>
      <p>Envie uma referência vocal em formato compatível com este navegador. O limite desta versão é 50 MB e o arquivo não sai da sua aba.</p>
      <label className="file-picker" htmlFor="audio-import-file">
        <span>{isProcessing ? 'Processando áudio…' : 'Escolher arquivo de áudio'}</span>
        <input
          id="audio-import-file"
          type="file"
          accept={audioFileAccept}
          disabled={isProcessing}
          onChange={(event) => {
            const file = event.currentTarget.files?.item(0)
            event.currentTarget.value = ''
            if (file) onImportAudio(file)
          }}
        />
      </label>
      {processingMessages[status] ? <span className="audio-processing-state" role="status">{processingMessages[status]}</span> : null}
    </section>
  )
}
