import { project } from '../config/project'
import { useProjectSession } from '../features/projects/useProjectSession'
import { navigateTo } from '../app/useHashRoute'
import { routes } from '../app/routes'

const pillars = [
  ['Estrutura sustentável', 'Interface, domínio musical, áudio e persistência terão responsabilidades separadas.'],
  ['Processamento local', 'A arquitetura não depende de conta, backend obrigatório ou serviço pago.'],
  ['Honestidade funcional', 'Recursos só aparecem como disponíveis depois de implementados e validados.'],
]

export function HomePage() {
  const { session, createSession } = useProjectSession()

  const startSession = () => {
    createSession()
    navigateTo(routes.studio)
  }

  return (
    <div className="page">
      <section className="hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">{project.currentLot}</p>
          <h1 id="home-title">O seu estúdio para projetar vozes.</h1>
          <p>Crie uma sessão de trabalho e conheça o espaço onde melodia, harmonia e ensaio vocal vão se encontrar — lote por lote, sem atalhos.</p>
          <button className="button primary" onClick={startSession}>Criar sessão de projeto</button>
        </div>
        <aside className="hero-panel">
          <h2>Leve uma ideia até a análise inicial</h2>
          <p>A sessão, o estúdio, a gravação, a análise local, a correção de uma melodia monofônica, alternativas SATB e a audição local dessas vozes em piano funcionam nesta versão.</p>
          <div className="signal" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} />)}</div>
        </aside>
      </section>
      <section className="section" aria-labelledby="foundation-title">
        <p className="eyebrow">Ponto de partida</p>
        <h2 id="foundation-title">{session ? `Sessão atual: ${session.name}` : 'Ainda não há projetos recentes'}</h2>
        <p className="section-intro">{session ? 'A sessão atual existe nesta aba e pode ser aberta no estúdio. O salvamento permanente será implementado no Lote 13.' : 'Crie uma sessão temporária para entrar no estúdio. Projetos recentes aparecerão quando o armazenamento local estiver implementado.'}</p>
        <div className="foundation-grid">
          <span><strong>Sessão temporária</strong>Criação em memória, sem falsa promessa de salvamento.</span>
          <span><strong>Estúdio adaptável</strong>Layout de painéis para desktop e celular.</span>
          <span><strong>Melodia revisável</strong>Pitch local, piano roll, quantização, histórico e confirmação em memória.</span>
          <span><strong>Acessibilidade inicial</strong>Foco, atalhos de conteúdo e labels claros.</span>
        </div>
      </section>
      <section className="section" aria-labelledby="principles-title">
        <p className="eyebrow">Princípios de construção</p>
        <h2 id="principles-title">A tecnologia serve à música.</h2>
        <div className="card-grid">
          {pillars.map(([title, description]) => <article className="card" key={title}><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>
    </div>
  )
}
