# Especialista em Bolos Gelados — site estático

Cópia estática da página `mayaracamposconfeitaria.com.br/especialista-em-bolos-gelados/`,
pronta para o Cloudflare Pages. Todo o CSS, JS e imagens ficam em `public/`; não há build.

## Deploy

Publicado em **https://especialista-bolos-gelados.pages.dev** (projeto Cloudflare Pages
`especialista-bolos-gelados`, ligado a este repositório pelo GitHub).

Cada push no branch `claude/cloudflare-pages-static-j0ehik` publica o site automaticamente.
Configuração do projeto: sem comando de build, diretório de saída `public`.

## Checkout Pix (LofyPay) e teste A/B

- `public/ab-checkout.js` sorteia cada visitante (50/50) entre a Hotmart (variante `a`) e o checkout Pix
  próprio em `/checkout/` (variante `b`). Para forçar uma variante: `?checkout=a` ou `?checkout=b`.
- `functions/api/pix.js` gera a cobrança Pix na LofyPay (o preço fica no servidor),
  `functions/api/status.js` consulta o pagamento e `functions/api/webhook.js` recebe o aviso de pagamento.
- Configure o segredo `LOFYPAY_SECRET_KEY` no projeto do Cloudflare Pages
  (Settings → Variables and Secrets → tipo *Secret*). Use `sk_test_...` para testar e `sk_live_...` em produção.

## Observações
- Links de compra (Hotmart) e pixels (Google Tag Manager, Facebook, TikTok) continuam apontando
  para os serviços originais.
- Chamadas ao `admin-ajax.php` do WordPress (plugin PixelYourSite) não funcionam fora do domínio
  original; isso não afeta a exibição da página.
- `/especialista-em-bolos-gelados/` redireciona para `/` (ver `public/_redirects`).
