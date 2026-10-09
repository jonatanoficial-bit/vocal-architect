import { useState } from 'react'

import { analyzeHarmony, type HarmonyAnalysis } from '../../music/harmony'
import type { NoteEvent } from '../../music/types'
import { SatbArrangementPanel } from '../satb/SatbArrangementPanel'

type Props = {
  confirmedMelody: { notes: NoteEvent[]; sourceId: string } | null
}

function confidenceLabel(value: number) {
  if (value >= 0.8) return 'boa aderência'
  if (value >= 0.55) return 'aderência moderada'
  return 'revisar antes de usar'
}

function HarmonyResult({ analysis, melody, sourceId }: { analysis: HarmonyAnalysis; melody: NoteEvent[]; sourceId: string }) {
  const alternatives = analysis.candidates.filter((candidate) => !analysis.chords.includes(candidate)).sort((first, second) => second.score - first.score).slice(0, 3)
  return <div className="harmony-result" aria-live="polite">
    <div className="harmony-summary"><div><p className="eyebrow">Contexto tonal candidato</p><strong>{analysis.tonalContext.label}</strong><span>{Math.round(analysis.tonalContext.confidence * 100)}% da duração da melodia está na escala candidata.</span></div><div><p className="eyebrow">Leitura vertical</p><strong>{confidenceLabel(analysis.confidence)}</strong><span>{analysis.phrases.length} frase{analysis.phrases.length === 1 ? '' : 's'} · {analysis.conflicts.length} conflito{analysis.conflicts.length === 1 ? '' : 's'} sinalizado{analysis.conflicts.length === 1 ? '' : 's'}</span></div></div>
    <ol className="harmony-chords" aria-label="Progressão harmônica proposta">{analysis.chords.map((candidate, index) => <li key={candidate.phraseId}><span>Frase {index + 1}</span><strong>{candidate.symbol}</strong><small>{candidate.degree} · {candidate.function === 'tonic' ? 'tônica' : candidate.function === 'predominant' ? 'pré-dominante' : 'dominante'}</small><em>{Math.round(candidate.score * 100)}% de encaixe</em></li>)}</ol>
    <div className="harmony-details"><section><h4>Candidatos alternativos</h4>{alternatives.length > 0 ? <ul>{alternatives.map((candidate) => <li key={`${candidate.phraseId}-${candidate.symbol}`}><strong>{candidate.symbol}</strong><span>frase {candidate.phraseId.replace('phrase-', '')} · {Math.round(candidate.score * 100)}%</span></li>)}</ul> : <p>Não há alternativas suficientes para esta leitura.</p>}</section><section><h4>Conflitos a revisar</h4>{analysis.conflicts.length > 0 ? <ul>{analysis.conflicts.map((conflict) => <li key={`${conflict.phraseId}-${conflict.noteId}`}><strong>{conflict.kind === 'out-of-scale' ? 'Fora da escala' : 'Nota não pertencente ao acorde'}</strong><span>nota {conflict.noteId} · {conflict.phraseId}</span></li>)}</ul> : <p>Não foram encontrados conflitos entre as notas e os acordes escolhidos.</p>}</section></div>
    <SatbArrangementPanel analysis={analysis} melody={melody} sourceId={sourceId} />
  </div>
}

export function HarmonyPanel({ confirmedMelody }: Props) {
  const [analysisEntry, setAnalysisEntry] = useState<{ analysis: HarmonyAnalysis; sourceId: string } | null>(null)
  const analysis = analysisEntry && confirmedMelody && analysisEntry.sourceId === confirmedMelody.sourceId ? analysisEntry.analysis : null

  if (!confirmedMelody) return <section className="harmony-workspace empty" aria-labelledby="harmony-title"><p className="eyebrow">Motor harmônico · Lote 07</p><h2 id="harmony-title">Harmonia começa com uma melodia confirmada</h2><p>Abra <strong>Melodia</strong>, revise a linha vocal e use “Confirmar melodia”. Nenhuma harmonia será criada sobre uma leitura que ainda não foi validada.</p></section>

  return <section className="harmony-workspace" aria-labelledby="harmony-title"><div className="workspace-heading"><div><p className="eyebrow">Motor harmônico · Lote 07</p><h2 id="harmony-title">Análise harmônica da melodia</h2></div><button className="button primary" type="button" onClick={() => { const result = analyzeHarmony(confirmedMelody.notes); if (result) setAnalysisEntry({ analysis: result, sourceId: confirmedMelody.sourceId }) }}>Analisar harmonia</button></div><p className="workspace-intro">A análise é local e preserva integralmente a melodia confirmada, inclusive suas notas bloqueadas. Ela propõe acordes por frase, função harmônica e conflitos; quando solicitada, gera alternativas SATB válidas. Ela não reconhece acordes de um áudio polifônico.</p>{analysis ? <HarmonyResult analysis={analysis} melody={confirmedMelody.notes} sourceId={confirmedMelody.sourceId} /> : <div className="harmony-placeholder"><strong>Pronto para analisar</strong><span>{confirmedMelody.notes.length} nota{confirmedMelody.notes.length === 1 ? '' : 's'} confirmada{confirmedMelody.notes.length === 1 ? '' : 's'} · clique em “Analisar harmonia” para gerar candidatos reais nesta sessão.</span></div>}</section>
}
