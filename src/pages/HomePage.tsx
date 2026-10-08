import { project } from '../config/project'

const pillars = [
  ['Estrutura sustentável', 'Interface, domínio musical, áudio e persistência terão responsabilidades separadas.'],
  ['Processamento local', 'A arquitetura não depende de conta, backend obrigatório ou serviço pago.'],
  ['Honestidade funcional', 'Recursos só aparecem como disponíveis depois de implementados e validados.'],
]

export function HomePage() {
  return (
    <div className="page">
      <section className="hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">{project.currentLot}</p>
          <h1 id="home-title">Um lugar sério para construir harmonia vocal.</h1>
          <p>O Vocal Architect será uma estação de criação para transformar uma melodia em um arranjo vocal editável, cantável e musicalmente coerente.</p>
        </div>
        <aside className="hero-panel">
          <h2>Base do produto em construção</h2>
          <p>Esta versão estabelece arquitetura, identidade e publicação. Gravação, transcrição e harmonização ainda não estão disponíveis — e não são apresentadas como se estivessem.</p>
          <div className="signal" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} />)}</div>
        </aside>
      </section>
      <section className="section" aria-labelledby="foundation-title">
        <p className="eyebrow">O que está sendo entregue agora</p>
        <h2 id="foundation-title">Fundação verificável</h2>
        <div className="foundation-grid">
          <span><strong>React + TypeScript</strong>Base tipada e modular.</span>
          <span><strong>Rotas estáticas</strong>Compatíveis com GitHub Pages.</span>
          <span><strong>Qualidade</strong>Lint, testes, build e automação.</span>
          <span><strong>Documentação</strong>Decisões e checkpoint para continuidade.</span>
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
