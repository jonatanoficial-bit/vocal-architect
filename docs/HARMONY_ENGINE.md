# Motor harmônico — Lote 07

O motor recebe exclusivamente a cópia de `NoteEvent` confirmada no editor de melodia. A análise é local, efêmera e não reescreve as notas, o áudio original nem o resultado de transcrição.

## Fluxo

1. O músico revisa e confirma a melodia.
2. O motor agrupa notas por `phraseId` quando disponível ou por pausas acima de 960 ticks.
3. A tonalidade assistida do editor define uma escala maior ou menor candidata.
4. Para cada frase, o motor compara tríades diatônicas, pontua duração em tons do acorde, aplica uma preferência leve por encadeamentos funcionais e registra notas não pertencentes ao acorde ou à escala.
5. A tela mostra a proposta por frase, seu grau, função, encaixe e alternativas — nunca como verdade definitiva.

O contrato também representa sétimas e inversões, mas a primeira inferência exposta usa tríades diatônicas fundamentais. O Lote 08 consome essas tríades para criar alternativas SATB; condução de sétimas, escolha manual de inversões e estilos avançados permanecem etapas posteriores.

## Limites importantes

- Não há transcrição polifônica: uma gravação com acordes, várias vozes ou instrumentos não é separada nem reconhecida como harmonia.
- A análise depende de uma melodia monofônica confirmada e pode ser ambígua em material cromático, modal ou com poucas notas.
- Um conflito é uma indicação para revisão, não uma proibição automática. Nenhuma nota confirmada ou bloqueada é alterada.
- O resultado desaparece ao recarregar a página, substituir o áudio ou editar novamente a melodia.
