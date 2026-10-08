# Modelo canônico de dados

O Lote 01 introduz `NoteEvent`, `VocalPart` e `PPQ = 960` em `src/music/types.ts`. Notas usam `startTick` e `durationTicks`, nunca coordenadas visuais ou somente segundos. A grafia (`spelling`) é separada de `pitchMidi` para preservar contexto enarmônico.

O Lote 04 adiciona contratos transitórios de áudio em `src/audio/processing/types.ts`: `AudioAsset`, `DecodedAudio`, `AudioAnalysis`, `EnergyFrame`, `WaveformPeak` e `SilenceRegion`. `DecodedAudio` usa PCM mono em memória e registra `sampleRate`, canais de origem, duração e tamanho decodificado; esses dados não são ainda serializados no projeto.

Persistência, serialização e migrações ainda não existem; pertencem ao Lote 13. `ChordEvent`, histórico semântico e dados de gravação devem ser adicionados antes de seus fluxos consumidores.
