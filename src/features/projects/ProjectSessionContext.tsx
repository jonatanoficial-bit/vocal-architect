import { createContext } from 'react'

export interface ProjectSession {
  id: string
  name: string
}

export interface ProjectSessionContextValue {
  session: ProjectSession | null
  createSession: () => void
  renameSession: (name: string) => void
}

export const ProjectSessionContext = createContext<ProjectSessionContextValue | null>(null)
