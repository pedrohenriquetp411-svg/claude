# Especialista em Bolos Gelados — site estático

Cópia estática da página `mayaracamposconfeitaria.com.br/especialista-em-bolos-gelados/`,
pronta para o Cloudflare Pages. Todo o CSS, JS e imagens ficam em `public/`; não há build.

## Deploy

### Opção 1 — GitHub Actions (automático a cada push na `main`)
1. No Cloudflare: **My Profile → API Tokens → Create Token**, template *Edit Cloudflare Workers*
   (ou permissão `Account → Cloudflare Pages → Edit`).
2. No GitHub: **Settings → Secrets and variables → Actions**, crie:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID` (aparece na barra lateral do painel Cloudflare)
3. Rode o workflow *Deploy to Cloudflare Pages* (ou faça push na `main`).
   O projeto `especialista-bolos-gelados` é criado automaticamente no primeiro deploy.

### Opção 2 — Painel do Cloudflare (Git integration)
**Workers & Pages → Create → Pages → Connect to Git**, escolha este repositório,
framework *None*, build command vazio, output directory `public`.

### Opção 3 — Linha de comando
```sh
npx wrangler login
npx wrangler pages deploy public --project-name=especialista-bolos-gelados
```

## Observações
- Links de compra (Hotmart) e pixels (Google Tag Manager, Facebook, TikTok) continuam apontando
  para os serviços originais.
- Chamadas ao `admin-ajax.php` do WordPress (plugin PixelYourSite) não funcionam fora do domínio
  original; isso não afeta a exibição da página.
- `/especialista-em-bolos-gelados/` redireciona para `/` (ver `public/_redirects`).
