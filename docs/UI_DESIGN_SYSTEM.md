# Sistema visual

O Lote 01 estabelece tokens para fundo `#090E19`, superfícies, texto, destaque índigo, destaque turquesa, estados e cores SATB. Espaçamentos, raios e elevação ficam centralizados em `src/styles/foundation.css`.

As páginas inicial, arquitetura e roadmap respondem a larguras móveis. O Lote 02 adiciona dashboard, criação real de sessão em memória e layout de estúdio com painéis reordenados abaixo de 980 px e empilhados abaixo de 680 px. Interações essenciais são links ou ações reais; não há controles enganosos de gravação ou harmonização.

O estúdio usa estados explícitos de vazio e verifica, sem solicitar microfone, se o navegador declara contexto seguro e API de captura. Isso comunica capacidade futura sem simular áudio.
