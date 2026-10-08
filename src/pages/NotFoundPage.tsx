import { routes } from '../app/routes'
import { routeHref } from '../app/useHashRoute'

export function NotFoundPage() {
  return <div className="page"><section className="empty-state"><h1>Esta área ainda não existe.</h1><p>O endereço solicitado não pertence à fundação atual. <a href={routeHref(routes.home)}>Voltar para o início</a></p></section></div>
}
