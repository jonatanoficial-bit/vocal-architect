# Vocal Architect

Aplicação web progressiva de harmonização vocal assistida por computador. O projeto prioriza processamento local, continuidade musical e transparência sobre o que já funciona.

## Estado atual

**Versão 0.5.0 — Lote 05: Reconhecimento de notas.** Além da gravação real por microfone e da análise de áudio, o estúdio estima localmente o pitch de uma linha vocal monofônica, mede confiança, agrupa mudanças persistentes e mostra notas iniciais para revisão. Todo o processamento ocorre na aba; o arquivo não é enviado a servidores.

O reconhecimento desta etapa aceita uma voz principal por vez e limita a análise a 90 segundos. Não separa acordes, vozes sobrepostas ou instrumentos, não remove ruído e não corrige notas. Harmonia, editor de melodia, transporte multipista, persistência e exportação ainda **não** estão disponíveis. Para gravar, abra o app por HTTPS (como o GitHub Pages) ou em `localhost` e conceda permissão ao microfone. A importação é limitada a 50 MB, até 10 minutos e aos formatos que o navegador conseguir decodificar.

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
