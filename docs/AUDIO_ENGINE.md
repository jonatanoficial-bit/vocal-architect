# Motor de áudio

## Lote 03 — Captura local

O gravador usa as APIs nativas do navegador, sem backend:

- `getUserMedia` só é chamado após o usuário acionar **Iniciar gravação**.
- `MediaRecorder` produz o `Blob` de áudio e prioriza MIME compatível (`audio/webm;codecs=opus`, `audio/webm` ou `audio/mp4`).
- `AudioContext` e `AnalyserNode` calculam nível RMS e indicam clipping em tempo real, sem encaminhar o sinal ao alto-falante.
- O elemento `<audio>` reproduz a URL temporária criada a partir do `Blob` capturado.
- Cancelamento, erro, encerramento e desmontagem liberam as faixas de `MediaStream` e o contexto de análise.

A captura exige HTTPS ou `localhost`, `MediaRecorder` e um microfone disponibilizado pelo navegador. O áudio é temporário: não há importação, waveform, PCM, tratamento, armazenamento local ou envio para servidores neste lote.

## Lote 04 — Importação e preparação

- O seletor aceita arquivos de áudio compatíveis com o navegador, valida tipo/extensão, conteúdo e o limite de 50 MB antes da decodificação.
- `AudioContext.decodeAudioData` transforma o `Blob` em `AudioBuffer`; os canais são reduzidos para PCM mono sem alterar o buffer de origem.
- O pipeline calcula picos para waveform, energia RMS em janelas de 20 ms e regiões de silêncio com no mínimo 300 ms.
- Para reduzir risco de memória, o áudio decodificado é limitado a 10 minutos e 96 MB. URLs temporárias são revogadas ao substituir ou remover o ativo.
- A análise é local e preparatória. Não remove ruído, não estima frequência, não cria frases e não identifica notas ou acordes.

`workerProtocol.ts` registra o contrato transferível de análise para Worker futuro; nenhum Worker é anunciado como ativo nesta versão.

## Lote 05 — Pitch e segmentação monofônica

- `src/audio/transcription/pitch.ts` reamostra o PCM mono para 8 kHz e estima frequência fundamental por YIN em janelas de 1024 amostras com salto de 256 amostras.
- Cada `PitchFrame` registra tempo, RMS, frequência, confiança e MIDI contínuo somente quando passa o limiar de confiança.
- Uma mediana temporal de três janelas e uma confirmação de cinco janelas de mudança reduzem oscilações de vibrato e notas espúrias nas transições.
- `src/audio/transcription/transcribe.ts` agrupa os quadros em notas MIDI, calcula duração em ticks no BPM-base de 120 e preserva origem `recorded` ou `imported`.
- A transcrição é iniciada explicitamente pelo músico, é local e aceita no máximo 90 segundos. Não há Worker ativo, redução de ruído, separação de fontes, detecção de andamento ou correção automática.
