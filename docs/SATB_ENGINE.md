# Arranjo SATB e edição segura — Lote 11

O motor SATB trabalha somente depois de uma análise harmônica real e de uma melodia confirmada. Ele gera quatro `VocalPart` em memória e nunca modifica a cópia de origem da melodia.

## Restrições aplicadas

- A melodia é preservada em um naipe escolhido pelo músico: soprano, contralto, tenor ou baixo. Notas bloqueadas continuam bloqueadas na cópia da parte principal.
- As faixas iniciais são Soprano C4–A5, Contralto G3–D5, Tenor C3–A4 e Baixo E2–E4. Os limites absolutos podem ser ajustados antes de gerar.
- A busca escolhe cada disposição vertical de forma conjunta, mantém a ordem Baixo–Tenor–Contralto–Soprano, limita o espaçamento das vozes superiores e favorece movimentos menores, região confortável e baixo na fundamental em cadências.
- Quintas e oitavas paralelas entre mudanças harmônicas são rejeitadas. Cruzamentos e notas fora da tessitura também invalidam uma alternativa.
- São mostradas até três alternativas estruturalmente válidas, com uma pontuação comparativa e avisos de espaçamento ou cadência.
- Depois da geração, cada nota pode ser ajustada por altura, início ou duração. A edição é imutável, respeita a tessitura e rejeita sobreposições, cruzamentos e paralelismos perfeitos.
- Notas bloqueadas não podem ser modificadas nem removidas por uma regeneração parcial. O histórico local mantém até 40 passos de desfazer/refazer.
- A regeneração de frase recalcula uma alternativa SATB e substitui somente a frase escolhida; as demais frases e as notas bloqueadas da frase permanecem no rascunho.

## Limites

- A primeira versão usa as tríades escolhidas pelo motor harmônico; não adiciona notas de passagem, ritmos independentes, sétimas tratadas, estilos avançados ou exportação de uma edição manual.
- Se a melodia estiver fora do naipe escolhido ou se as restrições forem incompatíveis, o motor informa a impossibilidade em vez de transpor ou fabricar um resultado.
- A reprodução por piano sintetizado pode tocar o rascunho editado, com mixer e controles de ensaio locais quando Web Audio estiver disponível. As edições não são persistidas e se perdem ao trocar de alternativa ou recarregar a página.
