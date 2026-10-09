# Reprodução SATB — Lote 09

O transporte só aparece depois que o músico escolhe uma alternativa SATB válida. O navegador sintetiza um piano simples com Web Audio; não há upload, streaming ou síntese de voz humana.

## Funcionamento

- Os tempos canônicos continuam em ticks. A conversão para segundos é feita somente no agendamento, usando `PPQ` e o BPM escolhido.
- Cada nota é agendada no relógio do `AudioContext`, com ataque, sustentação e liberação. A interface pode atualizar o playhead por animação, mas não dispara notas com `setInterval`.
- Pausar calcula a posição atual pelo relógio de áudio e encerra as fontes pendentes. Continuar reagenda as notas restantes, incluindo notas sustentadas no ponto de retorno.
- Parar, reiniciar e seek cortam os osciladores atuais antes de programar novos, evitando notas presas.
- O loop repete o arranjo inteiro. Selecionar um naipe altera o ganho das demais partes imediatamente, permitindo audição individual.

## Limites

- Instrumento disponível: piano sintetizado. Ele é um guia de estudo, não uma simulação acústica de piano nem uma voz cantada.
- O loop ainda não seleciona trechos; BPM altera somente as notas sintetizadas, não estica o áudio original.
- Mixer completo, pan, volume por trilha, metrônomo, contagem e exportação pertencem às fases seguintes.
