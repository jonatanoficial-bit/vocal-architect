# Changelog

## 0.4.0 — 2026-10-08

- Adicionada importação local de áudio com validação de tipo/conteúdo, limite de tamanho, duração e memória.
- Adicionadas decodificação para PCM mono, waveform real, análise de energia e regiões de silêncio sustentadas.
- Conectada a gravação da sessão ao mesmo pipeline de análise, com descarte de URLs temporárias.
- Adicionado contrato de mensagens para Worker futuro, sem ativar processamento em segundo plano nesta versão.
- Adicionados testes para downmix, waveform, energia, silêncio e validação de entrada.
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
