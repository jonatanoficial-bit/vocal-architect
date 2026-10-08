const roadmap = [
  ['01', 'Fundação profissional', 'Em execução neste repositório.', 'Atual'],
  ['02', 'Experiência e interface premium', 'Dashboard, estúdio e componentes de interação.', 'Planejado'],
  ['03–06', 'Captação e melodia', 'Gravação real, áudio, transcrição e editor.', 'Planejado'],
  ['07–08', 'Inteligência harmônica', 'Teoria, progressões, avaliação e arranjo SATB.', 'Planejado'],
  ['09–14', 'Ensaio, edição e exportação', 'Reprodução, mixer, persistência e formatos musicais.', 'Planejado'],
  ['15–16', 'Qualidade e lançamento', 'PWA, acessibilidade, auditoria e publicação.', 'Planejado'],
]

export function RoadmapPage() {
  return <div className="page"><section className="page-heading"><p className="eyebrow">16 lotes oficiais</p><h1>Evolução controlada, com música antes de marketing.</h1><p>Cada lote termina com código real, auditoria e checkpoint. O projeto não avança sobre funcionalidades não verificadas.</p></section><section className="roadmap" aria-label="Plano de evolução">{roadmap.map(([lot, title, description, state]) => <article className="roadmap-item" key={lot}><strong>{lot}</strong><span><strong>{title}</strong><p>{description}</p></span><em>{state}</em></article>)}</section></div>
}
