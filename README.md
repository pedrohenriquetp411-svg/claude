# Especialista em Bolos Gelados — site estático

Cópia estática da página `mayaracamposconfeitaria.com.br/especialista-em-bolos-gelados/`,
pronta para o Cloudflare Pages. Todo o CSS, JS e imagens ficam em `public/`; não há build.

## Deploy

Publicado em **https://especialista-bolos-gelados.pages.dev** (projeto Cloudflare Pages
`especialista-bolos-gelados`, ligado a este repositório pelo GitHub).

Cada push no branch `claude/cloudflare-pages-static-j0ehik` publica o site automaticamente.
Configuração do projeto: sem comando de build, diretório de saída `public`.

## Observações
- Links de compra (Hotmart) e pixels (Google Tag Manager, Facebook, TikTok) continuam apontando
  para os serviços originais.
- Chamadas ao `admin-ajax.php` do WordPress (plugin PixelYourSite) não funcionam fora do domínio
  original; isso não afeta a exibição da página.
- `/especialista-em-bolos-gelados/` redireciona para `/` (ver `public/_redirects`).
