# Vocal Architect — regras operacionais

## Ordem de leitura

1. Instruções diretas mais recentes do proprietário.
2. Limitações de segurança e do ambiente.
3. `docs/REQUIREMENTS_SCOPE.md`.
4. Este arquivo, decisões e checkpoint.
5. Código e testes existentes.

Antes de iniciar um lote, leia a documentação, inspecione o repositório e confirme o último lote no checkpoint. Os documentos mestres completos foram recebidos fora do repositório e não devem ser publicados sem autorização explícita do proprietário. Nunca reinicie ou substitua recursos funcionais sem justificativa registrada.

## Regras inegociáveis

- Não exibir controles ativos para recursos inexistentes.
- Não simular captação, transcrição, harmonização, reprodução ou exportação.
- Preservar melodia e notas bloqueadas quando esses recursos existirem.
- Manter o processamento principal local; não adicionar backend obrigatório, contas, segredos ou APIs pagas.
- Manter compatibilidade com GitHub Pages e navegação por hash até existir alternativa estática validada.
- Separar interface, aplicação, domínio musical, áudio, persistência e interoperabilidade.
- Usar o modelo musical canônico; dados em pixels não são dados musicais.
- Não avançar automaticamente ao próximo lote.

## Qualidade e continuidade

Antes de concluir um lote, execute `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` e `pnpm run build`. Registre resultados reais, limitações e testes pendentes em `docs/CHECKPOINT.md`; atualize `docs/CHANGELOG.md`, `docs/ROADMAP.md` e a documentação afetada.
