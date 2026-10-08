import { CapabilityStatus } from '../components/CapabilityStatus'
import { EmptyPanel } from '../components/EmptyPanel'
import { useProjectSession } from '../features/projects/useProjectSession'

import { navigateTo } from '../app/useHashRoute'
import { routes } from '../app/routes'

export function StudioPage() {
  const { session, createSession, renameSession } = useProjectSession()

  if (!session) {
    return <div className="page studio-empty"><EmptyPanel title="Seu estúdio está pronto para um projeto."><button className="button primary" onClick={() => { createSession(); navigateTo(routes.studio) }}>Criar sessão temporária</button><span>Esta ação cria um projeto em memória. O salvamento local será implementado no Lote 13.</span></EmptyPanel></div>
  }

  return (
    <div className="studio-page">
      <section className="studio-titlebar" aria-label="Projeto atual">
        <div><p className="eyebrow">Sessão temporária</p><label htmlFor="project-name">Nome do projeto</label><input id="project-name" value={session.name} onChange={(event) => renameSession(event.target.value)} /></div>
        <span className="pending-label">Sem salvamento local nesta versão</span>
      </section>
      <section className="studio-grid" aria-label="Estúdio Vocal Architect">
        <aside className="studio-panel tracks-panel"><div className="panel-heading"><span>01</span><h2>Faixas</h2></div><EmptyPanel title="Nenhuma faixa adicionada">Gravação e importação serão recursos reais a partir dos Lotes 03 e 04.</EmptyPanel></aside>
        <section className="studio-panel arrangement-panel"><div className="panel-heading"><span>02</span><h2>Área musical</h2></div><div className="timeline-placeholder"><div className="timeline-ruler" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div><strong>Aguardando uma melodia</strong><p>O piano roll funcional será apresentado no Lote 06, depois que houver transcrição e correção de notas.</p></div></section>
        <aside className="studio-panel harmony-panel"><div className="panel-heading"><span>03</span><h2>Harmonização</h2></div><dl className="unavailable-list"><div><dt>Tonalidade</dt><dd>A definir com a melodia</dd></div><div><dt>Vozes</dt><dd>Aguardando motor SATB</dd></div><div><dt>Estilo</dt><dd>Aguardando Lote 07</dd></div></dl><p className="panel-note">Os controles ficam indisponíveis até que possam gerar resultados musicais reais.</p></aside>
        <section className="studio-panel transport-panel"><div className="panel-heading"><span>04</span><h2>Reprodução</h2></div><p>O transporte e os instrumentos virtuais serão ativados no Lote 09.</p><CapabilityStatus /></section>
      </section>
    </div>
  )
}
