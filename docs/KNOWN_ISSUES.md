# Limitações conhecidas

## Lote 06

- A captura requer HTTPS/localhost, permissão do navegador, microfone e suporte a `MediaRecorder`; não é possível validá-la integralmente no ambiente automatizado.
- A importação depende dos codecs aceitos por cada navegador; formatos incompatíveis ou corrompidos recebem erro de decodificação.
- Ainda não foram testados manualmente arquivos de referência, codec, duração máxima ou limites de memória em navegador real.
- A primeira transcrição aceita apenas uma linha monofônica de até 90 segundos; não separa acordes, vozes, instrumentos ou fontes sobrepostas.
- Ruído, reverberação, ataques fracos, respirações, portamento e erros de oitava podem reduzir a confiança ou gerar resultados incorretos; os trechos marcados como revisão não são corrigidos automaticamente.
- Ainda não há validação manual contra gravações vocais anotadas nem métrica pública de precisão.
- O editor é temporário e perde alterações ao recarregar, trocar o áudio ou executar nova transcrição; não há autosave ou recuperação.
- O piano roll desta etapa usa seleção e painel de propriedades, não arrasto/redimensionamento direto, reprodução MIDI ou acompanhamento de áudio.
- A tonalidade é uma candidata por escala/duração; não trata modulações, acordes, métrica, ambiguidade relativa ou cromatismo como análise definitiva.
- Não há remoção de ruído, correção automática, andamento, acordes ou harmonia.
- Não há motor harmônico, arranjo SATB, instrumentos virtuais, mixer ou partitura.
- Não há IndexedDB, exportação ou PWA instalada.
- As sessões, os arquivos importados e as análises existem apenas enquanto a aba permanece aberta; não são projetos salvos.
- A publicação do GitHub Pages foi confirmada para o Lote 05. A inspeção visual/manual do Lote 06 por toque/mouse, além de arquivos de referência e microfone físico, permanece pendente.
- O conteúdo integral dos documentos mestres originais não foi publicado neste repositório público; somente um escopo técnico resumido é registrado.
