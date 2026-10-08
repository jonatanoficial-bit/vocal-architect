import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { ProjectSessionContext, type ProjectSession } from './ProjectSessionContext'

function newSession(): ProjectSession {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `session-${Date.now()}`,
    name: 'Novo projeto',
  }
}

export function ProjectSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ProjectSession | null>(null)
  const createSession = useCallback(() => setSession(newSession()), [])
  const renameSession = useCallback((name: string) => {
    setSession((current) => current ? { ...current, name: name.trim() || 'Novo projeto' } : current)
  }, [])
  const value = useMemo(() => ({ session, createSession, renameSession }), [session, createSession, renameSession])

  return <ProjectSessionContext.Provider value={value}>{children}</ProjectSessionContext.Provider>
}
