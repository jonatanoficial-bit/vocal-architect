# Motor de áudio

## Lote 03 — Captura local

O gravador usa as APIs nativas do navegador, sem backend:

- `getUserMedia` só é chamado após o usuário acionar **Iniciar gravação**.
- `MediaRecorder` produz o `Blob` de áudio e prioriza MIME compatível (`audio/webm;codecs=opus`, `audio/webm` ou `audio/mp4`).
- `AudioContext` e `AnalyserNode` calculam nível RMS e indicam clipping em tempo real, sem encaminhar o sinal ao alto-falante.
- O elemento `<audio>` reproduz a URL temporária criada a partir do `Blob` capturado.
- Cancelamento, erro, encerramento e desmontagem liberam as faixas de `MediaStream` e o contexto de análise.

A captura exige HTTPS ou `localhost`, `MediaRecorder` e um microfone disponibilizado pelo navegador. O áudio é temporário: não há importação, waveform, PCM, tratamento, armazenamento local ou envio para servidores neste lote.
