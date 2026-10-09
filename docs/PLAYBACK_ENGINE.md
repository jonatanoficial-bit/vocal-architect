# Reprodução e ensaio SATB — Lotes 09–10

O transporte só aparece depois que o músico escolhe uma alternativa SATB válida. O navegador sintetiza um piano simples com Web Audio; não há upload, streaming ou síntese de voz humana.

## Funcionamento

- Os tempos canônicos continuam em ticks. A conversão para segundos é feita somente no agendamento, usando `PPQ` e o BPM escolhido.
- Cada nota é agendada no relógio do `AudioContext`, com ataque, sustentação e liberação. A interface pode atualizar o playhead por animação, mas não dispara notas com `setInterval`.
- Pausar calcula a posição atual pelo relógio de áudio e encerra as fontes pendentes. Continuar reagenda as notas restantes, incluindo notas sustentadas no ponto de retorno.
- Parar, reiniciar e seek cortam os osciladores atuais antes de programar novos, evitando notas presas.
- O mixer controla ganho, mute, solo e pan por naipe no mesmo grafo de áudio. Solo prevalece sobre mute; pan só aparece ativo quando o navegador oferece `StereoPannerNode`.
- Os presets permitem ouvir o conjunto, apenas o naipe escolhido ou o naipe escolhido em destaque. O ensaio lento reduz temporariamente o BPM e restaura o valor anterior ao ser desligado.
- O loop pode usar o arranjo inteiro ou um trecho escolhido em ticks. O agendamento corta notas que ultrapassariam o final do trecho e reinicia no início selecionado.

## Limites

- Instrumento disponível: piano sintetizado. Ele é um guia de estudo, não uma simulação acústica de piano nem uma voz cantada.
- BPM altera somente as notas sintetizadas, não estica o áudio original. Os ajustes de mix são temporários e se perdem ao recarregar a aba ou trocar a alternativa.
- Não há acompanhamento instrumental externo, metrônomo, contagem, automação de mixer, efeitos, síntese de voz humana ou exportação.
