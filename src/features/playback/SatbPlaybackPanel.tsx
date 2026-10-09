import type { VoiceName } from '../../music/satb'
import type { VocalPart } from '../../music/types'
import { secondsToTicks, ticksToSeconds } from '../../audio/playback/timing'
import { useSatbPlayback } from './useSatbPlayback'

type Props = { parts: VocalPart[] }

const voices: VoiceName[] = ['soprano', 'alto', 'tenor', 'bass']
const voiceLabels: Record<VoiceName, string> = { alto: 'Contralto', bass: 'Baixo', soprano: 'Soprano', tenor: 'Tenor' }

function formatTime(ticks: number, tempoBpm: number) {
  const seconds = Math.floor(ticksToSeconds(ticks, tempoBpm))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function SatbPlaybackPanel({ parts }: Props) {
  const playback = useSatbPlayback(parts)
  const selectedVoice = playback.voiceSelection.length === 1 ? playback.voiceSelection[0] : null
  const seekStep = Math.max(1, Math.round(secondsToTicks(0.1, playback.tempoBpm)))

  if (!playback.isSupported) return <section className="playback-workspace unsupported" aria-labelledby="playback-title"><p className="eyebrow">Instrumento virtual · Lote 09</p><h3 id="playback-title">Reprodução indisponível neste navegador</h3><p>Este navegador não expõe a Web Audio API necessária para tocar as notas SATB localmente.</p></section>

  return <section className="playback-workspace" aria-labelledby="playback-title"><div className="playback-heading"><div><p className="eyebrow">Instrumento virtual · Lote 09</p><h3 id="playback-title">Piano de estudo SATB</h3></div><span className={`playback-status ${playback.status}`}>{playback.status === 'playing' ? 'Tocando' : playback.status === 'paused' ? 'Pausado' : 'Pronto'}</span></div><p className="playback-intro">Piano sintetizado localmente pelo navegador. O transporte agenda as quatro vozes no relógio de áudio; nenhum som ou nota é enviado a um servidor.</p><div className="transport-controls"><button className="button primary" disabled={playback.status === 'playing'} onClick={playback.play} type="button">{playback.status === 'paused' ? 'Continuar' : 'Reproduzir'}</button><button className="button quiet" disabled={playback.status !== 'playing'} onClick={playback.pause} type="button">Pausar</button><button className="button quiet" disabled={playback.status === 'idle' && playback.positionTick === 0} onClick={playback.stop} type="button">Parar</button><button className="button quiet" onClick={playback.restart} type="button">Reiniciar</button></div><label className="playback-seek">Posição <input aria-label="Posição da reprodução" max={playback.endTick} min="0" onChange={(event) => playback.seek(Number(event.target.value))} step={seekStep} type="range" value={Math.min(playback.positionTick, playback.endTick)} /><span>{formatTime(playback.positionTick, playback.tempoBpm)} / {formatTime(playback.endTick, playback.tempoBpm)}</span></label><div className="playback-settings"><label>BPM<input aria-label="Andamento em BPM" max="220" min="40" onChange={(event) => playback.setTempoBpm(Number(event.target.value))} type="number" value={playback.tempoBpm} /></label><label className="loop-toggle"><input checked={playback.loop} onChange={(event) => playback.setLoop(event.target.checked)} type="checkbox" />Repetir arranjo</label></div><div className="voice-playback" aria-label="Audição por naipe"><div><strong>Ouvir</strong><span>{selectedVoice ? `${voiceLabels[selectedVoice]} isolado` : 'todos os naipes'}</span></div><button aria-pressed={selectedVoice === null} className={selectedVoice === null ? 'selected' : ''} onClick={() => playback.setVoiceSelection(voices)} type="button">Todos</button>{voices.map((voice) => <button aria-pressed={selectedVoice === voice} className={selectedVoice === voice ? `selected ${voice}` : voice} key={voice} onClick={() => playback.setVoiceSelection([voice])} type="button">{voiceLabels[voice]}{playback.activeVoices.includes(voice) ? ' · ativo' : ''}</button>)}</div>{playback.error ? <p className="playback-error" role="alert">{playback.error}</p> : null}<p className="playback-note">BPM altera a duração de execução, não a altura MIDI. Loop repete o arranjo inteiro; recortes de ensaio, mixer, pan e exportação virão em fases posteriores.</p></section>
}
