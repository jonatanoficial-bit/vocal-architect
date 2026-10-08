# Matriz de testes

| Área | Cobertura atual | Situação |
| --- | --- | --- |
| Página inicial | Título e comunicação honesta do Lote 01 | Automatizado |
| Navegação | Transição por hash para Arquitetura | Automatizado |
| Sessão inicial | Criação em memória e abertura do Estúdio | Automatizado |
| Interface responsiva | Painéis usam breakpoints de CSS | Verificação de código; teste visual manual pendente |
| Gravador | Pedido apenas após clique, estado de erro por permissão negada e interface de captura | Automatizado com APIs de navegador simuladas |
| Utilitários de áudio | Nível RMS/clipping, MIME, duração, nome e mensagens de erro | Automatizado |
| Processamento de áudio | Downmix PCM, waveform, energia e regiões de silêncio sustentadas | Automatizado |
| Importação | Validação de tipo, arquivo vazio, duração e orçamento de memória | Automatizado para funções puras; teste de navegador real pendente |
| Compatibilidade | Pré-requisitos de contexto seguro, microfone e `MediaRecorder` | Implementado; teste de navegador real pendente |
| Tipos | Compilação TypeScript | Automatizado por comando |
| Lint | Código de `src` e `tests` | Automatizado por comando |
| Build estático | Bundle Vite | Automatizado por comando |
| GitHub Pages | Fluxo de deploy | Publicado; execução remota do Lote 04 aprovada |

O teste automatizado não acessa microfone físico nem executa `decodeAudioData` com arquivos reais do navegador. Gravação com hardware, pausa, reprodução, interrupção/cancelamento, importação de formatos de referência, erros de codec e orçamento de memória exigem validação manual em navegador compatível.
