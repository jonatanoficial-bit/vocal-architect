# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.2.0 — Lote 02: Interface premium.** O dashboard, a sessão temporária de projeto e o layout responsivo do estúdio estão implementados. Gravação, transcrição, harmonização, reprodução, persistência e exportação ainda **não** estão disponíveis.

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
