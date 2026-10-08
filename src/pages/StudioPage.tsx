import { EmptyPanel } from '../components/EmptyPanel'
import { AudioAnalysisPanel } from '../features/audio/AudioAnalysisPanel'
import { AudioImportPanel } from '../features/audio/AudioImportPanel'
import { useAudioWorkspace } from '../features/audio/useAudioWorkspace'
import { useProjectSession } from '../features/projects/useProjectSession'
import { RecorderPanel } from '../features/recording/RecorderPanel'
import { TranscriptionPanel } from '../features/transcription/TranscriptionPanel'
import { usePitchTranscription } from '../features/transcription/usePitchTranscription'

import { navigateTo } from '../app/useHashRoute'
import { routes } from '../app/routes'

export function StudioPage() {
  const { session, createSession, renameSession } = useProjectSession()
  const audioWorkspace = useAudioWorkspace()
  const transcription = usePitchTranscription()
  const currentAssetId = audioWorkspace.asset?.id ?? null
  const transcriptionMatchesAsset = transcription.assetId === currentAssetId

  if (!session) {
    return <div className="page studio-empty"><EmptyPanel title="Seu estúdio está pronto para um projeto."><button className="button primary" onClick={() => { createSession(); navigateTo(routes.studio) }}>Criar sessão temporária</button><span>Esta ação cria um projeto em memória. O salvamento local será implementado no Lote 13.</span></EmptyPanel></div>
  }

  return (
    <div className="studio-page">
      <section className="studio-titlebar" aria-label="Projeto atual">
        <div><p className="eyebrow">Sessão temporária</p><label htmlFor="project-name">Nome do projeto</label><input id="project-name" value={session.name} onChange={(event) => renameSession(event.target.value)} /></div>
        <span className="pending-label">Sem salvamento local nesta versão</span>
      </section>
      <section className="studio-grid" aria-label="Estúdio Vocal Architect">
        <aside className="studio-panel tracks-panel"><div className="panel-heading"><span>01</span><h2>Gravação</h2></div><RecorderPanel onRecordingReady={audioWorkspace.processRecordedAudio} /><AudioImportPanel onImportAudio={audioWorkspace.importAudioFile} status={audioWorkspace.status} /></aside>
        <section className="studio-panel arrangement-panel"><div className="panel-heading"><span>02</span><h2>Área de áudio</h2></div><AudioAnalysisPanel analysis={audioWorkspace.analysis} asset={audioWorkspace.asset} error={audioWorkspace.error} onClear={() => { audioWorkspace.clearAudio(); transcription.clear() }} status={audioWorkspace.status} /><TranscriptionPanel asset={audioWorkspace.asset} decodedAudio={audioWorkspace.decodedAudio} error={transcriptionMatchesAsset ? transcription.error : null} processingStatus={audioWorkspace.status} result={transcriptionMatchesAsset ? transcription.result : null} status={transcriptionMatchesAsset ? transcription.status : 'idle'} onTranscribe={() => { if (audioWorkspace.asset && audioWorkspace.decodedAudio) void transcription.transcribe({ assetId: audioWorkspace.asset.id, decodedAudio: audioWorkspace.decodedAudio, source: audioWorkspace.asset.source }) }} /></section>
        <aside className="studio-panel harmony-panel"><div className="panel-heading"><span>03</span><h2>Harmonização</h2></div><dl className="unavailable-list"><div><dt>Tonalidade</dt><dd>A definir com a melodia</dd></div><div><dt>Vozes</dt><dd>Aguardando motor SATB</dd></div><div><dt>Estilo</dt><dd>Aguardando Lote 07</dd></div></dl><p className="panel-note">Os controles ficam indisponíveis até que possam gerar resultados musicais reais.</p></aside>
        <section className="studio-panel transport-panel"><div className="panel-heading"><span>04</span><h2>Reprodução</h2></div><p>A reprodução da gravação está disponível no painel de Gravação. O transporte multipista e os instrumentos virtuais serão ativados no Lote 09.</p></section>
      </section>
    </div>
  )
}
