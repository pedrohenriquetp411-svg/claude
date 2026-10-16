# Buteco da Esquina — landing page

Página estática (um único `index.html`, sem build) para o [@butecodaesquinatp](https://www.instagram.com/butecodaesquinatp/).
Fica fora de `public/`, então **não** é publicada no site dos bolos gelados.

Dados usados (confira com o bar): Av. Senador Josino de Brito, 380 — Jardim das Oliveiras, Três Pontas/MG;
quarta a sábado, 17h às 23h; WhatsApp/delivery (35) 98815-6759.

Para mudar telefone ou horário, edite o `<script>` no fim do `index.html` (`PHONE`, `OPEN_DAYS`, `OPEN_H`, `CLOSE_H`)
e os textos correspondentes na página.

## No ar

Publicado em **https://buteco-da-esquina.pedrohenriquetp411.workers.dev** como o Worker `buteco-da-esquina` no
Cloudflare. O Worker traz a página e as imagens embutidas no próprio código. Por isso, depois de editar arquivos
aqui é preciso publicar de novo, porque o deploy não é automático pelo GitHub. Para usar um domínio próprio,
adicione uma rota ou um custom domain a esse Worker no painel da Cloudflare.

## Fotos

As fotos em `img/` são ilustrativas, tiradas do Wikimedia Commons com licença CC BY-SA, e os créditos estão no
rodapé da página. Quando tiver fotos do próprio bar (do Instagram, por exemplo), substitua os arquivos mantendo os
mesmos nomes e remova a linha de créditos (`<p class="credits">`) do rodapé.

| Arquivo | Autor | Licença |
| --- | --- | --- |
| `copo-americano.webp` | [Meanders2001](https://commons.wikimedia.org/wiki/File:A_typical_night_of_Football_ritual_and_beer_in_the_American_glass_cup.jpg) | CC BY-SA 4.0 |
| `bolinho-bacalhau.webp` | [Eduardo P](https://commons.wikimedia.org/wiki/File:Bolinhos_de_bacalhau.jpg) | CC BY-SA 3.0 |
| `batata-frita.webp` | [Adam S. Keck](https://commons.wikimedia.org/wiki/File:Pub_fries_with_ketchup_2021_001.jpg) | CC BY-SA 4.0 |
| `pastel.webp` | [BuenosAiresPhotographer](https://commons.wikimedia.org/wiki/File:Brazilian_pastel.jpg) | CC BY-SA 2.0 |

Ícones e logo são SVG embutidos no `index.html` (nenhum emoji).
