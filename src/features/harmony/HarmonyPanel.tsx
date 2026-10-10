import { useState } from 'react'

import { analyzeHarmony, selectHarmonyCandidate, type HarmonicCandidate, type HarmonyAnalysis } from '../../music/harmony'
import type { NoteEvent } from '../../music/types'
import { SatbArrangementPanel } from '../satb/SatbArrangementPanel'

type Props = {
  confirmedMelody: { notes: NoteEvent[]; sourceId: string } | null
  onOpenMelody: () => void
  onUseStudyExample: () => void
}

function confidenceLabel(value: number) {
  if (value >= 0.8) return 'boa aderência'
  if (value >= 0.55) return 'aderência moderada'
  return 'revisar antes de usar'
}

function HarmonyResult({ analysis, melody, onSelectCandidate, sourceId }: { analysis: HarmonyAnalysis; melody: NoteEvent[]; onSelectCandidate: (candidate: HarmonicCandidate) => void; sourceId: string }) {
  const alternatives = analysis.candidates.filter((candidate) => !analysis.chords.includes(candidate)).sort((first, second) => second.score - first.score).slice(0, 3)
  return <div className="harmony-result" aria-live="polite">
    <div className="harmony-summary"><div><p className="eyebrow">Contexto tonal candidato</p><strong>{analysis.tonalContext.label}</strong><span>{Math.round(analysis.tonalContext.confidence * 100)}% da duração da melodia está na escala candidata.</span></div><div><p className="eyebrow">Leitura vertical</p><strong>{confidenceLabel(analysis.confidence)}</strong><span>{analysis.phrases.length} frase{analysis.phrases.length === 1 ? '' : 's'} · {analysis.conflicts.length} conflito{analysis.conflicts.length === 1 ? '' : 's'} sinalizado{analysis.conflicts.length === 1 ? '' : 's'}</span></div></div>
    <ol className="harmony-chords" aria-label="Progressão harmônica proposta">{analysis.chords.map((candidate, index) => <li key={candidate.phraseId}><span>Frase {index + 1}</span><strong>{candidate.symbol}</strong><small>{candidate.degree} · {candidate.function === 'tonic' ? 'tônica' : candidate.function === 'predominant' ? 'pré-dominante' : 'dominante'}</small><em>{Math.round(candidate.score * 100)}% de encaixe</em></li>)}</ol>
    <section className="harmony-chord-editor" aria-labelledby="harmony-chord-editor-title"><div><p className="eyebrow">1 · Escolha os acordes</p><h4 id="harmony-chord-editor-title">Editar a progressão proposta</h4></div><p>Troque um acorde apenas por um candidato calculado para a mesma frase. Depois, gere novamente o SATB para aplicar a decisão.</p><div>{analysis.chords.map((selected, index) => <label key={selected.phraseId}>Frase {index + 1}<select aria-label={`Acorde da frase ${index + 1}`} onChange={(event) => { const candidate = analysis.candidates[Number(event.target.value)]; if (candidate) onSelectCandidate(candidate) }} value={analysis.candidates.findIndex((candidate) => candidate === selected)}>{analysis.candidates.map((candidate, candidateIndex) => candidate.phraseId === selected.phraseId ? <option key={`${candidateIndex}-${candidate.symbol}`} value={candidateIndex}>{candidate.symbol} · {Math.round(candidate.score * 100)}%</option> : null)}</select></label>)}</div></section>
    <div className="harmony-details"><section><h4>Candidatos alternativos</h4>{alternatives.length > 0 ? <ul>{alternatives.map((candidate) => <li key={`${candidate.phraseId}-${candidate.symbol}`}><strong>{candidate.symbol}</strong><span>frase {candidate.phraseId.replace('phrase-', '')} · {Math.round(candidate.score * 100)}%</span></li>)}</ul> : <p>Não há alternativas suficientes para esta leitura.</p>}</section><section><h4>Conflitos a revisar</h4>{analysis.conflicts.length > 0 ? <ul>{analysis.conflicts.map((conflict) => <li key={`${conflict.phraseId}-${conflict.noteId}`}><strong>{conflict.kind === 'out-of-scale' ? 'Fora da escala' : 'Nota não pertencente ao acorde'}</strong><span>nota {conflict.noteId} · {conflict.phraseId}</span></li>)}</ul> : <p>Não foram encontrados conflitos entre as notas e os acordes escolhidos.</p>}</section></div>
    <SatbArrangementPanel analysis={analysis} melody={melody} sourceId={sourceId} />
  </div>
}

export function HarmonyPanel({ confirmedMelody, onOpenMelody, onUseStudyExample }: Props) {
  const [analysisEntry, setAnalysisEntry] = useState<{ analysis: HarmonyAnalysis; sourceId: string } | null>(null)
  const analysis = analysisEntry && confirmedMelody && analysisEntry.sourceId === confirmedMelody.sourceId ? analysisEntry.analysis : null

  if (!confirmedMelody) return <section className="harmony-workspace empty" aria-labelledby="harmony-title"><p className="eyebrow">Harmonização guiada</p><h2 id="harmony-title">Vamos criar a sua primeira harmonia</h2><ol className="harmony-guide"><li><strong>1. Tenha notas</strong><span>Grave ou importe um áudio e execute o reconhecimento de notas.</span></li><li><strong>2. Confirme a melodia</strong><span>Na etapa Melodia, revise o que quiser e toque em “Confirmar melodia”.</span></li><li><strong>3. Analise e gere SATB</strong><span>Volte aqui, analise a harmonia e gere as quatro vozes.</span></li></ol><div className="harmony-guide-actions"><button className="button primary" onClick={onOpenMelody} type="button">Ir para Melodia</button><button className="button quiet" onClick={onUseStudyExample} type="button">Usar exemplo de estudo</button></div><p>O exemplo cria uma pequena melodia local identificada como estudo; ele usa o mesmo motor harmônico e SATB, não simula uma gravação sua.</p></section>

  return <section className="harmony-workspace" aria-labelledby="harmony-title"><div className="workspace-heading"><div><p className="eyebrow">Harmonização guiada</p><h2 id="harmony-title">Análise harmônica da melodia</h2></div><button className="button primary" type="button" onClick={() => { const result = analyzeHarmony(confirmedMelody.notes); if (result) setAnalysisEntry({ analysis: result, sourceId: confirmedMelody.sourceId }) }}>{analysis ? 'Analisar novamente' : '1 · Analisar harmonia'}</button></div><div className="harmony-progress"><span className="done">Melodia confirmada</span><span className={analysis ? 'done' : ''}>Acordes analisados</span><span className={analysis ? 'ready' : ''}>Gerar SATB</span></div><p className="workspace-intro">A análise é local e preserva integralmente a melodia confirmada, inclusive suas notas bloqueadas. Ela propõe acordes por frase, função harmônica e conflitos; o botão “Gerar arranjo SATB” aparecerá depois da análise. Ela não reconhece acordes de um áudio polifônico.</p>{confirmedMelody.sourceId === 'study-example' ? <p className="study-example-label">Exemplo de estudo local: troque para sua própria melodia quando ela estiver confirmada.</p> : null}{analysis ? <HarmonyResult analysis={analysis} melody={confirmedMelody.notes} onSelectCandidate={(candidate) => setAnalysisEntry((current) => current ? { ...current, analysis: selectHarmonyCandidate(current.analysis, candidate, confirmedMelody.notes) } : current)} sourceId={confirmedMelody.sourceId} /> : <div className="harmony-placeholder"><strong>Pronto para analisar</strong><span>{confirmedMelody.notes.length} nota{confirmedMelody.notes.length === 1 ? '' : 's'} confirmada{confirmedMelody.notes.length === 1 ? '' : 's'} · toque em “1 · Analisar harmonia”.</span></div>}</section>
}
