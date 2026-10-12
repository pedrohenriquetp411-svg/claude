# Bolos Gelados Lucrativos

Landing page, checkout Pix (LofyPay) e área de membros do curso de bolos gelados, publicados no
Cloudflare Pages a partir da pasta `public/` e das funções em `functions/`.

## Deploy

Publicado em **https://www.bolosgelados.site** (projeto Cloudflare Pages
`especialista-bolos-gelados`, ligado a este repositório pelo GitHub).

Cada push no branch `claude/cloudflare-pages-static-j0ehik` publica o site automaticamente.
Configuração do projeto: sem comando de build, diretório de saída `public`.

## Checkout Pix (LofyPay) e área de membros

- Os botões da landing page levam a `/checkout/`. O comprador cria a senha no checkout; quando o Pix é
  pago (`functions/api/status.js` ou o webhook `functions/api/webhook.js`), a conta é criada no KV `MEMBERS`
  e ele entra direto em `/membros/`.
- Vendas abertas por padrão. Para pausar, defina `SALES_OPEN=false` nas variáveis do projeto Pages.
- Link de teste de R$ 10: `/checkout/?teste=<token>` (token derivado da `ADMIN_KEY`).
- Conteúdo do curso: `lib/content.js` (aulas em vídeo do YouTube, liberação progressiva por `unlockAfterDays`).
  Aulas bloqueadas nunca são enviadas ao navegador.
- Admin: `GET/POST /api/admin/members` com `Authorization: Bearer <ADMIN_KEY>` para listar, adicionar ou
  bloquear membros (ex.: reembolso).
- Variáveis do projeto Pages: `LOFYPAY_SECRET_KEY`, `RESEND_API_KEY`, `SESSION_SECRET`, `ADMIN_KEY`;
  binding KV `MEMBERS`.

## Observações
- `/especialista-em-bolos-gelados/` redireciona para `/` (ver `public/_redirects`).
