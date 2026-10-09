import { useState } from 'react'

import type { HarmonyAnalysis } from '../../music/harmony'
import { defaultVoiceRanges, generateSatbArrangements, type SatbGenerationResult, type VoiceName, type VoiceRange } from '../../music/satb'
import type { NoteEvent, VocalPart } from '../../music/types'

type Props = {
  analysis: HarmonyAnalysis
  melody: NoteEvent[]
  sourceId: string
}

const voices: VoiceName[] = ['soprano', 'alto', 'tenor', 'bass']
const voiceLabels: Record<VoiceName, string> = { alto: 'Contralto', bass: 'Baixo', soprano: 'Soprano', tenor: 'Tenor' }

function cloneRanges() {
  return Object.fromEntries(voices.map((voice) => [voice, { ...defaultVoiceRanges[voice] }])) as Record<VoiceName, VoiceRange>
}

function rangeKey(ranges: Record<VoiceName, VoiceRange>) {
  return voices.flatMap((voice) => [voice, ranges[voice].minimumMidi, ranges[voice].maximumMidi, ranges[voice].comfortableMinimumMidi, ranges[voice].comfortableMaximumMidi]).join(':')
}

function isRangeSetValid(ranges: Record<VoiceName, VoiceRange>) {
  return voices.every((voice) => {
    const range = ranges[voice]
    return range.minimumMidi <= range.comfortableMinimumMidi && range.comfortableMinimumMidi <= range.comfortableMaximumMidi && range.comfortableMaximumMidi <= range.maximumMidi
  })
}

function noteList(part: VocalPart) {
  return part.notes.map((note) => note.spelling).join(' · ')
}

function ArrangementView({ arrangement }: { arrangement: NonNullable<SatbGenerationResult['alternatives'][number]> }) {
  const warnings = arrangement.diagnostics.filter((diagnostic) => diagnostic.severity === 'warning')
  return <div className="satb-result" aria-live="polite"><div className="satb-parts" aria-label="Partes do arranjo SATB">{arrangement.parts.map((part) => <article className={`satb-part ${part.id}`} key={part.id}><div><p className="eyebrow">{part.role}</p><h4>{part.name}</h4></div><strong>{part.notes.length} nota{part.notes.length === 1 ? '' : 's'}</strong><span>{noteList(part)}</span><small>Faixa {part.rangeMinimumMidi}–{part.rangeMaximumMidi} MIDI</small></article>)}</div>{warnings.length > 0 ? <ul className="satb-warnings">{warnings.map((warning) => <li key={warning.message}>{warning.message}</li>)}</ul> : <p className="satb-valid">Validação estrutural concluída: sem cruzamentos, paralelismos perfeitos ou violações de tessitura.</p>}<p className="satb-limit">As vozes foram geradas localmente para estudo e revisão. Reprodução, edição por nota e exportação serão adicionadas em lotes posteriores.</p></div>
}

export function SatbArrangementPanel({ analysis, melody, sourceId }: Props) {
  const [melodyVoice, setMelodyVoice] = useState<VoiceName>('soprano')
  const [ranges, setRanges] = useState<Record<VoiceName, VoiceRange>>(cloneRanges)
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null)
  const [resultEntry, setResultEntry] = useState<{ key: string; result: SatbGenerationResult } | null>(null)
  const key = `${sourceId}:${melodyVoice}:${rangeKey(ranges)}:${analysis.chords.map((chord) => chord.symbol).join(',')}`
  const result = resultEntry?.key === key ? resultEntry.result : null
  const selected = result?.alternatives.find((alternative) => alternative.id === selectedAlternativeId) ?? result?.alternatives[0] ?? null
  const rangeIsValid = isRangeSetValid(ranges)

  const updateRange = (voice: VoiceName, field: keyof VoiceRange, value: string) => {
    const nextValue = Math.max(0, Math.min(127, Number(value)))
    setRanges((current) => ({ ...current, [voice]: { ...current[voice], [field]: nextValue } }))
  }

  return <section className="satb-workspace" aria-labelledby="satb-title"><div className="satb-heading"><div><p className="eyebrow">Composição vocal · Lote 08</p><h3 id="satb-title">Arranjo SATB</h3></div><span>{melody.length} nota{melody.length === 1 ? '' : 's'} preservada{melody.length === 1 ? '' : 's'}</span></div><p className="satb-intro">Escolha em qual naipe a melodia permanece. O motor procura as quatro vozes juntas, respeita as tessituras configuradas e rejeita cruzamentos e quintas ou oitavas paralelas.</p><div className="satb-controls"><label>Melodia principal<select value={melodyVoice} onChange={(event) => setMelodyVoice(event.target.value as VoiceName)}>{voices.map((voice) => <option key={voice} value={voice}>{voiceLabels[voice]}</option>)}</select></label><button className="button primary" disabled={!rangeIsValid} type="button" onClick={() => { const next = generateSatbArrangements(melody, analysis, melodyVoice, ranges); setSelectedAlternativeId(next.alternatives[0]?.id ?? null); setResultEntry({ key, result: next }) }}>Gerar arranjo SATB</button></div><details className="satb-ranges"><summary>Configurar tessituras absolutas</summary><p>Os intervalos abaixo são usados de verdade na busca. O conforto vocal continua nos valores de referência desta versão.</p><div>{voices.map((voice) => <label key={voice}><strong>{voiceLabels[voice]}</strong><span>mín.<input aria-label={`Mínimo MIDI de ${voiceLabels[voice]}`} max="127" min="0" onChange={(event) => updateRange(voice, 'minimumMidi', event.target.value)} type="number" value={ranges[voice].minimumMidi} /></span><span>máx.<input aria-label={`Máximo MIDI de ${voiceLabels[voice]}`} max="127" min="0" onChange={(event) => updateRange(voice, 'maximumMidi', event.target.value)} type="number" value={ranges[voice].maximumMidi} /></span></label>)}</div></details>{!rangeIsValid ? <p className="satb-error" role="alert">Cada faixa precisa conter sua região confortável. Corrija os limites antes de gerar.</p> : null}{result?.error ? <p className="satb-error" role="alert">{result.error}</p> : null}{result && !result.error && result.alternatives.length > 0 ? <><div className="satb-alternatives" aria-label="Alternativas SATB">{result.alternatives.map((alternative, index) => <button aria-pressed={selected?.id === alternative.id} className={selected?.id === alternative.id ? 'selected' : ''} key={alternative.id} onClick={() => setSelectedAlternativeId(alternative.id)} type="button"><strong>Alternativa {index + 1}</strong><span>qualidade {alternative.score}/100</span></button>)}</div>{selected ? <ArrangementView arrangement={selected} /> : null}</> : null}</section>
}
