# Limitações conhecidas

## Lote 11

- A captura requer HTTPS/localhost, permissão do navegador, microfone e suporte a `MediaRecorder`; não é possível validá-la integralmente no ambiente automatizado.
- A importação depende dos codecs aceitos por cada navegador; formatos incompatíveis ou corrompidos recebem erro de decodificação.
- Ainda não foram testados manualmente arquivos de referência, codec, duração máxima ou limites de memória em navegador real.
- A primeira transcrição aceita apenas uma linha monofônica de até 90 segundos; não separa acordes, vozes, instrumentos ou fontes sobrepostas.
- Ruído, reverberação, ataques fracos, respirações, portamento e erros de oitava podem reduzir a confiança ou gerar resultados incorretos; os trechos marcados como revisão não são corrigidos automaticamente.
- Ainda não há validação manual contra gravações vocais anotadas nem métrica pública de precisão.
- O editor é temporário e perde alterações ao recarregar, trocar o áudio ou executar nova transcrição; não há autosave ou recuperação.
- O piano roll usa seleção e painel de propriedades, não arrasto/redimensionamento direto nem acompanhamento do áudio original.
- A tonalidade é uma candidata por escala/duração; não trata modulações, acordes, métrica, ambiguidade relativa ou cromatismo como análise definitiva.
- Não há remoção de ruído, correção automática, detecção de andamento ou reconhecimento de acordes no áudio.
- Não há acompanhamento instrumental externo, metrônomo, contagem, voz humana, automação de mix, partitura, persistência ou exportação.
- Não há IndexedDB, exportação ou PWA instalada.
- As sessões, os arquivos importados e as análises existem apenas enquanto a aba permanece aberta; não são projetos salvos.
- A harmonia e as alternativas de acorde são sugestões locais. O botão de edição só expõe candidatas que o próprio analisador encontrou, mas a qualidade musical precisa de avaliação com repertório real.
- A edição de SATB é temporária, usa campos de valores em vez de arrastar diretamente as notas e perde o rascunho ao trocar de alternativa ou recarregar a página.
- A publicação do GitHub Pages foi confirmada até o Lote 10. A inspeção visual/manual por toque/mouse — incluindo o fluxo guiado, edição, arquivo de referência, microfone físico e som Web Audio do mixer/loop em dispositivos móveis — permanece pendente.
- O conteúdo integral dos documentos mestres originais não foi publicado neste repositório público; somente um escopo técnico resumido é registrado.
