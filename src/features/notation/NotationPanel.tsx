import { useMemo, useState, type CSSProperties } from 'react'

import type { HarmonyAnalysis } from '../../music/harmony'
import { createNotationScore, scoreToMusicXml, validateNotationScore, type NotationClef, type NotationEvent } from '../../music/notation'
import type { VocalPart } from '../../music/types'

type Props = { analysis: HarmonyAnalysis; parts: VocalPart[] }

function pitchClass(value: number) {
  return ((value % 12) + 12) % 12
}

function diatonicIndex(midi: number) {
  const letterIndex = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pitchClass(midi)]
  return (Math.floor(midi / 12) - 1) * 7 + letterIndex
}

function referenceForClef(clef: NotationClef) {
  if (clef.sign === 'F') return diatonicIndex(53)
  if (clef.sign === 'C') return diatonicIndex(60)
  return diatonicIndex(clef.octaveChange ? 59 : 71)
}

function staffStep(event: NotationEvent, clef: NotationClef) {
  if (event.kind !== 'note' || event.pitchMidi === undefined) return 0
  return Math.max(-10, Math.min(10, diatonicIndex(event.pitchMidi) - referenceForClef(clef)))
}

function clefLabel(clef: NotationClef) {
  if (clef.sign === 'F') return 'clave de fá'
  if (clef.sign === 'C') return 'clave de dó'
  return clef.octaveChange ? 'clave de sol oitavada abaixo' : 'clave de sol'
}

function keyLabel(fifths: number) {
  if (fifths === 0) return 'sem acidentes'
  return `${Math.abs(fifths)} ${Math.abs(fifths) === 1 ? 'acidente' : 'acidentes'} ${fifths > 0 ? 'sustenido' : 'bemol'}${Math.abs(fifths) === 1 ? '' : 's'}`
}

export function NotationPanel({ analysis, parts }: Props) {
  const score = useMemo(() => createNotationScore(parts, analysis), [analysis, parts])
  const musicXml = useMemo(() => scoreToMusicXml(score), [score])
  const issues = useMemo(() => validateNotationScore(score), [score])
  const [selectedPartId, setSelectedPartId] = useState<'all' | string>('all')
  const selectedPart = selectedPartId === 'all' ? null : score.parts.find((part) => part.id === selectedPartId) ?? null
  const visibleParts = selectedPart ? [selectedPart] : score.parts
  const measureCount = visibleParts[0]?.measures.length ?? 0

  return <section className="notation-workspace" aria-labelledby="notation-title">
    <div className="notation-heading"><div><p className="eyebrow">Leitura musical · Lote 12</p><h4 id="notation-title">3 · Confira a partitura</h4></div><span>{score.parts.length} naipes · {measureCount} compasso{measureCount === 1 ? '' : 's'}</span></div>
    <p>Esta visualização é gerada pelas notas SATB atuais. Escolha a grade completa ou um naipe; no celular, a pauta rola somente na horizontal.</p>
    <div className="notation-meta" aria-label="Informações musicais"><span><strong>Armadura</strong>{score.key.label} · {keyLabel(score.key.fifths)}</span><span><strong>Compasso</strong>{score.meter.beats}/{score.meter.beatType}</span><span><strong>Andamento</strong>{score.tempoBpm} BPM</span></div>
    <div aria-label="Modo de visualização da partitura" className="notation-view-switch" role="tablist"><button aria-selected={!selectedPart} className={!selectedPart ? 'selected' : ''} onClick={() => setSelectedPartId('all')} role="tab" type="button">Partitura geral</button>{score.parts.map((part) => <button aria-selected={selectedPart?.id === part.id} className={selectedPart?.id === part.id ? 'selected' : ''} key={part.id} onClick={() => setSelectedPartId(part.id)} role="tab" type="button">{part.name}</button>)}</div>
    <div aria-label={selectedPart ? `Partitura de ${selectedPart.name}` : 'Partitura geral SATB'} className="notation-scroll" role="region" tabIndex={0}><div className="notation-sheet">{Array.from({ length: measureCount }, (_, measureIndex) => <article className="notation-measure" key={measureIndex}><header><span>Compasso {measureIndex + 1}</span>{!selectedPart ? score.chords.filter((chord) => chord.measureNumber === measureIndex + 1).map((chord) => <strong key={`${chord.offsetTicks}-${chord.symbol}`}>{chord.symbol}</strong>) : null}</header>{visibleParts.map((part) => { const measure = part.measures[measureIndex]; return <div className={`notation-staff ${part.id}`} key={part.id}><div className="notation-staff-label"><strong>{part.name}</strong><span>{clefLabel(part.clef)}</span></div><div className="notation-lines"><span className="notation-clef" aria-hidden="true">{part.clef.sign === 'F' ? '𝄢' : part.clef.sign === 'C' ? '𝄡' : '𝄞'}</span><div className="notation-events">{measure?.events.map((event, eventIndex) => <span aria-label={event.kind === 'rest' ? `Pausa de ${event.durationTicks} ticks` : `${event.spelling}, ${event.durationTicks} ticks${event.tieStart || event.tieStop ? ', ligada' : ''}`} className={`notation-event ${event.kind}`} key={`${event.startTick}-${eventIndex}`} style={{ flexGrow: event.durationTicks } as CSSProperties}>{event.kind === 'rest' ? <i aria-hidden="true">𝄽</i> : <><i aria-hidden="true" className="notation-notehead" style={{ '--staff-step': String(staffStep(event, part.clef)) } as CSSProperties} /><i aria-hidden="true" className="notation-stem" style={{ '--staff-step': String(staffStep(event, part.clef)) } as CSSProperties} />{event.tieStart ? <i aria-hidden="true" className="notation-tie">⌒</i> : null}<small>{event.spelling}</small></>}</span>)}</div></div></div>})}</article>)}</div></div>
    {issues.length > 0 ? <p className="notation-error" role="alert">{issues.join(' ')}</p> : <p className="notation-valid">Notas, durações, pausas e ligaduras foram organizadas por compasso a partir do arranjo atual.</p>}
    <details className="musicxml-details"><summary>Conferir MusicXML gerado <span>interoperabilidade em preparação</span></summary><p>O XML é real e descreve partes, claves, armadura, compasso, cifras, pausas e ligaduras. O download/exportação ficará disponível no Lote 14.</p><pre aria-label="MusicXML gerado">{musicXml}</pre></details>
  </section>
}
