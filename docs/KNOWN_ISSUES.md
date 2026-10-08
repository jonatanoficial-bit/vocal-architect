# Limitações conhecidas

## Lote 05

- A captura requer HTTPS/localhost, permissão do navegador, microfone e suporte a `MediaRecorder`; não é possível validá-la integralmente no ambiente automatizado.
- A importação depende dos codecs aceitos por cada navegador; formatos incompatíveis ou corrompidos recebem erro de decodificação.
- Ainda não foram testados manualmente arquivos de referência, codec, duração máxima ou limites de memória em navegador real.
- A primeira transcrição aceita apenas uma linha monofônica de até 90 segundos; não separa acordes, vozes, instrumentos ou fontes sobrepostas.
- Ruído, reverberação, ataques fracos, respirações, portamento e erros de oitava podem reduzir a confiança ou gerar resultados incorretos; os trechos marcados como revisão não são corrigidos automaticamente.
- Ainda não há validação manual contra gravações vocais anotadas nem métrica pública de precisão.
- Não há remoção de ruído, correção de melodia, editor de notas, quantização, andamento ou tonalidade.
- Não há motor harmônico, arranjo SATB, instrumentos virtuais, mixer ou partitura.
- Não há IndexedDB, exportação ou PWA instalada.
- As sessões, os arquivos importados e as análises existem apenas enquanto a aba permanece aberta; não são projetos salvos.
- A publicação do GitHub Pages foi confirmada para o Lote 04. A inspeção visual/manual do Lote 05 com arquivos de referência e microfone físico ainda permanece pendente.
- O conteúdo integral dos documentos mestres originais não foi publicado neste repositório público; somente um escopo técnico resumido é registrado.
