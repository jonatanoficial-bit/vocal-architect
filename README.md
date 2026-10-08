# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.3.0 — Lote 03: Gravador.** O dashboard e o estúdio agora incluem gravação real por microfone em navegadores compatíveis: pedido explícito de permissão, nível de entrada, pausa quando suportada, encerramento, cancelamento e reprodução do `Blob` capturado. A gravação permanece apenas na sessão atual do navegador e não é enviada a servidores.

Importação, processamento de áudio, transcrição, harmonia, transporte multipista, persistência e exportação ainda **não** estão disponíveis. Para gravar, abra o app por HTTPS (como o GitHub Pages) ou em `localhost` e conceda permissão ao microfone.

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
