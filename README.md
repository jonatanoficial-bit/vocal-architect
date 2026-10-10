# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.12.0 — Lote 12: notação e leitura musical.** Além da gravação, análise e transcrição monofônica locais, o estúdio agora explica o caminho completo para gerar harmonia: confirmar a melodia, analisar os acordes e criar o SATB. Depois de gerar o arranjo, a partitura é montada localmente com visualização geral ou por naipe, claves, armadura, compasso, cifras, pausas e ligaduras. Também há MusicXML real para conferência na própria sessão. O piano sintetizado e o mixer continuam locais; nenhum áudio é enviado a servidores.

O reconhecimento aceita uma voz principal por vez e limita a análise a 90 segundos. A identificação tonal, as propostas de acorde e a armadura são pistas calculadas pelas notas/durações, não uma confirmação musical definitiva. O editor não altera o áudio original, preserva notas bloqueadas e rejeita edições que saiam da tessitura ou cruzem as vozes, mas não separa fontes nem remove ruído. O MusicXML ainda não pode ser baixado ou importado e a partitura não é uma preparação editorial para impressão. O piano de ensaio não é voz humana, não inclui acompanhamento instrumental externo, metrônomo ou exportação; persistência e projetos salvos continuam indisponíveis. Para gravar, abra o app por HTTPS (como o GitHub Pages) ou em `localhost` e conceda permissão ao microfone. A importação é limitada a 50 MB, até 10 minutos e aos formatos que o navegador conseguir decodificar.

## Desenvolvimento

Requer Node 24 ou compatível e pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm run quality
pnpm dev
```

## GitHub Pages

O workflow de deploy gera arquivos estáticos com a base `/vocal-architect/` e só publica depois das verificações de tipos, lint, testes e build. O GitHub Pages está ativo em [jonatanoficial-bit.github.io/vocal-architect](https://jonatanoficial-bit.github.io/vocal-architect/).

## Documentação

Os requisitos, decisões, roadmap e checkpoint ficam em [`docs/`](docs). Leia `AGENTS.md` antes de continuar um lote.
