# Sistema visual

O Lote 01 estabelece tokens para fundo `#090E19`, superfícies, texto, destaque índigo, destaque turquesa, estados e cores SATB. Espaçamentos, raios e elevação ficam centralizados em `src/styles/foundation.css`.

As páginas inicial, arquitetura e roadmap respondem a larguras móveis. O Lote 02 adiciona dashboard, criação real de sessão em memória e layout de estúdio com painéis reordenados abaixo de 980 px e empilhados abaixo de 680 px. Interações essenciais são links ou ações reais; não há controles enganosos de gravação ou harmonização.

O estúdio usa estados explícitos de vazio e, no Lote 03, um gravador funcional no painel de Gravação. O nome da captura, os comandos de iniciar/pausar/retomar/encerrar/cancelar, duração, medidor de nível, clipping, erros e reprodução possuem rótulos acessíveis. O pedido de permissão só é provocado pelo botão de iniciar; estados incompatíveis não exibem controles falsos.

No Lote 04, o seletor de arquivo, os estados reais de validação/decodificação/análise, waveform calculada, métricas PCM e regiões de silêncio ficam concentrados nos painéis de áudio.

No Lote 05, o painel de transcrição só habilita a ação quando existe PCM decodificado. Durante o cálculo exibe estado local de processamento; depois mostra cada nota com grafia, intervalo, frequência e confiança. Notas abaixo do limiar de revisão recebem rótulo visual explícito. A interface informa que o detector é monofônico, não separa fontes e não oferece edição/correção antes do Lote 06.
