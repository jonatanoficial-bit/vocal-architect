# Changelog

## 0.11.0 — 2026-10-10

- Adicionado fluxo guiado de harmonização com instruções claras e exemplo local explicitamente identificado.
- Adicionada troca de acordes por frase entre candidatos reais, com conflitos recalculados.
- Adicionado editor SATB com bloqueio por nota, edição segura, desfazer/refazer, comparação e regeneração de frase.
- Alterações que causam tessitura inválida, sobreposição, cruzamento ou paralelos perfeitos são recusadas.
- Persistência, partitura, MusicXML, edição por arrastar, voz humana e exportação continuam indisponíveis.

## 0.10.0 — 2026-10-09

- Adicionado mixer SATB local com solo, mute, volume e pan estéreo quando suportado pelo navegador.
- Adicionados presets de conjunto, somente meu naipe e meu naipe em destaque, além de ensaio lento reversível.
- Adicionado loop regional com início/fim em ticks, corte seguro de notas sustentadas e reinício no trecho selecionado.
- Reorganizados os controles de ensaio antes dos cartões de notas para reduzir a rolagem no celular.
- Acompanhamento instrumental externo, metrônomo, voz humana, persistência, efeitos e exportação continuam indisponíveis.

## 0.9.0 — 2026-10-09

- Adicionado piano sintetizado localmente por Web Audio para alternativas SATB já geradas.
- Adicionado transporte por ticks com reproduzir, pausar, parar, reiniciar, seek, BPM e loop integral, com interrupção segura das notas.
- Adicionada audição conjunta ou isolada por naipe e indicador de atividade durante a reprodução.
- Adicionados testes de tempo, duração, seek de notas sustentadas, encerramento e loop.
- Áudio original, mixer avançado, metrônomo, contagem, pan, volume por trilha e exportação continuam fora do escopo.

## 0.8.0 — 2026-10-09

- Adicionado motor local de composição SATB com busca conjunta das quatro vozes, tessituras, condução e até três alternativas.
- A melodia pode permanecer em soprano, contralto, tenor ou baixo; sua altura, tempo, duração e bloqueios são preservados.
- Adicionadas validações para tessitura, cruzamento, espaçamento, quintas e oitavas paralelas, além de aviso de cadência não conclusiva.
- Adicionados controles funcionais de tessitura e uma apresentação móvel das partes, identificadas por nome e cor.
- Reprodução, edição das vozes, estilos avançados, exportação e transcrição polifônica continuam indisponíveis.

## 0.7.0 — 2026-10-09

- Adicionado motor local de contexto tonal, frases, acordes, funções, progressões, candidatos, pontuação e conflitos verticais.
- A análise é habilitada somente após a confirmação da melodia e preserva a cópia de `NoteEvent`, incluindo bloqueios, sem alterar o áudio.
- Reorganizado o estúdio em etapas funcionais de Áudio, Melodia e Harmonia; no celular, isso remove os cartões de áudio de cima do piano roll.
- O piano roll passou a usar uma janela com rolagem interna e os controles móveis ganharam áreas de toque maiores.
- Documentados os limites: não há transcrição polifônica, reconhecimento de acordes no áudio nem geração SATB nesta versão.

## 0.6.0 — 2026-10-08

- Adicionado editor de melodia em memória com piano roll, seleção, zoom visual e painel de propriedades baseado em ticks/MIDI.
- Adicionadas operações canônicas para editar, adicionar, duplicar, dividir, unir, excluir, bloquear e quantizar notas, preservando bloqueios.
- Adicionado histórico local limitado com Undo/Redo, tonalidade candidata por duração de escala e confirmação explícita da melodia.
- Adicionados testes para edição, bloqueio, quantização, divisão/união, histórico e análise tonal assistida.
- Documentados o caráter efêmero do editor, a ausência de reprodução/arrasto direto e a limitação da tonalidade a uma pista local.
- Harmonia, acordes, transporte, persistência e exportação continuam indisponíveis.

## 0.5.0 — 2026-10-08

- Adicionado reconhecimento local de pitch monofônico por YIN a partir do PCM já decodificado.
- Adicionados limiares de RMS/confiança, suavização temporal, confirmação de mudança de altura e segmentação em `NoteEvent` canônico.
- Adicionado painel de transcrição explícito com frequência, confiança, duração, diagnósticos e marcação de trechos a revisar.
- Adicionados testes sintéticos para A4, duas notas com pausa, troca de altura sustentada e vibrato moderado.
- Documentados limite de 90 segundos, suporte apenas monofônico e ausência de métrica de precisão até existir validação com gravações vocais de referência.
- Editor de melodia, correção de pitch, polifonia, harmonia, persistência e exportação continuam indisponíveis.

## 0.4.0 — 2026-10-08

- Adicionada importação local de áudio com validação de tipo/conteúdo, limite de tamanho, duração e memória.
- Adicionadas decodificação para PCM mono, waveform real, análise de energia e regiões de silêncio sustentadas.
- Conectada a gravação da sessão ao mesmo pipeline de análise, com descarte de URLs temporárias.
- Adicionado contrato de mensagens para Worker futuro, sem ativar processamento em segundo plano nesta versão.
- Adicionados testes para downmix, waveform, energia, silêncio e validação de entrada.
- Confirmados os workflows remotos de qualidade e GitHub Pages para esta versão.
- Transcrição, pitch, redução de ruído e identificação de frases ou notas continuam indisponíveis.

## 0.3.0 — 2026-10-08

- Adicionado gravador de microfone real com permissão explícita, `MediaRecorder` e captura local temporária.
- Adicionados duração, pausa/retomada quando suportadas, cancelamento, nível RMS, clipping, tratamento de erros e reprodução do áudio capturado.
- Adicionadas rotinas de liberação de faixas, contexto de áudio e URL temporária.
- Adicionados testes de utilitários de captura e de solicitação explícita de microfone.
- Confirmados os workflows remotos de qualidade e GitHub Pages para esta versão.
- Importação, processamento, transcrição, persistência e transporte multipista continuam fora do escopo.

## 0.2.0 — 2026-10-08

- Adicionados dashboard, sessão temporária de projeto e layout de estúdio responsivo.
- Adicionados estados vazios, feedback de compatibilidade e navegação acessível.
- Mantida a indisponibilidade explícita de áudio, harmonia, transporte e salvamento.
- Confirmados CI e publicação por GitHub Pages.

## 0.1.0 — 2026-10-08

- Criada a fundação React, TypeScript e Vite.
- Adicionadas navegação estática por hash, identidade visual e design tokens.
- Adicionados testes iniciais, scripts de qualidade e workflows de CI/GitHub Pages.
- Registrados escopo público do Lote 01, arquitetura, decisões e checkpoint.
- Confirmado o workflow remoto de qualidade; registrado bloqueio de ativação do GitHub Pages.
