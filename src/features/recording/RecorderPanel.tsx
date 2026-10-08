import { useState } from 'react'

import { formatDuration } from '../../audio/capture/format'
import { useMicrophoneRecorder } from './useMicrophoneRecorder'

const liveStatuses = new Set(['requesting-permission', 'recording', 'paused', 'stopping'])

export function RecorderPanel() {
  const {
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
  } = useMicrophoneRecorder()

  const [recordingName, setRecordingName] = useState('Melodia principal')
  const isLive = liveStatuses.has(status)
  const levelPercent = Math.round(level.level * 100)

  return (
    <section className="recorder" aria-label="Gravador de melodia">
      <p className="recorder-intro">Capture uma melodia monofônica com o microfone. O áudio permanece nesta sessão do navegador e não é enviado para servidores.</p>

      <label className="recorder-name" htmlFor="recording-name">
        Nome da gravação
        <input
          id="recording-name"
          maxLength={80}
          value={recordingName}
          disabled={isLive}
          onChange={(event) => setRecordingName(event.target.value)}
        />
      </label>

      {!support.available ? <div className="capability-status limited" role="status">{support.message} Nenhuma permissão de microfone foi solicitada.</div> : null}

      {support.available ? (
        <div className="recorder-controls">
          {status === 'idle' || status === 'error' || status === 'ready' ? <button className="button primary" type="button" onClick={() => void startRecording(recordingName)}>{status === 'error' ? 'Tentar gravar' : recording ? 'Gravar novamente' : 'Iniciar gravação'}</button> : null}
          {status === 'requesting-permission' ? <span className="recorder-state" role="status">Solicitando acesso ao microfone…</span> : null}
          {status === 'recording' ? <><button className="button secondary" type="button" onClick={pauseRecording}>Pausar</button><button className="button danger" type="button" onClick={stopRecording}>Encerrar</button><button className="button quiet" type="button" onClick={cancelRecording}>Cancelar</button></> : null}
          {status === 'paused' ? <><button className="button primary" type="button" onClick={resumeRecording}>Retomar</button><button className="button danger" type="button" onClick={stopRecording}>Encerrar</button><button className="button quiet" type="button" onClick={cancelRecording}>Cancelar</button></> : null}
          {status === 'stopping' ? <span className="recorder-state" role="status">Finalizando e preparando a reprodução…</span> : null}
        </div>
      ) : null}

      {isLive ? (
        <div className="recorder-monitor" aria-live="polite">
          <div className="recorder-time"><span className={status === 'recording' ? 'recording-dot' : ''} aria-hidden="true" />{formatDuration(durationMs)} <small>{status === 'paused' ? 'pausada' : 'gravando'}</small></div>
          <div className="level-meter-wrap">
            <div className="level-meter-label"><span>Nível de entrada</span><strong className={level.clipping ? 'clipping' : ''}>{level.clipping ? 'Clipping detectado' : `${levelPercent}%`}</strong></div>
            <div className="level-meter" role="progressbar" aria-label="Nível de entrada do microfone" aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelPercent}>
              <span style={{ transform: `scaleX(${level.level})` }} />
            </div>
          </div>
          <p>{level.clipping ? 'O sinal está muito alto. Afaste-se do microfone ou reduza o ganho.' : 'Evite ruídos e mantenha o indicador fora da região de clipping.'}</p>
        </div>
      ) : null}

      {error ? <div className="recorder-error" role="alert">{error}</div> : null}

      {recording ? (
        <div className="recording-result">
          <div><strong>{recording.name}</strong><span>{formatDuration(recording.durationMs)} · {recording.mimeType}</span></div>
          <audio aria-label={`Reprodução de ${recording.name}`} controls preload="metadata" src={recording.objectUrl}>Seu navegador não consegue reproduzir esta gravação.</audio>
          <div className="recording-result-actions"><button className="button quiet" type="button" onClick={discardRecording}>Descartar gravação</button><button className="button secondary" type="button" onClick={() => void startRecording(recordingName)}>Gravar novamente</button></div>
        </div>
      ) : null}
    </section>
  )
}
