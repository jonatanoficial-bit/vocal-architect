import type { VoiceName } from '../../music/satb'
import type { VocalPart } from '../../music/types'
import { mixerVoices, type PracticePreset } from '../../audio/playback/mixer'
import { secondsToTicks, ticksToSeconds } from '../../audio/playback/timing'
import { useSatbPlayback } from './useSatbPlayback'

type Props = { parts: VocalPart[] }

const voiceLabels: Record<VoiceName, string> = { alto: 'Contralto', bass: 'Baixo', soprano: 'Soprano', tenor: 'Tenor' }
const practicePresets: Array<{ id: PracticePreset; label: string }> = [{ id: 'ensemble', label: 'Conjunto' }, { id: 'isolated', label: 'Só meu naipe' }, { id: 'highlight', label: 'Destacar meu naipe' }]

function formatTime(ticks: number, tempoBpm: number) {
  const seconds = Math.floor(ticksToSeconds(ticks, tempoBpm))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function formatPan(pan: number) {
  if (pan === 0) return 'centro'
  return pan < 0 ? `${Math.round(Math.abs(pan) * 100)}% esq.` : `${Math.round(pan * 100)}% dir.`
}

export function SatbPlaybackPanel({ parts }: Props) {
  const playback = useSatbPlayback(parts)
  const seekStep = Math.max(1, Math.round(secondsToTicks(0.1, playback.tempoBpm)))
  const loopEndMinimum = Math.min(playback.endTick, playback.loopRange.startTick + seekStep)

  if (!playback.isSupported) return <section className="playback-workspace unsupported" aria-labelledby="playback-title"><p className="eyebrow">Ensaio vocal · Lote 10</p><h3 id="playback-title">Reprodução indisponível neste navegador</h3><p>Este navegador não expõe a Web Audio API necessária para tocar as notas SATB localmente.</p></section>

  return <section className="playback-workspace" aria-labelledby="playback-title">
    <div className="playback-heading"><div><p className="eyebrow">Ensaio vocal · Lote 10</p><h3 id="playback-title">Mesa de ensaio SATB</h3></div><span className={`playback-status ${playback.status}`}>{playback.status === 'playing' ? 'Tocando' : playback.status === 'paused' ? 'Pausado' : 'Pronto'}</span></div>
    <p className="playback-intro">Piano sintetizado localmente pelo navegador. Ajustes do mixer são aplicados às quatro vozes do arranjo atual; nenhum áudio ou nota sai do dispositivo.</p>
    <div className="transport-controls"><button className="button primary" disabled={playback.status === 'playing'} onClick={playback.play} type="button">{playback.status === 'paused' ? 'Continuar' : 'Reproduzir'}</button><button className="button quiet" disabled={playback.status !== 'playing'} onClick={playback.pause} type="button">Pausar</button><button className="button quiet" disabled={playback.status === 'idle' && playback.positionTick === 0} onClick={playback.stop} type="button">Parar</button><button className="button quiet" onClick={playback.restart} type="button">Reiniciar</button></div>
    <label className="playback-seek">Posição <input aria-label="Posição da reprodução" max={playback.endTick} min="0" onChange={(event) => playback.seek(Number(event.target.value))} step={seekStep} type="range" value={Math.min(playback.positionTick, playback.endTick)} /><span>{formatTime(playback.positionTick, playback.tempoBpm)} / {formatTime(playback.endTick, playback.tempoBpm)}</span></label>
    <div className="playback-settings"><label>BPM<input aria-label="Andamento em BPM" max="220" min="40" onChange={(event) => playback.setTempoBpm(Number(event.target.value))} type="number" value={playback.tempoBpm} /></label><button aria-pressed={playback.isSlowPractice} className="practice-slow" onClick={playback.toggleSlowPractice} type="button">{playback.isSlowPractice ? 'Voltar ao andamento' : 'Ensaio lento · 72%'}</button><label className="loop-toggle"><input checked={playback.loop} onChange={(event) => playback.setLoop(event.target.checked)} type="checkbox" />Repetir trecho</label></div>
    <fieldset className="loop-region"><legend>Trecho de ensaio</legend><label>Início <input aria-label="Início do trecho de ensaio" max={Math.max(0, playback.loopRange.endTick - seekStep)} min="0" onChange={(event) => playback.setLoopRange(Number(event.target.value), playback.loopRange.endTick)} step={seekStep} type="range" value={playback.loopRange.startTick} /><span>{formatTime(playback.loopRange.startTick, playback.tempoBpm)}</span></label><label>Fim <input aria-label="Fim do trecho de ensaio" max={playback.endTick} min={loopEndMinimum} onChange={(event) => playback.setLoopRange(playback.loopRange.startTick, Number(event.target.value))} step={seekStep} type="range" value={playback.loopRange.endTick} /><span>{formatTime(playback.loopRange.endTick, playback.tempoBpm)}</span></label><button className="quiet" onClick={playback.resetLoopRange} type="button">Usar arranjo inteiro</button></fieldset>
    <div className="practice-controls"><label>Meu naipe<select aria-label="Meu naipe de ensaio" onChange={(event) => playback.setFocusVoice(event.target.value as VoiceName)} value={playback.focusVoice}>{mixerVoices.map((voice) => <option key={voice} value={voice}>{voiceLabels[voice]}</option>)}</select></label><div aria-label="Presets de estudo" className="practice-presets">{practicePresets.map((preset) => <button aria-pressed={playback.practicePreset === preset.id} className={playback.practicePreset === preset.id ? 'selected' : ''} key={preset.id} onClick={() => playback.applyPracticePreset(preset.id)} type="button">{preset.label}</button>)}</div></div>
    <details className="mixer-details" open><summary>Mixer por naipe <span>{playback.activeVoices.length > 0 ? `${playback.activeVoices.length} ativo${playback.activeVoices.length === 1 ? '' : 's'}` : 'pronto'}</span></summary><div className="mixer-grid">{mixerVoices.map((voice) => { const mix = playback.mixer[voice]; return <article className={`mixer-strip ${voice}`} key={voice}><header><strong>{voiceLabels[voice]}</strong><span>{mix.solo ? 'solo' : mix.muted ? 'silenciado' : playback.activeVoices.includes(voice) ? 'tocando' : 'ativo'}</span></header><div className="mix-buttons"><button aria-label={`Silenciar ${voiceLabels[voice]}`} aria-pressed={mix.muted} className={mix.muted ? 'selected' : ''} onClick={() => playback.toggleMute(voice)} type="button">M</button><button aria-label={`Solar ${voiceLabels[voice]}`} aria-pressed={mix.solo} className={mix.solo ? 'selected' : ''} onClick={() => playback.toggleSolo(voice)} type="button">S</button></div><label>Volume <input aria-label={`Volume de ${voiceLabels[voice]}`} max="1" min="0" onChange={(event) => playback.updateVolume(voice, Number(event.target.value))} step="0.01" type="range" value={mix.volume} /><output>{Math.round(mix.volume * 100)}%</output></label><label>Pan <input aria-label={`Pan de ${voiceLabels[voice]}`} disabled={!playback.isStereoPanSupported} max="1" min="-1" onChange={(event) => playback.updatePan(voice, Number(event.target.value))} step="0.05" type="range" value={mix.pan} /><output>{playback.isStereoPanSupported ? formatPan(mix.pan) : 'indisponível'}</output></label></article> })}</div></details>
    {playback.error ? <p className="playback-error" role="alert">{playback.error}</p> : null}
    <p className="playback-note">Solo tem prioridade sobre mute. “Só meu naipe” e “Destacar meu naipe” usam o naipe escolhido acima. O loop toca somente o trecho marcado quando estiver ativado. Acompanhamento instrumental externo, voz humana e exportação continuam indisponíveis.</p>
  </section>
}
