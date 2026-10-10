import { useCallback, useMemo, useState } from 'react'

import { changedArrangementNotes, regenerateArrangementPhrase, toggleArrangementNoteLock, updateArrangementNote, type ArrangementEditResult, type ArrangementNotePatch } from '../../music/arrangementEditor'
import type { VoiceName } from '../../music/satb'
import type { VocalPart } from '../../music/types'

const historyLimit = 40

function copy(parts: VocalPart[]) {
  return parts.map((part) => ({ ...part, notes: part.notes.map((note) => ({ ...note })) }))
}

export function useArrangementDraft(seed: VocalPart[]) {
  const [baseline] = useState(() => copy(seed))
  const [future, setFuture] = useState<VocalPart[][]>([])
  const [issues, setIssues] = useState<ArrangementEditResult['issues']>([])
  const [parts, setParts] = useState(() => copy(seed))
  const [past, setPast] = useState<VocalPart[][]>([])

  const commit = useCallback((result: ArrangementEditResult) => {
    setIssues(result.issues)
    if (result.issues.length > 0 || result.parts === parts) return false
    setPast((current) => [...current, copy(parts)].slice(-historyLimit))
    setParts(copy(result.parts))
    setFuture([])
    return true
  }, [parts])

  const updateNote = useCallback((voice: VoiceName, noteId: string, patch: ArrangementNotePatch) => commit(updateArrangementNote(parts, voice, noteId, patch)), [commit, parts])
  const toggleLock = useCallback((voice: VoiceName, noteId: string) => commit(toggleArrangementNoteLock(parts, voice, noteId)), [commit, parts])
  const regeneratePhrase = useCallback((replacement: VocalPart[], phraseId: string) => commit(regenerateArrangementPhrase(parts, replacement, phraseId)), [commit, parts])
  const undo = useCallback(() => {
    setPast((current) => {
      const previous = current.at(-1)
      if (!previous) return current
      setFuture((items) => [copy(parts), ...items].slice(0, historyLimit))
      setParts(copy(previous))
      setIssues([])
      return current.slice(0, -1)
    })
  }, [parts])
  const redo = useCallback(() => {
    setFuture((current) => {
      const next = current[0]
      if (!next) return current
      setPast((items) => [...items, copy(parts)].slice(-historyLimit))
      setParts(copy(next))
      setIssues([])
      return current.slice(1)
    })
  }, [parts])

  return { canRedo: future.length > 0, canUndo: past.length > 0, changes: useMemo(() => changedArrangementNotes(baseline, parts), [baseline, parts]), issues, parts, redo, regeneratePhrase, toggleLock, undo, updateNote }
}
