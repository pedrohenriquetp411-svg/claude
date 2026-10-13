// Price table and entitlements. The browser only sends which plan and which
// order bumps were chosen; the amount is always computed here, never trusted
// from the client.

export const PRODUCT = "Bolos Gelados Lucrativos";

// Plans differ by how many recipes they unlock. completo_oferta is the R$19,90
// pop-up price for the full access.
export const PLANS = {
  basico: { amount: 10.0, recipes: "basic", label: "Básico" },
  completo: { amount: 37.0, from: 97.0, recipes: "full", label: "Completo" },
  completo_oferta: { amount: 19.9, from: 37.0, recipes: "full", label: "Completo (oferta)" },
};

// Order bumps: standalone products, selectable on every checkout, added on top
// of any plan.
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

// Combo: all three order bumps together with 40% off. Selectable on every
// checkout, mutually exclusive with the individual bumps.
const round2 = (v) => Math.round(v * 100) / 100;
const COMBO_FULL = round2(BONUS_IDS.reduce((sum, b) => sum + BUMPS[b].amount, 0)); // 23.10
export const COMBO = {
  id: "combo",
  bumps: BONUS_IDS.slice(),
  off: 0.4,
  full: COMBO_FULL,
  amount: round2(COMBO_FULL * 0.6), // 13.86
  title: "Leve tudo acima com 40% OFF",
  desc: "Os 3 materiais extras juntos, com 40% de desconto.",
};

// Returns { amount, plan, recipes, bumps, combo } or null if the selection is
// invalid. When combo is chosen it grants all three bumps and the individual
// bump selection is ignored.
export function priceSelection(planId, bumpIds, combo) {
  const plan = PLANS[planId];
  if (!plan) return null;
  const useCombo = Boolean(combo);
  const bumps = useCombo ? COMBO.bumps.slice() : [...new Set(bumpIds || [])].filter((b) => BUMPS[b]);
  let amount = plan.amount;
  if (useCombo) amount += COMBO.amount;
  else for (const b of bumps) amount += BUMPS[b].amount;
  return { amount: round2(amount), plan: planId, recipes: plan.recipes, bumps, combo: useCombo };
}

// What a paid order grants. Legacy orders (no plan recorded) get everything.
export function entitlementsFor(order) {
  const base = { recipes: "basic", planilha: false, cardapio: false, pack: false };
  if (!order || !order.plan) return { recipes: "full", planilha: true, cardapio: true, pack: true };
  base.recipes = order.recipes === "full" ? "full" : "basic";
  for (const b of order.bonuses || order.bumps || []) if (b in base) base[b] = true;
  return base;
}

// Merge so a second purchase only ever adds access.
export function mergeEntitlements(a, b) {
  const out = { ...(a || {}) };
  out.recipes = a && a.recipes === "full" ? "full" : b.recipes === "full" ? "full" : "basic";
  for (const k of BONUS_IDS) out[k] = Boolean((a && a[k]) || b[k]);
  return out;
}
