const roadmap = [
  ['01', 'Fundação profissional', 'Base, qualidade, documentação e GitHub Pages.', 'Concluído'],
  ['02', 'Experiência e interface premium', 'Dashboard, estúdio e componentes de interação.', 'Concluído'],
  ['03', 'Gravação real', 'Microfone, nível de entrada, reprodução e erros.', 'Concluído'],
  ['04', 'Áudio e processamento', 'Importação, PCM, waveform, energia e silêncio.', 'Atual'],
  ['05–06', 'Transcrição e editor', 'Reconhecimento de notas, confiança e correção de melodia.', 'Planejado'],
  ['07–08', 'Inteligência harmônica', 'Teoria, progressões, avaliação e arranjo SATB.', 'Planejado'],
  ['09–14', 'Ensaio, edição e exportação', 'Reprodução, mixer, persistência e formatos musicais.', 'Planejado'],
  ['15–16', 'Qualidade e lançamento', 'PWA, acessibilidade, auditoria e publicação.', 'Planejado'],
]

export function RoadmapPage() {
  return <div className="page"><section className="page-heading"><p className="eyebrow">16 lotes oficiais</p><h1>Evolução controlada, com música antes de marketing.</h1><p>Cada lote termina com código real, auditoria e checkpoint. O projeto não avança sobre funcionalidades não verificadas.</p></section><section className="roadmap" aria-label="Plano de evolução">{roadmap.map(([lot, title, description, state]) => <article className="roadmap-item" key={lot}><strong>{lot}</strong><span><strong>{title}</strong><p>{description}</p></span><em>{state}</em></article>)}</section></div>
}
