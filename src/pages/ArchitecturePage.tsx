const layers = [
  ['Interface', 'Páginas e componentes React exibem dados e recebem comandos, sem conter regras de composição.'],
  ['Aplicação', 'Fluxos e estado coordenam a experiência e as capacidades de domínio.'],
  ['Domínio musical', 'Teoria, harmonia, avaliação e condução de vozes serão independentes de React.'],
  ['Áudio e dados', 'Captura, decodificação PCM e análise YIN monofônica usam APIs nativas e cálculo local; harmonia e armazenamento permanecem em lotes próprios.'],
]

export function ArchitecturePage() {
  return <div className="page"><section className="page-heading"><p className="eyebrow">Arquitetura do Lote 05</p><h1>Uma base que não confunde tela com motor musical.</h1><p>A estrutura evita lógica harmônica em componentes, dados divergentes entre editores e dependência prematura de serviços remotos.</p></section><section className="architecture-grid" aria-label="Camadas da arquitetura">{layers.map(([title, description]) => <article className="architecture-card" key={title}><h2>{title}</h2><p>{description}</p></article>)}</section></div>
}
