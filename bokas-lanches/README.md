# Bokas Lanches · Landing page

Landing page da lanchonete **Bokas Lanches** (Av. Sen. Josino de Brito, 380 · Jardim das Oliveiras,
Três Pontas – MG). É um único arquivo, `index.html`, sem build e sem dependências: abre direto no
navegador e pode ser publicado em qualquer hospedagem estática (Hostinger, Cloudflare Pages, Netlify,
GitHub Pages…). Basta enviar o arquivo como `index.html` na raiz do site.

## O que tem na página

- **Hero** com chamada, botão de pedido no WhatsApp e "Como chegar".
- **Do seu jeito**: comer no local, drive-thru e entrega sem contato.
- **Cardápio**: sanduíches, omeletes e bebidas, com botão para pedir o cardápio completo no WhatsApp.
- **Avaliações**: nota 4,0 (13 avaliações) e trechos reais de avaliações do Google.
- **Como pedir** em 3 passos.
- **Onde estamos**: endereço, horário, telefone, botão de rota e mapa do Google incorporado.
- Barra fixa com WhatsApp/Ligar no celular, SEO (title, description, Open Graph) e dados
  estruturados `FastFoodRestaurant` (schema.org) para o Google.

Todos os botões de pedido abrem `wa.me/5535999454423` com uma mensagem pronta; "Ligar" usa `tel:+5535999454423`.

## Para completar antes de publicar

As informações vieram da ficha do Google Maps. O que não estava lá ficou de fora da página, para
não publicar nada inventado:

1. **Cardápio e preços**: a seção mostra só as categorias (sanduíches, omeletes, bebidas). Para
   listar itens com preço, copie um bloco `<article class="dish">` e troque os textos.
2. **Horário completo**: só se sabe que fecha às 00h. Quando tiver os dias e o horário de abertura,
   atualize em "Onde estamos" e no rodapé.
3. **WhatsApp**: confirme que o (35) 99945-4423 recebe mensagens no WhatsApp.
4. **Fotos**: as ilustrações são desenhos em SVG. Fotos reais dos lanches deixam a página ainda
   mais forte.
5. **Domínio**: quando houver domínio, adicione `<link rel="canonical">` e uma imagem `og:image`
   com URL absoluta no `<head>`.
