# Arquitetura — Lotes 01–03

O aplicativo é um SPA estático em React + TypeScript + Vite. A navegação usa hash (`#/arquitetura`, `#/roadmap`), mantendo recarregamento e links internos compatíveis com GitHub Pages sem servidor de fallback.

`src/app` compõe a aplicação e rotas. `src/pages` contém páginas, `src/components` componentes reutilizáveis, `src/config` metadados, `src/features/projects` guarda uma sessão temporária de projeto e `src/music` o primeiro contrato canônico independente da interface.

No Lote 03, `src/audio/capture` contém funções puras para formato, nível de entrada, compatibilidade, preferência de MIME e liberação de `MediaStream`. `src/features/recording` contém o adaptador React que coordena a máquina de estados (`idle`, pedido de permissão, gravação, pausa, finalização, pronto e erro) e a interface. A captura usa `getUserMedia`, `MediaRecorder`, `AudioContext`/`AnalyserNode` e `URL.createObjectURL` nativos; não há upload, backend ou dados demonstrativos.

Ao encerrar, cancelar, falhar ou desmontar o componente, as faixas do microfone são interrompidas, o contexto de análise é fechado e a URL temporária é revogada quando não é mais necessária. O resultado permanece em memória enquanto a sessão estiver aberta; persistência e processamento posterior pertencem a lotes futuros.

Camadas previstas: interface, aplicação, domínio musical, áudio, persistência e interoperabilidade. A sessão de projeto vive apenas na memória React; ela não simula autosave, banco local ou projetos recentes. Persistência continua reservada ao Lote 13.
