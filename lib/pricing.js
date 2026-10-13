// Price table and entitlements. The browser only sends which plan and which
// order bumps were chosen; the amount is always computed here, never trusted
// from the client.

export const PRODUCT = "Bolos Gelados Lucrativos";

// Plans. completo_oferta is the R$19,90 pop-up price for the complete package.
export const PLANS = {
  basico: { amount: 10.0, bonuses: [], label: "Básico" },
  completo: { amount: 37.0, from: 97.0, bonuses: ["planilha", "cardapio", "pack"], label: "Completo" },
  completo_oferta: { amount: 19.9, from: 37.0, bonuses: ["planilha", "cardapio", "pack"], label: "Completo (oferta)" },
};

// Order bumps, only offered on top of the basico plan.
export const BUMPS = {
  planilha: {
    amount: 6.4,
    title: "Planilha de Precificação Inteligente",
    desc: "Calcule o custo de cada bolo e defina o preço de venda com lucro.",
    image: "https://i.ytimg.com/vi/ZQSVQbu886A/maxresdefault.jpg",
  },
  cardapio: {
    amount: 7.8,
    title: "Cardápio de Datas Comemorativas",
    desc: "Ideias de bolos pra vender mais em cada data do ano.",
    image: "https://i.ytimg.com/vi/3zTKLCdVDgM/maxresdefault.jpg",
  },
  pack: {
    amount: 8.9,
    title: "Pack de Embalagens e Rótulos",
    desc: "Rótulos e embalagens prontos pra imprimir com a sua marca.",
    image: "https://i.ytimg.com/vi/8Q66NCKqZdM/maxresdefault.jpg",
  },
};

export const BONUS_IDS = Object.keys(BUMPS);

// Returns { amount, plan, bumps, bonuses } or null if the selection is invalid.
export function priceSelection(planId, bumpIds) {
  const plan = PLANS[planId];
  if (!plan) return null;
  const bumps = plan.bonuses.length ? [] : [...new Set(bumpIds || [])].filter((b) => BUMPS[b]);
  let amount = plan.amount;
  for (const b of bumps) amount += BUMPS[b].amount;
  const bonuses = [...new Set([...plan.bonuses, ...bumps])];
  return { amount: Math.round(amount * 100) / 100, plan: planId, bumps, bonuses };
}

// What a paid order grants. Legacy orders (no plan recorded, e.g. the old R$197
// single offer) get everything.
export function entitlementsFor(order) {
  const base = { recipes: true, planilha: false, cardapio: false, pack: false };
  if (!order || !order.plan) return { ...base, planilha: true, cardapio: true, pack: true };
  for (const b of order.bonuses || []) if (b in base) base[b] = true;
  return base;
}
