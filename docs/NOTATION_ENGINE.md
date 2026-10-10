# Notação e MusicXML — Lote 12

O Lote 12 transforma o arranjo SATB atual em uma partitura local. A fonte continua sendo o modelo canônico de `VocalPart` e `NoteEvent`; a pauta não é usada para editar nem para inventar dados musicais.

## O que é gerado

- Uma partitura geral e uma visualização individual para soprano, contralto, tenor e baixo.
- Claves de sol para soprano, dó para contralto, sol oitavada abaixo para tenor e fá para baixo.
- Armadura a partir do contexto tonal assistido, fórmula de compasso 4/4, andamento inicial de 96 BPM e cifras da análise harmônica.
- Compassos de 3.840 ticks (PPQ 960), pausas que completam cada compasso e ligaduras quando uma nota atravessa uma barra de compasso.
- MusicXML 4.0 em memória com partes, atributos de notação, notas, pausas, cifras e ligaduras.

## Limites

- A partitura é uma leitura local do arranjo atual, inclusive suas edições em memória. Trocar a alternativa ou recarregar a página substitui o rascunho.
- A tonalidade e as cifras continuam candidatas da análise local; elas não representam revisão editorial ou validação musical definitiva.
- O MusicXML pode ser conferido na interface, mas download, importação, PDF e validação contra leitores externos pertencem ao Lote 14.
- A visualização foi construída sobre o domínio musical do app para manter o bundle leve e funcionar em GitHub Pages; não substitui revisão tipográfica profissional nem um renderizador editorial completo.
