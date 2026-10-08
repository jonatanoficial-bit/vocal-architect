import { useContext } from 'react'

import { ProjectSessionContext, type ProjectSessionContextValue } from './ProjectSessionContext'

export function useProjectSession(): ProjectSessionContextValue {
  const context = useContext(ProjectSessionContext)
  if (!context) throw new Error('useProjectSession deve ser usado dentro de ProjectSessionProvider.')
  return context
}
