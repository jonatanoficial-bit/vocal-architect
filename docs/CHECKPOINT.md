# Checkpoint de continuidade

PROJETO: VOCAL ARCHITECT  
VERSÃO: 0.11.0
LOTE: 11 — Harmonia guiada e edição de arranjo
DATA: 2026-10-10
BRANCH: main  
COMMIT FUNCIONAL: pendente — harmonia guiada e edição SATB em validação final.

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
- Gerador SATB local com busca conjunta das quatro vozes por frase, preservação literal da melodia no naipe escolhido e até três alternativas distintas.
- Tessituras iniciais para soprano, contralto, tenor e baixo, limites absolutos configuráveis e preferência por região confortável durante a busca.
- Validação de tessitura, cruzamento, espaçamento, paralelismos perfeitos e cadência; a geração é recusada quando as restrições não admitem uma disposição válida.
- Piano sintetizado localmente por Web Audio para alternativas SATB selecionadas, sem upload ou síntese de voz humana.
- Transporte baseado em ticks com play, pause, stop, reinício, seek, BPM, loop integral e seleção de audição por naipe.
- Agendamento das notas no relógio de áudio, reação de notas sustentadas após seek/pausa e interrupção segura de osciladores em stop, seek, reinício e desmontagem.
- Mixer local SATB ligado ao mesmo grafo Web Audio do piano, com mute, solos múltiplos, volume por naipe e pan estéreo quando a API do navegador está disponível.
- Presets de conjunto, somente meu naipe e meu naipe em destaque, aplicados diretamente ao mixer; ensaio lento reversível que restaura o andamento anterior.
- Loop regional com limites em ticks, corte das notas no fim do trecho e reinício no ponto escolhido; os controles de ensaio agora aparecem antes dos cartões de notas no resultado SATB.
- Caminho de harmonização explícito: confirmar melodia, analisar acordes e gerar SATB, com indicador de progresso e atalho para a aba correta.
- Exemplo de estudo local e identificado para experimentar esse caminho sem simular uma gravação do usuário.
- Seleção de acordes limitada às candidatas reais de cada frase, com recálculo dos conflitos e da confiança da análise escolhida.
- Editor SATB imutável para altura, início e duração, com bloqueio de nota, validação de tessitura, sobreposição, cruzamento e paralelismos perfeitos.
- Histórico local de até 40 alterações, desfazer/refazer, comparação com a versão original e regeneração parcial de frase que preserva notas bloqueadas.

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
- `pnpm run typecheck` — concluído sem erros no Lote 08.
- `pnpm run lint` — concluído sem avisos no Lote 08.
- `pnpm run test` — 7 arquivos e 28 testes aprovados no Lote 08.
- `GITHUB_ACTIONS=true pnpm run build` — concluído; bundle gerado com a base `/vocal-architect/` e 65 módulos.
- `pnpm run typecheck` — concluído sem erros no Lote 09.
- `pnpm run lint` — concluído sem avisos no Lote 09.
- `pnpm run test` — 8 arquivos e 31 testes aprovados no Lote 09.
- `GITHUB_ACTIONS=true pnpm run build` — concluído; bundle gerado com a base `/vocal-architect/` e 69 módulos.
- `pnpm run quality` — concluído sem erros no Lote 10: typecheck, lint, 9 arquivos/36 testes e build com 70 módulos.
- `GITHUB_ACTIONS=true pnpm run build` — concluído no Lote 10; bundle gerado com a base `/vocal-architect/` e 70 módulos.
- `pnpm run quality` — concluído sem erros no Lote 11: typecheck, lint, 10 arquivos/42 testes e build.
- `GITHUB_ACTIONS=true pnpm exec vite build --debug` — concluído no Lote 11; base `/vocal-architect/`, 73 módulos transformados e bundle estático gerado.
- Workflow remoto **Quality checks** — aprovado no commit `bc8f27c` ([execução 37994876147](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37994876147)).
- Workflow remoto **Deploy GitHub Pages** — aprovado no commit `bc8f27c` ([execução 37994876078](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37994876078)).
- Workflow remoto **Quality checks** — aprovado no commit `326e8b6` ([execução 37954294621](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37954294621)).
- Workflow remoto **Deploy GitHub Pages** — aprovado no commit `326e8b6` ([execução 37954294684](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37954294684)).
- Workflow remoto **Quality checks** — aprovado no commit `cbd788a` ([execução 37951943680](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37951943680)).
- Workflow remoto **Deploy GitHub Pages** — aprovado no commit `cbd788a` ([execução 37951943704](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37951943704)).
- Workflow remoto **Quality checks** — aprovado no commit `fee4d6f` ([execução 37948222281](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37948222281)).
- Workflow remoto **Deploy GitHub Pages** — aprovado no commit `fee4d6f` ([execução 37948222357](https://github.com/jonatanoficial-bit/vocal-architect/actions/runs/37948222357)).
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
- Avaliação com coros e repertório de referência para condução, tessitura, independência das linhas e qualidade perceptiva das alternativas SATB.
- Fluxo de harmonia guiada, edição e regeneração parcial em navegador/dispositivo real por toque e mouse; a validação automatizada cobre as regras, mas não substitui a inspeção musical e de usabilidade.
- Reprodução audível em navegadores e dispositivos móveis reais, incluindo autorização de áudio, pause, seek, loop regional, solo/mute, volume, pan, presets, ensaio lento e interrupções rápidas. A tentativa de abrir o navegador por automação local expirou duas vezes antes de expor uma janela.

## LIMITES ATUAIS

- A transcrição é local, monofônica e limitada a 90 segundos por execução; não separa fontes, instrumentos, acordes ou vozes sobrepostas no áudio.
- Não há métrica de precisão declarada, redução de ruído, correção automática de pitch, persistência ou exportação.
- Os resultados são leituras iniciais. O rótulo de revisão comunica incerteza, mas não substitui uma correção humana.
- O editor é efêmero: não arrasta/redimensiona diretamente no piano roll, não reproduz MIDI, não persiste a revisão e perde a cópia editável ao recarregar ou trocar a transcrição.
- A tonalidade e a harmonia são candidatas locais por duração e função; não substituem análise tonal, métrica, estilo ou validação humana.
- O arranjo SATB é efêmero e restrito às tríades da análise atual; permite ajustes seguros por campos, mas não há tratamento de sétimas, notas de passagem, edição gráfica por arrastar, estilo avançado, persistência ou exportação.
- A tessitura da melodia selecionada é obrigatória. Em vez de transpor ou alterar a linha, o motor informa quando ela não cabe no naipe escolhido ou quando a disposição é impossível.
- A reprodução depende de Web Audio e usa apenas um piano sintetizado. Não há áudio original sincronizado, instrumento amostrado, acompanhamento externo, metrônomo, contagem, efeitos, automação de mix, voz humana ou exportação.

## PRÓXIMO LOTE

12 — Notação e leitura musical, somente após confirmação do proprietário e validação manual de harmonia/edição SATB em navegador ou dispositivo real.

## INSTRUÇÃO DE RETOMADA

Ler `AGENTS.md`, `docs/REQUIREMENTS_SCOPE.md`, este checkpoint, `docs/ARCHITECTURE.md`, `docs/SATB_ENGINE.md`, `docs/PLAYBACK_ENGINE.md`, `src/music/harmony.ts`, `src/music/arrangementEditor.ts`, `src/features/harmony/HarmonyPanel.tsx`, `src/features/satb/ArrangementEditorPanel.tsx`, `src/features/satb/useArrangementDraft.ts`, `src/audio/playback/timing.ts`, `src/audio/playback/mixer.ts`, `src/features/playback/useSatbPlayback.ts` e os testes antes de modificar o projeto. Consultar os documentos mestres originais somente no canal privado em que foram fornecidos.
