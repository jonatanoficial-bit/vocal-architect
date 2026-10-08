# Editor de melodia — Lote 06

O editor recebe uma cópia dos `NoteEvent` produzidos pela transcrição e existe somente na memória da sessão. Ele não sobrescreve o PCM, o arquivo de áudio ou o `TranscriptionResult` que o originou.

## Operações disponíveis

- Selecionar uma nota no piano roll e editar altura MIDI, início e duração em ticks.
- Adicionar, duplicar, dividir, unir à próxima nota ou excluir uma nota.
- Bloquear/desbloquear uma nota. Enquanto bloqueada, ela não é movida, redimensionada, removida, dividida, unida, duplicada ou quantizada.
- Quantizar notas desbloqueadas a 1/16, 1/8 ou 1/4.
- Desfazer/refazer até 60 operações locais.
- Consultar uma tonalidade candidata por distribuição de durações nas escalas maior/menor e confirmar a melodia explicitamente.

As operações editadas recebem origem `edited`; a grafia é recalculada a partir do MIDI e todos os tempos continuam em ticks. A confirmação não produz harmonia nem salva um projeto: ela apenas registra que a cópia atual foi revisada nesta aba.

## Limites

- O piano roll básico é operado por seleção e painel de propriedades; ele não reproduz MIDI nem move notas por arrasto nesta etapa.
- Não há quantização de áudio, estimativa de BPM, detecção tonal definitiva, acordes, correção automática ou persistência.
- A tonalidade exibida é uma pista local. Escalas relativas e melodias cromáticas podem produzir candidatas ambíguas.
- Recarregar a página, trocar o áudio ou executar nova transcrição substitui a cópia editável; a persistência será tratada no Lote 13.
