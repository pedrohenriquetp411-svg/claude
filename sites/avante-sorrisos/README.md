# Site da Clínica Odontológica Avante Sorrisos e Saúde

Site de uma página, feito em HTML, CSS e JavaScript puros (sem build).

- `demo/index.html`: demonstração em um único arquivo, com faixa de aviso e `noindex`. Para mostrar ao cliente.
- `site/`: versão final. Publique esta pasta como raiz do site (qualquer hospedagem estática: Cloudflare Pages, Netlify, Vercel ou Hostinger).
- `tools/build-demo.mjs`: regenera a demonstração a partir de `site/`. Rode `node sites/avante-sorrisos/tools/build-demo.mjs` depois de editar o site.

## Onde editar

- Textos, serviços e horários: `site/index.html`.
- Cores e espaçamentos: variáveis no topo de `site/css/styles.css`.
- Número do WhatsApp e mensagem padrão: constantes no topo de `site/js/main.js`.

## Confirmar com a clínica antes de publicar

- **WhatsApp**: o site usa `(35) 3212-4798`, que aparece no Google, mas esse número parece fixo. O WhatsApp só funciona com celular. Confirme o número certo em `site/js/main.js`.
- **Horários**: o Google mostra apenas "Fecha 19:00". O site usa segunda a sexta, 08h às 19h, e sábado "consulte pelo WhatsApp". Confirme.
- **Serviços**: a lista e as descrições são sugestões. Ajuste ao que a clínica realmente faz.
- **Responsável técnico**: o rodapé tem `[nome do dentista]` e `CRO-MG [número]`. Preencha antes de publicar. A publicidade odontológica exige a identificação do responsável técnico, e o CRO-MG orienta sobre o restante das regras de divulgação.
- **Depoimentos**: os três textos vieram das avaliações públicas do Google e aparecem anonimizados. Peça autorização à clínica ou troque por depoimentos fornecidos por ela.
- **Fotos**: o site usa ilustrações. Troque por fotos reais da clínica e da equipe, com autorização.
- **Domínio**: adicione `<link rel="canonical">`, `og:url` e um `sitemap.xml` com o endereço definitivo.
- **Mapa**: o iframe usa o endereço do Google Maps. Confira se ele carrega na hospedagem final.

## Dados e privacidade

O formulário não guarda dados em servidor. Ele monta uma mensagem e abre o WhatsApp da clínica, então o paciente decide o envio. Se a clínica usar Google Analytics ou pixel de anúncios, inclua um aviso de cookies conforme a LGPD.
