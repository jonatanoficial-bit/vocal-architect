# Transcrição — Lote 05

O Lote 05 implementa uma primeira transcrição **monofônica** local. Ela recebe o `DecodedAudio` já reduzido a PCM mono, limita a análise a 90 segundos e nunca envia o conteúdo para um servidor.

## Pipeline

1. Reamostra o PCM para 8 kHz apenas para a análise de pitch.
2. Mede RMS e estima a frequência fundamental por janela de 1024 amostras e salto de 256 amostras, usando YIN.
3. Converte frequência em MIDI somente quando a confiança é de pelo menos 72% e a energia supera o limiar configurado.
4. Suaviza o pitch aceito por mediana temporal de três janelas.
5. Cria uma nova nota somente após cinco janelas consecutivas de mudança consistente (aproximadamente 160 ms), com tolerância de 0,75 semitom e duração mínima de 120 ms.
6. Converte cada segmento em `NoteEvent` canônico, com tempo em ticks (`PPQ = 960`), origem, frase, confiança e marcação de revisão quando a confiança fica abaixo de 85%.

A mediana temporal e a mudança persistente evitam transformar vibrato moderado e janelas de transição em várias notas. Pausas sem pitch confiável encerram segmentos. O BPM 120 exibido é uma base de conversão de tempo para ticks, não é uma detecção de andamento nem uma quantização musical.

## Limites honestos

- O detector foi projetado para uma voz solo/linha monofônica, com frequência entre 80 e 1000 Hz.
- Não separa acordes, múltiplas vozes ou instrumentos; esses materiais podem gerar ausência de notas ou resultados a revisar.
- Ruído, reverberação, respiração, ataques fracos, portamento e erros de oitava ainda exigem avaliação humana. Não existe correção automática neste lote.
- Os testes automatizados usam sinais sintéticos reprodutíveis. Ainda não há métrica de precisão declarada nem validação manual contra gravações vocais de referência.

O editor de melodia do Lote 06 será responsável por permitir a revisão e a correção explícita dessas primeiras leituras, preservando notas bloqueadas.
