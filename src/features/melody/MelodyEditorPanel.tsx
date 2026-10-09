import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'

import { defaultQuantizationTicks } from '../../music/editor'
import { midiToSpelling } from '../../music/pitch'
import { PPQ, type NoteEvent } from '../../music/types'
import { useMelodyEditor } from './useMelodyEditor'

type Props = {
  onConfirmationChange?: (melody: { notes: NoteEvent[]; sourceId: string } | null) => void
  sourceId: string | null
  sourceNotes: NoteEvent[]
}

function pianoRange(notes: NoteEvent[], verticalZoom: number) {
  const pitches = notes.map((note) => note.pitchMidi)
  const center = pitches.length === 0 ? 60 : Math.round((Math.min(...pitches) + Math.max(...pitches)) / 2)
  const padding = verticalZoom === 2 ? 8 : 5
  const minimum = Math.max(0, Math.min(...pitches, center) - padding)
  const maximum = Math.min(127, Math.max(...pitches, center) + padding)
  return { maximum: Math.max(minimum + 1, maximum), minimum }
}

function PianoRoll({ notes, selectedNoteId, onSelect, horizontalZoom, verticalZoom }: { horizontalZoom: number; notes: NoteEvent[]; onSelect: (noteId: string) => void; selectedNoteId: string | null; verticalZoom: number }) {
  const { maximum, minimum } = useMemo(() => pianoRange(notes, verticalZoom), [notes, verticalZoom])
  const rows = Array.from({ length: maximum - minimum + 1 }, (_, index) => maximum - index)
  const ticksPerColumn = PPQ / (2 * horizontalZoom)
  const greatestEnd = Math.max(ticksPerColumn * 8, ...notes.map((note) => note.startTick + note.durationTicks))
  const columns = Math.min(128, Math.max(16, Math.ceil(greatestEnd / ticksPerColumn) + 1))
  const sharedStyle: CSSProperties = { gridTemplateColumns: `repeat(${columns}, minmax(2rem, 1fr))`, gridTemplateRows: `repeat(${rows.length}, var(--piano-row-size, 2rem))` }

  return <div className="piano-roll-shell">
    <div className="piano-roll-labels" aria-hidden="true"><span>Altura</span><span>Tempo em ticks · {ticksPerColumn} por célula</span></div>
    <div className="piano-roll-viewport">
      <div className="piano-keyboard" style={{ gridTemplateRows: `repeat(${rows.length}, var(--piano-row-size, 2rem))` }} aria-hidden="true">{rows.map((midi) => <span className={midi % 12 === 1 || midi % 12 === 3 || midi % 12 === 6 || midi % 12 === 8 || midi % 12 === 10 ? 'black-key' : ''} key={midi}>{midiToSpelling(midi)}</span>)}</div>
      <div className="piano-roll-grid" style={sharedStyle} role="list" aria-label="Piano roll da melodia">
        {notes.map((note) => {
          const row = maximum - note.pitchMidi + 1
          const columnStart = Math.floor(note.startTick / ticksPerColumn) + 1
          const columnEnd = Math.max(columnStart + 1, Math.ceil((note.startTick + note.durationTicks) / ticksPerColumn) + 1)
          const style: CSSProperties = { gridColumn: `${columnStart} / ${columnEnd}`, gridRow: row }
          const className = ['piano-note', note.id === selectedNoteId ? 'selected' : '', note.locked ? 'locked' : ''].filter(Boolean).join(' ')
          return <button className={className} key={note.id} onClick={() => onSelect(note.id)} style={style} type="button" role="listitem" aria-pressed={note.id === selectedNoteId} aria-label={`${note.spelling}, início ${note.startTick}, duração ${note.durationTicks}${note.locked ? ', bloqueada' : ''}`}>{note.spelling}{note.locked ? ' · bloqueada' : ''}</button>
        })}
      </div>
    </div>
  </div>
}

function Inspector({ note, onDelete, onDuplicate, onMerge, onSplit, onToggleLock, onUpdate }: { note: NoteEvent; onDelete: () => void; onDuplicate: () => void; onMerge: () => void; onSplit: () => void; onToggleLock: () => void; onUpdate: (patch: { durationTicks: number; pitchMidi: number; startTick: number }) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    onUpdate({ durationTicks: Number(values.get('durationTicks')), pitchMidi: Number(values.get('pitchMidi')), startTick: Number(values.get('startTick')) })
  }

  return <section className="note-inspector" aria-labelledby="note-inspector-title">
    <div><p className="eyebrow">Nota selecionada</p><h4 id="note-inspector-title">{note.spelling}{note.locked ? ' · bloqueada' : ''}</h4></div>
    <form key={note.id} onSubmit={submit}>
      <label>Altura MIDI<input defaultValue={note.pitchMidi} disabled={note.locked} min="0" max="127" name="pitchMidi" type="number" /></label>
      <label>Início (ticks)<input defaultValue={note.startTick} disabled={note.locked} min="0" name="startTick" type="number" /></label>
      <label>Duração (ticks)<input defaultValue={note.durationTicks} disabled={note.locked} min="1" name="durationTicks" type="number" /></label>
      <button className="button quiet" disabled={note.locked} type="submit">Aplicar edição</button>
    </form>
    <div className="note-actions">
      <button className="button quiet" type="button" onClick={onToggleLock}>{note.locked ? 'Desbloquear' : 'Bloquear nota'}</button>
      <button className="button quiet" disabled={note.locked} type="button" onClick={onSplit}>Dividir</button>
      <button className="button quiet" disabled={note.locked} type="button" onClick={onDuplicate}>Duplicar</button>
      <button className="button quiet" disabled={note.locked} type="button" onClick={onMerge}>Unir à próxima</button>
      <button className="button danger" disabled={note.locked} type="button" onClick={onDelete}>Excluir</button>
    </div>
    <p>{note.locked ? 'Notas bloqueadas não sofrem edição, exclusão, divisão, união ou quantização. Desbloqueie-a explicitamente para alterar.' : 'Toda edição passa a ter origem manual e pode ser desfeita.'}</p>
  </section>
}

export function MelodyEditorPanel({ onConfirmationChange, sourceId, sourceNotes }: Props) {
  const editor = useMelodyEditor(sourceId, sourceNotes)
  const [horizontalZoom, setHorizontalZoom] = useState(1)
  const [quantizationTicks, setQuantizationTicks] = useState(defaultQuantizationTicks)
  const [verticalZoom, setVerticalZoom] = useState(1)
  const selectedIndex = editor.selectedNote ? editor.notes.findIndex((note) => note.id === editor.selectedNote?.id) : -1

  useEffect(() => {
    onConfirmationChange?.(editor.confirmed && sourceId ? { notes: editor.notes.map((note) => ({ ...note })), sourceId } : null)
  }, [editor.confirmed, editor.notes, onConfirmationChange, sourceId])

  const add = () => {
    const selected = editor.selectedNote
    editor.addNote({ durationTicks: selected?.durationTicks ?? defaultQuantizationTicks, pitchMidi: selected?.pitchMidi ?? 60, startTick: selected ? selected.startTick + selected.durationTicks : 0 })
  }

  const removeSelected = () => {
    const nextSelection = editor.notes[selectedIndex + 1]?.id ?? editor.notes[selectedIndex - 1]?.id ?? null
    if (editor.selectedNote) editor.deleteNote(editor.selectedNote.id)
    editor.setSelectedNoteId(nextSelection)
  }

  if (sourceId === null) return <section className="melody-editor empty" aria-labelledby="melody-editor-title"><p className="eyebrow">Correção musical · Lote 06</p><h3 id="melody-editor-title">Editor de melodia</h3><p>Execute o reconhecimento de notas para abrir uma cópia editável da melodia nesta sessão.</p></section>

  return <section className="melody-editor" aria-labelledby="melody-editor-title">
    <div className="melody-editor-heading"><div><p className="eyebrow">Correção musical · Lote 06</p><h3 id="melody-editor-title">Editor de melodia</h3></div><span className={editor.confirmed ? 'melody-status confirmed' : 'melody-status'}>{editor.confirmed ? 'Melodia confirmada' : 'Revisão em andamento'}</span></div>
    <p className="melody-editor-intro">Edite a cópia musical derivada da transcrição. O áudio original permanece intacto e nenhum ajuste é enviado para um servidor.</p>
    <div className="melody-toolbar" aria-label="Ferramentas do editor"><button className="button quiet" type="button" disabled={!editor.canUndo} onClick={editor.undo}>Desfazer</button><button className="button quiet" type="button" disabled={!editor.canRedo} onClick={editor.redo}>Refazer</button><label>Grade<select value={quantizationTicks} onChange={(event) => setQuantizationTicks(Number(event.target.value))}><option value={240}>1/16 · 240 ticks</option><option value={480}>1/8 · 480 ticks</option><option value={960}>1/4 · 960 ticks</option></select></label><button className="button quiet" type="button" disabled={editor.notes.length === 0} onClick={() => editor.quantize(quantizationTicks)}>Quantizar</button><button className="button quiet" type="button" onClick={add}>Adicionar nota</button></div>
    <div className="piano-roll-controls"><span>Zoom</span><button className="button quiet" disabled={horizontalZoom === 1} type="button" onClick={() => setHorizontalZoom(1)}>Horizontal −</button><button className="button quiet" disabled={horizontalZoom === 2} type="button" onClick={() => setHorizontalZoom(2)}>Horizontal +</button><button className="button quiet" disabled={verticalZoom === 1} type="button" onClick={() => setVerticalZoom(1)}>Vertical −</button><button className="button quiet" disabled={verticalZoom === 2} type="button" onClick={() => setVerticalZoom(2)}>Vertical +</button></div>
    {editor.notes.length > 0 ? <PianoRoll horizontalZoom={horizontalZoom} notes={editor.notes} onSelect={editor.setSelectedNoteId} selectedNoteId={editor.selectedNoteId} verticalZoom={verticalZoom} /> : <p className="melody-editor-empty">Não há notas no editor. Adicione uma nota manual ou execute uma nova transcrição.</p>}
    <div className="melody-editor-details"><section className="key-assistance" aria-labelledby="key-assistance-title"><p className="eyebrow">Análise tonal assistida</p><h4 id="key-assistance-title">{editor.keyCandidate ? editor.keyCandidate.label : 'Sem notas para analisar'}</h4><p>{editor.keyCandidate ? `${Math.round(editor.keyCandidate.confidence * 100)}% da duração está na escala candidata. Isto é uma pista local, não uma tonalidade confirmada.` : 'A análise será atualizada quando houver notas.'}</p></section>{editor.selectedNote ? <Inspector note={editor.selectedNote} onDelete={removeSelected} onDuplicate={() => editor.duplicateNote(editor.selectedNote!.id)} onMerge={() => editor.mergeNoteWithNext(editor.selectedNote!.id)} onSplit={() => editor.splitNote(editor.selectedNote!.id)} onToggleLock={() => editor.toggleNoteLock(editor.selectedNote!.id)} onUpdate={(patch) => editor.updateNote(editor.selectedNote!.id, patch)} /> : null}</div>
    <div className="melody-confirmation"><div><strong>{editor.confirmed ? 'Melodia confirmada nesta sessão' : 'Confirme a melodia antes de harmonizar'}</strong><span>{editor.lastOperation ? `Última operação: ${editor.lastOperation}.` : 'Selecione uma nota no piano roll para corrigir altura, tempo ou duração.'}</span></div><button className="button primary" disabled={editor.notes.length === 0 || editor.confirmed} type="button" onClick={editor.confirm}>{editor.confirmed ? 'Melodia confirmada' : 'Confirmar melodia'}</button></div>
  </section>
}
