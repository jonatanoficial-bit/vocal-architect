export const routes = {
  home: '/',
  architecture: '/arquitetura',
  roadmap: '/roadmap',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

export const navigationItems: ReadonlyArray<{ label: string; path: RoutePath }> = [
  { label: 'Início', path: routes.home },
  { label: 'Arquitetura', path: routes.architecture },
  { label: 'Roadmap', path: routes.roadmap },
]
