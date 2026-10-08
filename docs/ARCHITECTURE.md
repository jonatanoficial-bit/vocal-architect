# Arquitetura — Lote 01

O aplicativo é um SPA estático em React + TypeScript + Vite. A navegação usa hash (`#/arquitetura`, `#/roadmap`), mantendo recarregamento e links internos compatíveis com GitHub Pages sem servidor de fallback.

`src/app` compõe a aplicação e rotas. `src/pages` contém páginas, `src/components` componentes reutilizáveis, `src/config` metadados, `src/features/projects` guarda uma sessão temporária de projeto e `src/music` o primeiro contrato canônico independente da interface.

Camadas previstas: interface, aplicação, domínio musical, áudio, persistência e interoperabilidade. A sessão de projeto vive apenas na memória React; ela não simula autosave, banco local ou projetos recentes. Persistência continua reservada ao Lote 13.
