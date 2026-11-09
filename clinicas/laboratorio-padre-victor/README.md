# Laboratório Padre Victor: site

Site estático (HTML, CSS e JS, sem build) do Laboratório Padre Victor, em Três Pontas (MG).

- `index.html`: conteúdo, SEO (meta tags e JSON-LD `MedicalBusiness`) e acessibilidade.
- `styles.css`: layout mobile-first (360 px em diante), com ajustes para tablet (640 px) e desktop (960 px).
- `app.js`: animações de entrada e a cena 3D em Three.js (r128, via cdnjs). No celular, a cena usa
  menos geometria e partículas, limita a resolução, roda a cerca de 30 fps e pausa fora da tela.
  Se o WebGL não estiver disponível, uma esfera em CSS aparece no lugar.

## Ver localmente

```bash
cd clinicas/laboratorio-padre-victor && python3 -m http.server 8000
```

## A confirmar com o laboratório

- Horário completo de funcionamento (hoje só consta "a partir das 06:30", tirado do perfil no Google).
- Lista de exames e convênios aceitos, se quiserem exibir.
- Logo oficial e fotos reais da unidade. Hoje o site usa o monograma "LPV".
- Domínio final, para preencher `<link rel="canonical">` no `index.html`.
- Avaliações: os trechos e a nota 4,9 (66 avaliações) vêm do Google em novembro de 2026.
