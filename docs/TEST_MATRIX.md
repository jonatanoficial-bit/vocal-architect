# Matriz de testes

| Área | Cobertura atual | Situação |
| --- | --- | --- |
| Página inicial | Título e comunicação honesta do Lote 01 | Automatizado |
| Navegação | Transição por hash para Arquitetura | Automatizado |
| Sessão inicial | Criação em memória e abertura do Estúdio | Automatizado |
| Interface responsiva | Painéis usam breakpoints de CSS | Verificação de código; teste visual manual pendente |
| Gravador | Pedido apenas após clique, estado de erro por permissão negada e interface de captura | Automatizado com APIs de navegador simuladas |
| Utilitários de áudio | Nível RMS/clipping, MIME, duração, nome e mensagens de erro | Automatizado |
| Compatibilidade | Pré-requisitos de contexto seguro, microfone e `MediaRecorder` | Implementado; teste de navegador real pendente |
| Tipos | Compilação TypeScript | Automatizado por comando |
| Lint | Código de `src` e `tests` | Automatizado por comando |
| Build estático | Bundle Vite | Automatizado por comando |
| GitHub Pages | Fluxo de deploy | Publicado; execução remota do Lote 03 aprovada |

O teste automatizado não acessa microfone físico. Gravação com hardware, pausa, reprodução, interrupção/cancelamento e gravação vazia exigem validação manual em navegador compatível.
