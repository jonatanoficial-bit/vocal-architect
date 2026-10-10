import { useCallback, useState } from 'react'

import { EmptyPanel } from '../components/EmptyPanel'
import { StudioIcon } from '../components/StudioIcon'
import { AudioAnalysisPanel } from '../features/audio/AudioAnalysisPanel'
import { AudioImportPanel } from '../features/audio/AudioImportPanel'
import { useAudioWorkspace } from '../features/audio/useAudioWorkspace'
import { HarmonyPanel } from '../features/harmony/HarmonyPanel'
import { MelodyEditorPanel } from '../features/melody/MelodyEditorPanel'
import { useProjectSession } from '../features/projects/useProjectSession'
import { RecorderPanel } from '../features/recording/RecorderPanel'
import { TranscriptionPanel } from '../features/transcription/TranscriptionPanel'
import { usePitchTranscription } from '../features/transcription/usePitchTranscription'
import type { NoteEvent } from '../music/types'

import { navigateTo } from '../app/useHashRoute'
import { routes } from '../app/routes'

type Workspace = 'audio' | 'harmony' | 'melody'

const workspaceSteps: { description: string; icon: Workspace; label: string }[] = [
  { description: 'Grave, importe e reconheça', icon: 'audio', label: 'Áudio' },
  { description: 'Revise e confirme as notas', icon: 'melody', label: 'Melodia' },
  { description: 'Gere acordes por frase', icon: 'harmony', label: 'Harmonia' },
]

const studyMelody: NoteEvent[] = [
  { durationTicks: 960, id: 'study-e', locked: false, origin: 'generated', phraseId: 'study-1', pitchMidi: 64, spelling: 'E4', startTick: 0, velocity: 88, voiceId: 'melody' },
  { durationTicks: 960, id: 'study-f', locked: false, origin: 'generated', phraseId: 'study-2', pitchMidi: 65, spelling: 'F4', startTick: 960, velocity: 88, voiceId: 'melody' },
  { durationTicks: 960, id: 'study-g', locked: false, origin: 'generated', phraseId: 'study-3', pitchMidi: 67, spelling: 'G4', startTick: 1920, velocity: 88, voiceId: 'melody' },
  { durationTicks: 960, id: 'study-e-end', locked: false, origin: 'generated', phraseId: 'study-4', pitchMidi: 64, spelling: 'E4', startTick: 2880, velocity: 88, voiceId: 'melody' },
]

export function StudioPage() {
  const { session, createSession, renameSession } = useProjectSession()
  const audioWorkspace = useAudioWorkspace()
  const transcription = usePitchTranscription()
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>('audio')
  const [confirmedMelody, setConfirmedMelody] = useState<{ notes: NoteEvent[]; sourceId: string } | null>(null)
  const currentAssetId = audioWorkspace.asset?.id ?? null
  const transcriptionMatchesAsset = transcription.assetId === currentAssetId
  const editableMelodyId = transcriptionMatchesAsset && transcription.result && audioWorkspace.asset ? `${audioWorkspace.asset.id}:${transcription.revision}` : null
  const editableMelodyNotes = transcriptionMatchesAsset && transcription.result ? transcription.result.notes.map((entry) => entry.note) : []
  const handleConfirmationChange = useCallback((melody: { notes: NoteEvent[]; sourceId: string } | null) => setConfirmedMelody(melody), [])

  const handleTranscribe = () => {
    const { asset, decodedAudio } = audioWorkspace
    if (asset && decodedAudio) void transcription.transcribe({ assetId: asset.id, decodedAudio, source: asset.source })
  }

  if (!session) {
    return <div className="page studio-empty"><EmptyPanel title="Seu estúdio está pronto para um projeto."><button className="button primary" onClick={() => { createSession(); navigateTo(routes.studio) }}>Criar sessão temporária</button><span>Esta ação cria um projeto em memória. O salvamento local será implementado no Lote 13.</span></EmptyPanel></div>
  }

  return (
    <div className="studio-page">
      <section className="studio-titlebar" aria-label="Projeto atual">
        <div><p className="eyebrow">Sessão temporária</p><label htmlFor="project-name">Nome do projeto</label><input id="project-name" value={session.name} onChange={(event) => renameSession(event.target.value)} /></div>
        <span className="pending-label">Sem salvamento local nesta versão</span>
      </section>
      <nav className="studio-workspace-nav" aria-label="Etapas de trabalho">{workspaceSteps.map((step) => <button aria-controls={`workspace-${step.icon}`} aria-pressed={activeWorkspace === step.icon} className={activeWorkspace === step.icon ? 'active' : ''} key={step.icon} onClick={() => setActiveWorkspace(step.icon)} type="button"><StudioIcon name={step.icon} /><span><strong>{step.label}</strong><small>{step.description}</small></span></button>)}</nav>
      <section className="studio-workbench" aria-label="Estúdio Vocal Architect">
        <div hidden={activeWorkspace !== 'audio'} id="workspace-audio">
          <div className="audio-workspace-grid">
            <aside className="studio-panel tracks-panel"><div className="panel-heading"><span>01</span><h2>Gravação</h2></div><RecorderPanel onRecordingReady={audioWorkspace.processRecordedAudio} /><AudioImportPanel onImportAudio={audioWorkspace.importAudioFile} status={audioWorkspace.status} /></aside>
            <section className="studio-panel arrangement-panel"><div className="panel-heading"><span>02</span><h2>Área de áudio</h2></div><AudioAnalysisPanel analysis={audioWorkspace.analysis} asset={audioWorkspace.asset} error={audioWorkspace.error} onClear={() => { audioWorkspace.clearAudio(); transcription.clear() }} status={audioWorkspace.status} /><TranscriptionPanel asset={audioWorkspace.asset} decodedAudio={audioWorkspace.decodedAudio} error={transcriptionMatchesAsset ? transcription.error : null} processingStatus={audioWorkspace.status} result={transcriptionMatchesAsset ? transcription.result : null} status={transcriptionMatchesAsset ? transcription.status : 'idle'} onTranscribe={handleTranscribe} /></section>
          </div>
          <section className="studio-panel transport-panel"><div className="panel-heading"><span>04</span><h2>Reprodução</h2></div><p>A reprodução da gravação está disponível no painel de Gravação. O piano SATB, mixer e modo ensaio aparecem depois que uma harmonia e um arranjo são gerados na etapa Harmonia.</p></section>
        </div>
        <div hidden={activeWorkspace !== 'melody'} id="workspace-melody"><section className="studio-panel melody-workspace"><div className="panel-heading"><span>03</span><h2>Melodia</h2></div><MelodyEditorPanel onConfirmationChange={handleConfirmationChange} sourceId={editableMelodyId} sourceNotes={editableMelodyNotes} /></section></div>
        <div hidden={activeWorkspace !== 'harmony'} id="workspace-harmony"><section className="studio-panel"><HarmonyPanel confirmedMelody={confirmedMelody} onOpenMelody={() => setActiveWorkspace('melody')} onUseStudyExample={() => { setConfirmedMelody({ notes: studyMelody.map((note) => ({ ...note })), sourceId: 'study-example' }); setActiveWorkspace('harmony') }} /></section></div>
      </section>
    </div>
  )
}
