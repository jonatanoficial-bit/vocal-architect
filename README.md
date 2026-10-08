# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.1.0 — Lote 01: Fundação.** A base React, TypeScript, Vite, navegação estática, design tokens, testes e automações de qualidade/publicação foram implementados. Gravação, transcrição, harmonização, reprodução, persistência e exportação ainda **não** estão disponíveis.

## Desenvolvimento

Requer Node 24 ou compatível e pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm run quality
pnpm dev
```

## GitHub Pages

O workflow de deploy gera arquivos estáticos com a base `/vocal-architect/`. No repositório, configure **Settings → Pages → Source: GitHub Actions** para permitir a primeira publicação. O deploy só é acionado depois das verificações de tipos, lint, testes e build.

## Documentação

Os requisitos, decisões, roadmap e checkpoint ficam em [`docs/`](docs). Leia `AGENTS.md` antes de continuar um lote.
