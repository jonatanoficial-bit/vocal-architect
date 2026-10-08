import { BrandMark } from '../components/BrandMark'
import { project } from '../config/project'
import { ArchitecturePage } from '../pages/ArchitecturePage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RoadmapPage } from '../pages/RoadmapPage'
import { StudioPage } from '../pages/StudioPage'
import { ProjectSessionProvider } from '../features/projects/ProjectSessionProvider'

import { navigationItems, routes } from './routes'
import { routeHref, useHashRoute } from './useHashRoute'

export function AppShell() {
  return <ProjectSessionProvider><AppFrame /></ProjectSessionProvider>
}

function AppFrame() {
  const path = useHashRoute()
  const page = path === routes.home ? <HomePage /> : path === routes.studio ? <StudioPage /> : path === routes.architecture ? <ArchitecturePage /> : path === routes.roadmap ? <RoadmapPage /> : <NotFoundPage />

  return (
    <div className="app-shell">
      <button className="skip-link" onClick={() => document.getElementById('main-content')?.focus()}>Pular para o conteúdo</button>
      <header className="topbar">
        <a className="brand" href={routeHref(routes.home)} aria-label={`${project.name}, início`}>
          <BrandMark />
          <span><strong>{project.name}</strong><small>Harmonia vocal assistida</small></span>
        </a>
        <span className="status-badge">Interface · v{project.version}</span>
      </header>
      <nav className="navigation" aria-label="Navegação principal">
        {navigationItems.map((item) => <a key={item.path} href={routeHref(item.path)} aria-current={path === item.path ? 'page' : undefined}>{item.label}</a>)}
      </nav>
      <main id="main-content" tabIndex={-1}>{page}</main>
      <footer>Vocal Architect {project.version} · Processamento local primeiro · Lote 02</footer>
    </div>
  )
}
