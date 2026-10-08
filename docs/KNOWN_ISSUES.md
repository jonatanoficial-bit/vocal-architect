# Limitações conhecidas

## Lote 04

- A captura requer HTTPS/localhost, permissão do navegador, microfone e suporte a `MediaRecorder`; não é possível validá-la integralmente no ambiente automatizado.
- A importação depende dos codecs aceitos por cada navegador; formatos incompatíveis ou corrompidos recebem erro de decodificação.
- Ainda não foram testados manualmente arquivos de referência, codec, duração máxima ou limites de memória em navegador real.
- Não há remoção de ruído, análise de pitch, transcrição ou correção de melodia.
- Não há motor harmônico, arranjo SATB, instrumentos virtuais, mixer ou partitura.
- Não há IndexedDB, exportação ou PWA instalada.
- As sessões, os arquivos importados e as análises existem apenas enquanto a aba permanece aberta; não são projetos salvos.
- A publicação do GitHub Pages foi confirmada até o Lote 03. O deploy do Lote 04 e a inspeção visual/manual permanecem pendentes.
- O conteúdo integral dos documentos mestres originais não foi publicado neste repositório público; somente um escopo técnico resumido é registrado.
