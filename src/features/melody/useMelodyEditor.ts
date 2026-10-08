import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { addNote, defaultQuantizationTicks, deleteNote, detectAssistedKey, duplicateNote, mergeNoteWithNext, quantizeNotes, splitNote, toggleNoteLock, updateNote, type NotePatch } from '../../music/editor'
import { commitEdit, createEditHistory, redoEdit, undoEdit, type EditHistory } from '../../music/editHistory'
import type { NoteEvent } from '../../music/types'

export function useMelodyEditor(sourceId: string | null, sourceNotes: NoteEvent[]) {
  const sourceIdRef = useRef<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [history, setHistory] = useState<EditHistory>(() => createEditHistory([]))
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  useEffect(() => {
    if (sourceId === sourceIdRef.current) return
    sourceIdRef.current = sourceId
    const initialNotes = sourceId === null ? [] : sourceNotes.map((note) => ({ ...note }))
    setHistory(createEditHistory(initialNotes))
    setSelectedNoteId(initialNotes[0]?.id ?? null)
    setConfirmed(false)
  }, [sourceId, sourceNotes])

  const apply = useCallback((label: string, operation: (notes: NoteEvent[]) => NoteEvent[]) => {
    setHistory((current) => commitEdit(current, operation(current.present), label))
    setConfirmed(false)
  }, [])

  const undo = useCallback(() => {
    setHistory((current) => undoEdit(current))
    setConfirmed(false)
  }, [])

  const redo = useCallback(() => {
    setHistory((current) => redoEdit(current))
    setConfirmed(false)
  }, [])

  const notes = history.present
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null
  const keyCandidate = useMemo(() => detectAssistedKey(notes), [notes])

  return {
    addNote: (seed?: Partial<NoteEvent>) => apply('Adicionar nota', (notes) => addNote(notes, seed)),
    canRedo: history.future.length > 0,
    canUndo: history.past.length > 0,
    confirm: () => setConfirmed(true),
    confirmed,
    deleteNote: (noteId: string) => apply('Excluir nota', (notes) => deleteNote(notes, noteId)),
    duplicateNote: (noteId: string) => apply('Duplicar nota', (notes) => duplicateNote(notes, noteId)),
    keyCandidate,
    lastOperation: history.past.at(-1)?.label ?? null,
    mergeNoteWithNext: (noteId: string) => apply('Unir notas', (notes) => mergeNoteWithNext(notes, noteId)),
    notes,
    quantize: (gridTicks = defaultQuantizationTicks) => apply('Quantizar notas', (notes) => quantizeNotes(notes, gridTicks)),
    redo,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    splitNote: (noteId: string) => apply('Dividir nota', (notes) => splitNote(notes, noteId)),
    toggleNoteLock: (noteId: string) => apply('Alterar bloqueio', (notes) => toggleNoteLock(notes, noteId)),
    undo,
    updateNote: (noteId: string, patch: NotePatch) => apply('Editar nota', (notes) => updateNote(notes, noteId, patch)),
  }
}
