const roadmap = [
  ['01', 'Fundação profissional', 'Base, qualidade, documentação e GitHub Pages.', 'Concluído'],
  ['02', 'Experiência e interface premium', 'Dashboard, estúdio e componentes de interação.', 'Concluído'],
  ['03', 'Gravação real', 'Microfone, nível de entrada, reprodução e erros.', 'Concluído'],
  ['04', 'Áudio e processamento', 'Importação, PCM, waveform, energia e silêncio.', 'Concluído'],
  ['05', 'Reconhecimento de notas', 'Pitch monofônico local, confiança, segmentação e notas para revisão.', 'Concluído'],
  ['06', 'Editor de melodia', 'Piano roll, correção temporal/altura, bloqueio, quantização, histórico e confirmação.', 'Concluído'],
  ['07–08', 'Inteligência harmônica', 'Teoria, progressões, avaliação e arranjo SATB.', 'Concluído'],
  ['09', 'Reprodução SATB', 'Piano local, transporte e sincronização por ticks.', 'Concluído'],
  ['10', 'Mixer e ensaio vocal', 'Solo, mute, volume, pan, presets e loop de trecho.', 'Concluído'],
  ['11', 'Harmonia guiada e edição SATB', 'Fluxo de criação, edição segura, bloqueios, comparação e histórico.', 'Concluído'],
  ['12', 'Notação e leitura musical', 'Partitura SATB, claves, compassos, cifras e MusicXML local.', 'Atual'],
  ['13–14', 'Projetos e exportação', 'Persistência, recuperação e formatos musicais.', 'Planejado'],
  ['15–16', 'Qualidade e lançamento', 'PWA, acessibilidade, auditoria e publicação.', 'Planejado'],
]

export function RoadmapPage() {
  return <div className="page"><section className="page-heading"><p className="eyebrow">16 lotes oficiais</p><h1>Evolução controlada, com música antes de marketing.</h1><p>Cada lote termina com código real, auditoria e checkpoint. O projeto não avança sobre funcionalidades não verificadas.</p></section><section className="roadmap" aria-label="Plano de evolução">{roadmap.map(([lot, title, description, state]) => <article className="roadmap-item" key={lot}><strong>{lot}</strong><span><strong>{title}</strong><p>{description}</p></span><em>{state}</em></article>)}</section></div>
}
