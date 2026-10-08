# Escopo público de requisitos — Lotes 01 a 03

Este repositório público registra apenas os requisitos necessários para a fundação. Os documentos mestres integrais do produto foram fornecidos separadamente e não são republicados sem autorização explícita do proprietário.

## Entregas desta etapa

- Aplicação React, TypeScript e Vite com estrutura modular.
- Identidade inicial, design tokens e páginas de Início, Arquitetura e Roadmap.
- Navegação estática compatível com GitHub Pages.
- Modelo musical inicial com tempo baseado em ticks e PPQ 960.
- Testes de interface, typecheck, lint, build, CI e workflow de deploy.
- Checkpoint, decisões e documentação de continuidade.

## Fora do escopo desta etapa

Importação de áudio, transcrição, editor de notas, análise tonal, harmonização, arranjo SATB, transporte multipista, projetos locais, exportação e PWA instalada. Essas capacidades só serão incluídas quando implementadas e validadas nos lotes próprios.

## Entregas do Lote 02

- Dashboard e fluxo de criação de sessão temporária em memória.
- Estúdio responsivo com painéis de faixas, área musical, harmonização e reprodução.
- Componentes reutilizáveis para estado vazio e capacidade do navegador.
- Estados reais de carregamento/compatibilidade e mensagens de indisponibilidade.
- Navegação, foco inicial e adaptação para telas pequenas.

## Entregas do Lote 03

- Permissão de microfone solicitada somente por ação explícita do usuário.
- Captura real com `MediaRecorder` e liberação dos recursos de microfone ao concluir, cancelar, falhar ou sair do painel.
- Duração, nível de entrada e indicação de clipping por `AnalyserNode`.
- Pausa e retomada quando o navegador disponibiliza essas operações.
- Reprodução do áudio capturado e mensagens para permissão negada, dispositivo indisponível e falhas de captura.
- Áudio temporário e local à sessão: sem upload, persistência, importação, transcrição ou processamento neste lote.
