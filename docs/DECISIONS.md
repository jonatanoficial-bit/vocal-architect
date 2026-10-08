# Decisões arquiteturais

## ADR-001 — Aplicação estática e local-first

**Decisão:** a primeira versão usa React/Vite e não possui backend obrigatório. **Motivo:** GitHub Pages serve conteúdo estático e a especificação exige processamento prioritariamente local.

## ADR-002 — Navegação por hash na fundação

**Decisão:** usar rotas por hash no Lote 01. **Motivo:** elas funcionam em subdiretório e em recarregamentos de GitHub Pages sem página de fallback.

## ADR-003 — Sem controles de estúdio antes do motor

**Decisão:** a interface comunica estado e roadmap; não mostra controles de gravação ou harmonização. **Motivo:** evita induzir o músico a acreditar que existe funcionalidade não implementada.

## ADR-004 — Gravação nativa, local e iniciada por gesto

**Decisão:** o Lote 03 usa `getUserMedia`, `MediaRecorder` e `AudioContext` do navegador somente após um gesto explícito de iniciar a gravação. **Motivo:** atender à captura real sem backend, preservar o controle do músico sobre a permissão e liberar os recursos assim que a sessão termina.

## ADR-005 — PCM mono antes da transcrição

**Decisão:** o Lote 04 decodifica entradas aceitas pelo navegador e reduz seus canais para PCM mono antes de calcular waveform, energia e silêncio. **Motivo:** estabelecer uma representação local previsível para o pipeline monofônico sem fingir que conteúdo polifônico já pode ser transcrito.
