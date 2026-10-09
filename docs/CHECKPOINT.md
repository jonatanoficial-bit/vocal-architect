# Checkpoint de continuidade

PROJETO: VOCAL ARCHITECT  
VERSÃO: 0.7.0
LOTE: 07 — Motor harmônico
DATA: 2026-10-09
BRANCH: main  
COMMIT FUNCIONAL: 64c62ea — feat(melody): add local melody editor.

## IMPLEMENTADO

- Fundação React, TypeScript, Vite, rotas por hash, sessão temporária, design responsivo e deploy estático.
- Captura local com permissão explícita, `MediaRecorder`, nível RMS, clipping, pausa quando suportada, reprodução e liberação de recursos.
- Importação local validada, decodificação nativa, PCM mono, waveform, energia, regiões de silêncio e descarte de URLs temporárias.
- Detector de pitch monofônico YIN em `src/audio/transcription`, com reamostragem de análise a 8 kHz, janela de 1024 amostras e salto de 256 amostras.
- Limiar de RMS, faixa de 80–1000 Hz, confiança mínima de 72%, mediana temporal de três janelas e confirmação de cinco janelas para uma mudança de nota.
- Segmentos convertidos em `NoteEvent` canônico com origem, frase, confiança, duração em ticks e sinalização de revisão abaixo de 85% de confiança.
- Painel de transcrição acionado explicitamente para áudio já decodificado, com notas, frequência, intervalos, diagnósticos e limites visíveis.
- Testes sintéticos reprodutíveis para A4, pausas, mudança sustentada de pitch e vibrato moderado.
- Piano roll em memória sobre a cópia musical da transcrição, com seleção, zoom visual e painel de edição baseado em ticks/MIDI.
- Operações imutáveis para editar, adicionar, duplicar, dividir, unir, excluir, bloquear e quantizar notas, preservando qualquer nota bloqueada.
- Histórico semântico local limitado a 60 operações, com Undo/Redo, tonalidade candidata e confirmação explícita da melodia na sessão.
- Motor harmônico local que segmenta frases por `phraseId` ou pausa, modela acordes, sétimas e inversões, propõe tríades diatônicas e pontua encaixe por duração das notas.
- Progressão por frase com contexto tonal assistido, função harmônica, candidatos alternativos e conflitos de nota fora do acorde/escala.
- Análise liberada apenas por confirmação explícita da melodia; ela não altera a cópia musical, inclusive as notas bloqueadas.
- Estúdio reorganizado em espaços de trabalho alternáveis de Áudio, Melodia e Harmonia. O piano roll agora tem rolagem interna e controles maiores em telas pequenas.

## TESTADO

- `pnpm run typecheck` — concluído sem erros.
- `pnpm run lint` — concluído sem avisos.
- `pnpm run test` — 5 arquivos e 20 testes aprovados.
- `pnpm run quality` — concluído sem erros; typecheck, lint, testes e build executados.
- `GITHUB_ACTIONS=true pnpm run build` — concluído; bundle gerado com a base `/vocal-architect/` e 58 módulos.
- `pnpm run typecheck` — concluído sem erros no Lote 07.
- `pnpm run lint` — concluído sem avisos no Lote 07.
- `pnpm run test` — 6 arquivos e 24 testes aprovados no Lote 07.
- `pnpm run quality` — concluído; typecheck, lint, testes e build executados no Lote 07.
- `GITHUB_ACTIONS=true pnpm run build` — concluído; bundle gerado com a base `/vocal-architect/` e 62 módulos.
- Workflow remoto **Quality checks** — aprovado no commit `e1a052b` ([execução 37833504960](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37833504960)).
- Workflow remoto **Deploy GitHub Pages** — aprovado no commit `e1a052b` ([execução 37833504886](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37833504886)).
- Workflow remoto **Quality checks** — aprovado no commit `2d50b5d` ([execução 37843759427](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37843759427)).
- Workflow remoto **Deploy GitHub Pages** — aprovado no commit `2d50b5d` ([execução 37843759485](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37843759485)).

## NÃO TESTADO

- Inspeção visual manual em navegador real e breakpoints de referência. A tentativa de validação automatizada do layout falhou antes de abrir o navegador, pois o auxiliar local de Computer Use encerrou durante a preparação do sandbox.
- Gravação com microfone físico, pausa/retomada, cancelamento e reprodução em navegadores compatíveis.
- Importação/decodificação de arquivos reais, codecs incompatíveis, duração máxima e orçamento de memória em navegador compatível.
- Comparação da transcrição com corpus vocal anotado, inclusive ruído, respiração, portamento, vibrato intenso, notas curtas, erros de oitava, acordes e vozes sobrepostas.
- Uso do piano roll por mouse e toque em navegador real, incluindo zoom, seleção e o painel de propriedades em telas pequenas.
- Avaliação musical com repertório anotado para tonalidade, frases, candidatas, conflitos e progressões sugeridas.

## LIMITES ATUAIS

- A transcrição é local, monofônica e limitada a 90 segundos por execução; não separa fontes, instrumentos, acordes ou vozes sobrepostas no áudio.
- Não há métrica de precisão declarada, redução de ruído, correção automática de pitch, playback MIDI, persistência ou exportação.
- Os resultados são leituras iniciais. O rótulo de revisão comunica incerteza, mas não substitui uma correção humana.
- O editor é efêmero: não arrasta/redimensiona diretamente no piano roll, não reproduz MIDI, não persiste a revisão e perde a cópia editável ao recarregar ou trocar a transcrição.
- A tonalidade e a harmonia são candidatas locais por duração e função; não substituem análise tonal, métrica, estilo ou validação humana.
- O Lote 07 não gera vozes SATB, não faz condução de vozes e não seleciona inversões na interface. Essas capacidades pertencem ao Lote 08.

## PRÓXIMO LOTE

08 — Arranjo vocal SATB, somente após confirmação do proprietário e avaliação musical das candidatas harmônicas do Lote 07.

## INSTRUÇÃO DE RETOMADA

Ler `AGENTS.md`, `docs/REQUIREMENTS_SCOPE.md`, este checkpoint, `docs/ARCHITECTURE.md`, `docs/HARMONY_ENGINE.md`, `src/music/harmony.ts`, `src/features/harmony/HarmonyPanel.tsx` e os testes antes de modificar o projeto. Consultar os documentos mestres originais somente no canal privado em que foram fornecidos.
