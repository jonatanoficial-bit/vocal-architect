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
