import { useEffect, useState } from 'react'

import { routes, type RoutePath } from './routes'

function currentPath(): string {
  const path = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '')
  return path || routes.home
}

export function useHashRoute(): string {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    const onHashChange = () => setPath(currentPath())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return path
}

export function routeHref(path: RoutePath): string {
  return `#${path}`
}
