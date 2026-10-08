# Checkpoint de continuidade

PROJETO: VOCAL ARCHITECT  
VERSÃO: 0.5.0
LOTE: 05 — Reconhecimento de notas
DATA: 2026-10-08  
BRANCH: main  
COMMIT FUNCIONAL: e7879fe — feat(transcription): add local monophonic note recognition.

## IMPLEMENTADO

- Fundação React, TypeScript, Vite, rotas por hash, sessão temporária, design responsivo e deploy estático.
- Captura local com permissão explícita, `MediaRecorder`, nível RMS, clipping, pausa quando suportada, reprodução e liberação de recursos.
- Importação local validada, decodificação nativa, PCM mono, waveform, energia, regiões de silêncio e descarte de URLs temporárias.
- Detector de pitch monofônico YIN em `src/audio/transcription`, com reamostragem de análise a 8 kHz, janela de 1024 amostras e salto de 256 amostras.
- Limiar de RMS, faixa de 80–1000 Hz, confiança mínima de 72%, mediana temporal de três janelas e confirmação de cinco janelas para uma mudança de nota.
- Segmentos convertidos em `NoteEvent` canônico com origem, frase, confiança, duração em ticks e sinalização de revisão abaixo de 85% de confiança.
- Painel de transcrição acionado explicitamente para áudio já decodificado, com notas, frequência, intervalos, diagnósticos e limites visíveis.
- Testes sintéticos reprodutíveis para A4, pausas, mudança sustentada de pitch e vibrato moderado.

## TESTADO

- `pnpm run typecheck` — concluído sem erros.
- `pnpm run lint` — concluído sem avisos.
- `pnpm run test` — 4 arquivos e 15 testes aprovados.
- `pnpm run quality` — concluído sem erros; typecheck, lint, testes e build executados.
- `GITHUB_ACTIONS=true pnpm run build` — concluído; bundle gerado com a base `/vocal-architect/` e 52 módulos.
- Workflows remotos do Lote 05 — pendentes após o push deste checkpoint.

## NÃO TESTADO

- Inspeção visual manual em navegador real e breakpoints de referência.
- Gravação com microfone físico, pausa/retomada, cancelamento e reprodução em navegadores compatíveis.
- Importação/decodificação de arquivos reais, codecs incompatíveis, duração máxima e orçamento de memória em navegador compatível.
- Comparação da transcrição com corpus vocal anotado, inclusive ruído, respiração, portamento, vibrato intenso, notas curtas, erros de oitava, acordes e vozes sobrepostas.

## LIMITES ATUAIS

- A transcrição é local, monofônica e limitada a 90 segundos por execução; não separa fontes nem reconhece harmonia.
- Não há métrica de precisão declarada, redução de ruído, correção de pitch, editor, quantização, tonalidade, acordes, playback MIDI ou persistência.
- Os resultados são leituras iniciais. O rótulo de revisão comunica incerteza, mas não substitui uma correção humana.

## PRÓXIMO LOTE

06 — Editor de melodia, somente após confirmação do proprietário e avaliação dos resultados de reconhecimento em gravações de referência.

## INSTRUÇÃO DE RETOMADA

Ler `AGENTS.md`, `docs/REQUIREMENTS_SCOPE.md`, este checkpoint, `docs/ARCHITECTURE.md`, `docs/TRANSCRIPTION.md`, `src/features/audio/useAudioWorkspace.ts`, `src/audio/transcription/transcribe.ts` e os testes antes de modificar o projeto. Consultar os documentos mestres originais somente no canal privado em que foram fornecidos.
