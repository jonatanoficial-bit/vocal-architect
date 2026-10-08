import { BrandMark } from '../components/BrandMark'
import { project } from '../config/project'
import { ArchitecturePage } from '../pages/ArchitecturePage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RoadmapPage } from '../pages/RoadmapPage'

import { navigationItems, routes } from './routes'
import { routeHref, useHashRoute } from './useHashRoute'

export function AppShell() {
  const path = useHashRoute()
  const page = path === routes.home ? <HomePage /> : path === routes.architecture ? <ArchitecturePage /> : path === routes.roadmap ? <RoadmapPage /> : <NotFoundPage />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href={routeHref(routes.home)} aria-label={`${project.name}, início`}>
          <BrandMark />
          <span><strong>{project.name}</strong><small>Harmonia vocal assistida</small></span>
        </a>
        <span className="status-badge">Fundação · v{project.version}</span>
      </header>
      <nav className="navigation" aria-label="Navegação principal">
        {navigationItems.map((item) => <a key={item.path} href={routeHref(item.path)} aria-current={path === item.path ? 'page' : undefined}>{item.label}</a>)}
      </nav>
      <main>{page}</main>
      <footer>Vocal Architect {project.version} · Processamento local primeiro · Lote 01</footer>
    </div>
  )
}
