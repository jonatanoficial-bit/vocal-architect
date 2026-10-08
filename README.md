# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.6.0 — Lote 06: Editor de melodia.** Além da gravação, análise e transcrição monofônica locais, o estúdio oferece um piano roll para revisar a cópia musical em memória: altura, início, duração, bloqueio, divisão, união, duplicação, exclusão, quantização, Undo/Redo e confirmação explícita. Todo o processamento ocorre na aba; o arquivo não é enviado a servidores.

O reconhecimento aceita uma voz principal por vez e limita a análise a 90 segundos. A identificação tonal é apenas uma pista baseada nas notas/durações e não uma confirmação harmônica. O editor não altera o áudio original, não separa fontes, não remove ruído e não tem reprodução MIDI. Harmonia, transporte multipista, persistência e exportação ainda **não** estão disponíveis. Para gravar, abra o app por HTTPS (como o GitHub Pages) ou em `localhost` e conceda permissão ao microfone. A importação é limitada a 50 MB, até 10 minutos e aos formatos que o navegador conseguir decodificar.

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
