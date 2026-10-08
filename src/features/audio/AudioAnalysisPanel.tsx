import { formatDuration } from '../../audio/capture/format'
import type { AudioAnalysis, AudioAsset, AudioProcessingStatus, WaveformPeak } from '../../audio/processing/types'

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
}

function formatSampleRate(sampleRate: number) {
  return `${(sampleRate / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kHz`
}

function sourceLabel(source: AudioAsset['source']) {
  return source === 'recorded' ? 'Gravação desta sessão' : 'Arquivo importado'
}

function Waveform({ waveform }: { waveform: WaveformPeak[] }) {
  if (waveform.length === 0) return null

  return <svg className="waveform" viewBox={`0 0 ${waveform.length} 100`} preserveAspectRatio="none" role="img" aria-label="Waveform calculada a partir do áudio decodificado"><line x1="0" x2={waveform.length} y1="50" y2="50" className="waveform-axis" />{waveform.map((peak, index) => <line key={index} x1={index + .5} x2={index + .5} y1={50 - peak.min * 44} y2={50 - peak.max * 44} className="waveform-peak" />)}</svg>
}

export function AudioAnalysisPanel({ analysis, asset, error, onClear, status }: { analysis: AudioAnalysis | null; asset: AudioAsset | null; error: string | null; onClear: () => void; status: AudioProcessingStatus }) {
  const isProcessing = status === 'validating' || status === 'decoding' || status === 'analysing'

  return (
    <div className="audio-analysis">
      {isProcessing ? <div className="audio-analysis-state" role="status"><strong>Processamento local em andamento</strong><span>O áudio está sendo decodificado e analisado nesta aba.</span></div> : null}
      {error ? <div className="recorder-error" role="alert">{error}</div> : null}
      {!asset || !analysis ? <div className="timeline-placeholder"><div className="timeline-ruler" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div><strong>Aguardando um áudio válido</strong><p>Grave ou importe uma linha vocal. O áudio será preparado localmente antes do reconhecimento monofônico de notas.</p></div> : null}
      {asset && analysis ? <>
        <div className="audio-asset-summary"><div><p className="eyebrow">{sourceLabel(asset.source)}</p><h3>{asset.name}</h3><span>{formatDuration(analysis.durationMs)} · {formatFileSize(asset.sizeBytes)} · {asset.mimeType}</span></div><button className="button quiet" type="button" onClick={onClear}>Remover áudio</button></div>
        <Waveform waveform={analysis.waveform} />
        <dl className="audio-metrics">
          <div><dt>Duração</dt><dd>{formatDuration(analysis.durationMs)}</dd></div>
          <div><dt>PCM mono</dt><dd>{analysis.monoSampleCount.toLocaleString('pt-BR')} amostras</dd></div>
          <div><dt>Taxa de amostragem</dt><dd>{formatSampleRate(analysis.sampleRate)}</dd></div>
          <div><dt>Canais originais</dt><dd>{analysis.channelCount}</dd></div>
          <div><dt>Pico</dt><dd>{Math.round(analysis.peak * 100)}%</dd></div>
          <div><dt>Energia média</dt><dd>{Math.round(analysis.averageRms * 100)}%</dd></div>
        </dl>
        <section className="silence-summary" aria-labelledby="silence-title"><div><h3 id="silence-title">Regiões de silêncio</h3><span>{analysis.silenceRegions.length === 0 ? 'Nenhuma região de pelo menos 300 ms detectada.' : `${analysis.silenceRegions.length} região(ões) de pelo menos 300 ms detectada(s).`}</span></div>{analysis.silenceRegions.length > 0 ? <ol>{analysis.silenceRegions.slice(0, 4).map((region) => <li key={`${region.startMs}-${region.endMs}`}>{formatDuration(region.startMs)} — {formatDuration(region.endMs)}</li>)}</ol> : null}</section>
        <p className="audio-analysis-note">Esta etapa prepara PCM, energia e silêncios. O painel abaixo faz uma leitura monofônica separada; acordes e vozes sobrepostas continuam fora do escopo.</p>
      </> : null}
    </div>
  )
}
