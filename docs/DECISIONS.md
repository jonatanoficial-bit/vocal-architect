# Decisões arquiteturais

## ADR-001 — Aplicação estática e local-first

**Decisão:** a primeira versão usa React/Vite e não possui backend obrigatório. **Motivo:** GitHub Pages serve conteúdo estático e a especificação exige processamento prioritariamente local.

## ADR-002 — Navegação por hash na fundação

**Decisão:** usar rotas por hash no Lote 01. **Motivo:** elas funcionam em subdiretório e em recarregamentos de GitHub Pages sem página de fallback.

## ADR-003 — Sem controles de estúdio antes do motor

**Decisão:** a interface comunica estado e roadmap; não mostra controles de gravação ou harmonização. **Motivo:** evita induzir o músico a acreditar que existe funcionalidade não implementada.
