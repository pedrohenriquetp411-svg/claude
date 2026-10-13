// Creates a Pix charge on LofyPay and stores the pending order (with the buyer's
// hashed password) so the member account can be created once it is paid.
// The amount is computed from the price table, never trusted from the browser.

import { json, normEmail } from "../../lib/auth.js";
import { LOFYPAY_API } from "../../lib/lofypay.js";
import { BUMPS, PLANS, PRODUCT, priceSelection } from "../../lib/pricing.js";

const salesOpen = (env) => Boolean(env.LOFYPAY_SECRET_KEY) && env.SALES_OPEN !== "false";
const EXPIRATION = 1800;

const digits = (v) => String(v || "").replace(/\D/g, "");

function validCpf(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(cpf[len])) return false;
  }
  return true;
}

// Tells the checkout whether it can sell and the full price table so it can show
// the plan, order bumps and live total without ever setting the amount itself.
export async function onRequestGet({ env }) {
  return json({
    ready: salesOpen(env),
    product: PRODUCT,
    plans: Object.fromEntries(Object.entries(PLANS).map(([id, p]) => [id, { amount: p.amount, from: p.from || null, bonuses: p.bonuses }])),
    bumps: Object.fromEntries(Object.entries(BUMPS).map(([id, b]) => [id, { amount: b.amount, title: b.title, desc: b.desc, image: b.image }])),
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Requisição inválida." }, 400);
  }

  if (!salesOpen(env)) return json({ error: "Pagamento indisponível no momento." }, 503);

  const sel = priceSelection(body.plan, body.bumps);
  if (!sel) return json({ error: "Selecione um plano válido." }, 400);

  const name = String(body.name || "").trim().slice(0, 120);
  const email = normEmail(body.email).slice(0, 160);
  const document = digits(body.document); // optional; only validated when provided
  const phone = digits(body.phone).slice(0, 13);

  if (name.split(/\s+/).length < 2) return json({ error: "Informe seu nome completo." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido." }, 400);
  if (document && !validCpf(document)) return json({ error: "CPF inválido." }, 400);

  const reference = `EBG-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const origin = new URL(request.url).origin;

  const res = await fetch(`${LOFYPAY_API}/gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.LOFYPAY_SECRET_KEY}`,
      "Idempotency-Key": reference,
    },
    body: JSON.stringify({
      amount: sel.amount,
      method: "pix",
      external_reference: reference,
      notification_url: `${origin}/api/webhook`,
      expiration: EXPIRATION,
      client: { name, email, document, phone },
    }),
  });

  const data = await res.json().catch(() => ({}));
  const ok = ["success", "OK"].includes(data.status) && data.idTransaction && data.paymentCode;
  if (!ok) {
    console.error("lofypay gateway error", res.status, JSON.stringify(data));
    return json({ error: "Não foi possível gerar o Pix. Tente novamente." }, 502);
  }

  const order = {
    id: String(data.idTransaction), reference, name, email, phone,
    plan: sel.plan, bumps: sel.bumps, bonuses: sel.bonuses, amount: sel.amount,
    createdAt: new Date().toISOString(),
  };
  // Kept for 30 days so a late webhook can still activate the member.
  await env.MEMBERS.put(`order:${order.id}`, JSON.stringify(order), { expirationTtl: 30 * 86400 });

  return json({
    id: order.id,
    reference,
    amount: sel.amount,
    product: PRODUCT,
    code: data.paymentCode,
    qrBase64: data.paymentCodeBase64 || null,
    expiresIn: EXPIRATION,
  });
}
