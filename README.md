# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.11.0 — Lote 11: harmonia guiada e edição de arranjo.** Além da gravação, análise e transcrição monofônica locais, o estúdio agora explica o caminho completo para gerar harmonia: confirmar a melodia, analisar os acordes e criar o SATB. Há também um exemplo de estudo local para experimentar o fluxo sem gravação. Depois de gerar o arranjo, é possível escolher candidatas reais de acorde, ajustar cada voz, bloquear notas importantes, desfazer/refazer, regenerar somente uma frase e comparar a versão editada com a original. O piano sintetizado e o mixer continuam locais; nenhum áudio é enviado a servidores.

O reconhecimento aceita uma voz principal por vez e limita a análise a 90 segundos. A identificação tonal e as propostas de acorde são pistas calculadas pelas notas/durações, não uma confirmação musical definitiva. O editor não altera o áudio original, preserva notas bloqueadas e rejeita edições que saiam da tessitura ou cruzem as vozes, mas não separa fontes nem remove ruído. O piano de ensaio não é voz humana, não inclui acompanhamento instrumental externo, metrônomo ou exportação; persistência e projetos salvos continuam indisponíveis. Para gravar, abra o app por HTTPS (como o GitHub Pages) ou em `localhost` e conceda permissão ao microfone. A importação é limitada a 50 MB, até 10 minutos e aos formatos que o navegador conseguir decodificar.

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
