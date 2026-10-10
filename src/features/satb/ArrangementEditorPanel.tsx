import { useMemo, useState } from 'react'

import type { VoiceName } from '../../music/satb'
import type { VocalPart } from '../../music/types'

type Props = {
  canRedo: boolean
  canUndo: boolean
  changes: Array<{ note: VocalPart['notes'][number]; voice: VoiceName }>
  issues: Array<{ code: string; message: string }>
  onRedo: () => void
  onRegeneratePhrase: (phraseId: string) => void
  onToggleLock: (voice: VoiceName, noteId: string) => void
  onUndo: () => void
  onUpdate: (voice: VoiceName, noteId: string, patch: { durationTicks: number; pitchMidi: number; startTick: number }) => void
  parts: VocalPart[]
}

const voices: VoiceName[] = ['soprano', 'alto', 'tenor', 'bass']
const voiceLabels: Record<VoiceName, string> = { alto: 'Contralto', bass: 'Baixo', soprano: 'Soprano', tenor: 'Tenor' }

export function ArrangementEditorPanel({ canRedo, canUndo, changes, issues, onRedo, onRegeneratePhrase, onToggleLock, onUndo, onUpdate, parts }: Props) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('soprano')
  const selectedPart = parts.find((part) => part.id === selectedVoice) ?? parts[0]
  const [selectedNoteId, setSelectedNoteId] = useState(selectedPart?.notes[0]?.id ?? '')
  const activeNoteId = selectedPart?.notes.some((note) => note.id === selectedNoteId) ? selectedNoteId : selectedPart?.notes[0]?.id ?? ''
  const selectedNote = selectedPart?.notes.find((note) => note.id === activeNoteId) ?? selectedPart?.notes[0] ?? null
  const phrases = useMemo(() => [...new Set(parts.flatMap((part) => part.notes.map((note) => note.phraseId).filter((value): value is string => Boolean(value))))], [parts])
  const [phraseId, setPhraseId] = useState(phrases[0] ?? '')
  const activePhraseId = phrases.includes(phraseId) ? phraseId : phrases[0] ?? ''

  if (!selectedPart || !selectedNote) return null

  return <section className="arrangement-editor" aria-labelledby="arrangement-editor-title">
    <div className="arrangement-editor-heading"><div><p className="eyebrow">Edição de arranjo · Lote 11</p><h4 id="arrangement-editor-title">Ajuste uma voz com segurança</h4></div><div><button className="button quiet" disabled={!canUndo} onClick={onUndo} type="button">Desfazer</button><button className="button quiet" disabled={!canRedo} onClick={onRedo} type="button">Refazer</button></div></div>
    <p>Selecione uma voz e uma nota. A alteração só é aplicada se mantiver tessitura, uma nota por voz, ordem SATB e sem quintas ou oitavas paralelas.</p>
    <div className="arrangement-editor-selectors"><label>Voz<select aria-label="Voz a editar" onChange={(event) => setSelectedVoice(event.target.value as VoiceName)} value={selectedVoice}>{voices.map((voice) => <option key={voice} value={voice}>{voiceLabels[voice]}</option>)}</select></label><label>Nota<select aria-label="Nota do arranjo a editar" onChange={(event) => setSelectedNoteId(event.target.value)} value={selectedNote.id}>{selectedPart.notes.map((note) => <option key={note.id} value={note.id}>{note.spelling} · {note.startTick} ticks{note.locked ? ' · bloqueada' : ''}</option>)}</select></label></div>
    <form className="arrangement-note-form" key={selectedNote.id} onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); onUpdate(selectedVoice, selectedNote.id, { durationTicks: Number(values.get('durationTicks')), pitchMidi: Number(values.get('pitchMidi')), startTick: Number(values.get('startTick')) }) }}><label>Altura MIDI<input defaultValue={selectedNote.pitchMidi} disabled={selectedNote.locked} max="127" min="0" name="pitchMidi" type="number" /></label><label>Início<input defaultValue={selectedNote.startTick} disabled={selectedNote.locked} min="0" name="startTick" type="number" /></label><label>Duração<input defaultValue={selectedNote.durationTicks} disabled={selectedNote.locked} min="1" name="durationTicks" type="number" /></label><button className="button primary" disabled={selectedNote.locked} type="submit">Aplicar nota</button><button className="button quiet" onClick={() => onToggleLock(selectedVoice, selectedNote.id)} type="button">{selectedNote.locked ? 'Desbloquear nota' : 'Bloquear nota'}</button></form>
    <div className="phrase-regeneration"><label>Frase<select aria-label="Frase para regenerar" onChange={(event) => setPhraseId(event.target.value)} value={activePhraseId}>{phrases.map((phrase) => <option key={phrase} value={phrase}>Frase {phrase.replace('phrase-', '')}</option>)}</select></label><button className="button quiet" disabled={!activePhraseId} onClick={() => onRegeneratePhrase(activePhraseId)} type="button">Regenerar somente esta frase</button></div>
    {issues.length > 0 ? <ul className="arrangement-edit-issues" role="alert">{issues.map((issue) => <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>)}</ul> : null}
    <details className="arrangement-comparison"><summary>Comparar alterações <span>{changes.length} nota{changes.length === 1 ? '' : 's'} alterada{changes.length === 1 ? '' : 's'}</span></summary>{changes.length > 0 ? <ul>{changes.map(({ note, voice }) => <li key={`${voice}-${note.id}`}><strong>{voiceLabels[voice]}</strong><span>{note.spelling} · {note.startTick} ticks{note.locked ? ' · bloqueada' : ''}</span></li>)}</ul> : <p>O arranjo ainda corresponde à alternativa gerada.</p>}</details>
  </section>
}
