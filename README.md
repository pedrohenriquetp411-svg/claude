# Especialista em Bolos Gelados — site estático

Cópia estática da página `mayaracamposconfeitaria.com.br/especialista-em-bolos-gelados/`,
pronta para o Cloudflare Pages. Todo o CSS, JS e imagens ficam em `public/`; não há build.

## Deploy

Publicado em **https://especialista-bolos-gelados.pages.dev** (projeto Cloudflare Pages
`especialista-bolos-gelados`, ligado a este repositório pelo GitHub).

Cada push no branch `claude/cloudflare-pages-static-j0ehik` publica o site automaticamente.
Configuração do projeto: sem comando de build, diretório de saída `public`.

## Checkout Pix (LofyPay) e área de membros

- Todos os botões de compra levam a `/checkout/`. O comprador cria a senha no checkout; quando o Pix é
  pago (`functions/api/status.js` ou o webhook `functions/api/webhook.js`), a conta é criada no KV `MEMBERS`
  e ele entra direto em `/membros/`.
- Conteúdo do curso: `lib/content.js`. Cada módulo tem `unlockAfterDays` (dias após a compra para liberar);
  preencha `video` com o link de incorporação (YouTube/Vimeo/Panda) e `download` com materiais.
  Aulas bloqueadas nunca são enviadas ao navegador.
- Admin: `GET/POST /api/admin/members` com `Authorization: Bearer <ADMIN_KEY>` para listar, adicionar ou
  bloquear membros (ex.: reembolso).
- Variáveis do projeto Pages: `LOFYPAY_SECRET_KEY` (você configura), `SESSION_SECRET` e `ADMIN_KEY` (já
  configuradas), binding KV `MEMBERS`.

## Observações
- Pixels (Google Tag Manager, Facebook, TikTok) continuam ativos.
- Chamadas ao `admin-ajax.php` do WordPress (plugin PixelYourSite) não funcionam fora do domínio
  original; isso não afeta a exibição da página.
- `/especialista-em-bolos-gelados/` redireciona para `/` (ver `public/_redirects`).
