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
  planilha: { amount: 9.9, title: "Planilha de Precificação Inteligente" },
  cardapio: { amount: 9.9, title: "Cardápio de Datas Comemorativas" },
  pack: { amount: 9.9, title: "Pack de Embalagens e Rótulos" },
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
