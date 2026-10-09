# Escopo público de requisitos — Lotes 01 a 07

Este repositório público registra apenas os requisitos necessários para a fundação. Os documentos mestres integrais do produto foram fornecidos separadamente e não são republicados sem autorização explícita do proprietário.

## Entregas desta etapa

- Aplicação React, TypeScript e Vite com estrutura modular.
- Identidade inicial, design tokens e páginas de Início, Arquitetura e Roadmap.
- Navegação estática compatível com GitHub Pages.
- Modelo musical inicial com tempo baseado em ticks e PPQ 960.
- Testes de interface, typecheck, lint, build, CI e workflow de deploy.
- Checkpoint, decisões e documentação de continuidade.

## Fora do escopo desta etapa

Harmonização, arranjo SATB, transporte multipista, projetos locais, exportação e PWA instalada. Essas capacidades só serão incluídas quando implementadas e validadas nos lotes próprios.

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

## Entregas do Lote 04

- Seleção de arquivo de áudio com validação de conteúdo, formato e limite de tamanho antes da decodificação.
- Decodificação local com API nativa do navegador e redução dos canais para PCM mono.
- Identificação de duração, taxa de amostragem, canais de origem e tamanho do PCM em memória.
- Waveform derivada dos picos reais do PCM, análise de energia RMS e regiões de silêncio sustentadas.
- Limites de duração e memória, descarte de URLs temporárias e mensagens claras para arquivos inválidos ou não decodificáveis.
- Contrato de mensagens preparado para processamento em Worker futuro, sem alegar Worker ativo.

## Fora do escopo do Lote 04

- Remoção de ruído, análise de frequência fundamental, segmentação de frases, reconhecimento de notas, acordes ou transcrição.
- Aceitação universal de codecs: o navegador precisa conseguir decodificar o formato selecionado.

## Entregas do Lote 05

- Estimativa local de frequência fundamental por YIN em PCM mono, com RMS, faixa de frequência e confiança mínima configuráveis.
- Suavização temporal e mudança de altura persistente antes da criação de uma nova nota, para reduzir efeitos de vibrato e transições de janela.
- Segmentos convertidos para `NoteEvent` com origem, tempo em ticks, duração, frase, confiança e indicação de revisão.
- Painel de reconhecimento acionado explicitamente, com notas, frequência, intervalos e diagnósticos visíveis ao músico.
- Testes reprodutíveis para pitch A4, pausas, mudança sustentada de altura e vibrato moderado.

## Fora do escopo do Lote 05

- Separação de acordes, múltiplas vozes, instrumentos ou fontes de áudio.
- Remoção de ruído, identificação confiável de respiração, detecção de andamento, quantização, tonalidade ou acordes.
- Correção de pitch, edição de notas, bloqueio manual, playback MIDI e exportação.
- Promessa de taxa de precisão sem experimento reprodutível com gravações de referência.

## Entregas do Lote 06

- Piano roll funcional que mostra os `NoteEvent` editáveis em ticks/MIDI, com seleção e controles de zoom visual.
- Edição manual de altura, posição e duração; adição, duplicação, divisão, união e exclusão de notas.
- Bloqueio explícito de notas e preservação de bloqueios durante todas as operações de edição e quantização.
- Quantização a grades musicais, histórico limitado de operações semânticas com Undo/Redo e confirmação da melodia na sessão.
- Análise tonal assistida baseada nas notas/durações, sem alegar confirmação musical definitiva.
- Testes de integridade para edição, bloqueio, quantização, divisão/união, histórico e tonalidade candidata.

## Fora do escopo do Lote 06

- Arrastar/redimensionar notas diretamente no piano roll, reprodução MIDI, transporte e sincronização com áudio.
- Correção automática, detecção de BPM/compasso, tonalidade definitiva, acordes, harmonia ou arranjo SATB.
- Persistência, autosave, colaboração, importação/exportação e recuperação após recarregar a aba.

## Entregas do Lote 07

- Modelo local de acordes, incluindo tríades, sétimas e inversões no domínio musical.
- Análise de frases baseada nos identificadores da transcrição e em pausas sustentadas.
- Contexto tonal assistido, candidatos diatônicos, função harmônica, progressão pontuada e indicação de conflitos verticais.
- Análise acionada somente depois da confirmação explícita da melodia; o motor apenas lê a cópia revisada e preserva notas bloqueadas.
- Área de trabalho por etapa — Áudio, Melodia e Harmonia — com controles de toque proporcionais e piano roll com rolagem interna para telas pequenas.

## Fora do escopo do Lote 07

- Separação de fontes, reconhecimento de acordes, instrumentos ou múltiplas vozes em um áudio polifônico.
- Geração de partes SATB, condução de vozes, playback MIDI, inversões selecionáveis na interface, persistência ou exportação.
- Garantia de que a tonalidade candidata ou a progressão proposta substitua avaliação musical humana.
