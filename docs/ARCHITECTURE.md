# Arquitetura — Lotes 01–06

O aplicativo é um SPA estático em React + TypeScript + Vite. A navegação usa hash (`#/arquitetura`, `#/roadmap`), mantendo recarregamento e links internos compatíveis com GitHub Pages sem servidor de fallback.

`src/app` compõe a aplicação e rotas. `src/pages` contém páginas, `src/components` componentes reutilizáveis, `src/config` metadados, `src/features/projects` guarda uma sessão temporária de projeto e `src/music` o primeiro contrato canônico independente da interface.

No Lote 03, `src/audio/capture` contém funções puras para formato, nível de entrada, compatibilidade, preferência de MIME e liberação de `MediaStream`. `src/features/recording` contém o adaptador React que coordena a máquina de estados (`idle`, pedido de permissão, gravação, pausa, finalização, pronto e erro) e a interface. A captura usa `getUserMedia`, `MediaRecorder`, `AudioContext`/`AnalyserNode` e `URL.createObjectURL` nativos; não há upload, backend ou dados demonstrativos.

No Lote 04, `src/audio/processing` separa validação de entrada, decodificação de navegador, downmix para PCM mono, waveform, energia e regiões de silêncio. `src/features/audio` coordena a importação e apresenta apenas métricas derivadas do áudio decodificado. O protocolo em `workerProtocol.ts` descreve mensagens transferíveis para mover a análise a Worker em lote posterior; o processamento atual ainda ocorre na aba principal.

No Lote 05, `src/audio/transcription` mantém o detector YIN, reamostragem, conversões MIDI/grafia e segmentação temporal fora de React. `src/features/transcription` só coordena a solicitação explícita, o estado de execução e a apresentação de resultados. A saída continua usando `NoteEvent` do domínio musical, sem usar posições da interface como dado musical. O cálculo permanece na aba principal e é limitado a 90 segundos por execução até uma migração futura para Worker.

No Lote 06, `src/music/editor.ts` aplica operações imutáveis sobre `NoteEvent` e respeita notas bloqueadas; `src/music/editHistory.ts` guarda um histórico local limitado a 60 operações. `src/features/melody` mantém a cópia editável do resultado de transcrição, a seleção e a confirmação da melodia. O piano roll exibe esses ticks/MIDI como interface, mas não os transforma em dados visuais. A cópia editada é efêmera e não substitui PCM, `TranscriptionResult` ou o arquivo original.

Ao encerrar, cancelar, falhar ou desmontar o componente, as faixas do microfone são interrompidas, o contexto de análise é fechado e a URL temporária é revogada quando não é mais necessária. O áudio analisado permanece em memória enquanto a sessão estiver aberta; persistência e processamento posterior pertencem a lotes futuros.

Camadas previstas: interface, aplicação, domínio musical, áudio, persistência e interoperabilidade. A sessão de projeto vive apenas na memória React; ela não simula autosave, banco local ou projetos recentes. Persistência continua reservada ao Lote 13.
