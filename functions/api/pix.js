// Creates a Pix charge on LofyPay and stores the pending order (with the buyer's
// hashed password) so the member account can be created once it is paid.
// The price lives here, never in the browser.

import { hashPassword, isTestToken, json, normEmail } from "../../lib/auth.js";
import { LOFYPAY_API } from "../../lib/lofypay.js";

const PRODUCT = { name: "Especialista em Bolos Gelados", amount: 197.0 };
const TEST_AMOUNT = 10.0;

// "test": private R$ 10 link (?teste=<token>). "live": public sales, only once SALES_OPEN=true.
async function saleMode(env, token) {
  if (!env.LOFYPAY_SECRET_KEY) return null;
  if (await isTestToken(env, token)) return { test: true, amount: TEST_AMOUNT };
  if (env.SALES_OPEN === "true") return { test: false, amount: PRODUCT.amount };
  return null;
}
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

// Lets the checkout know whether it can take payments, and at what price.
export async function onRequestGet({ request, env }) {
  const mode = await saleMode(env, new URL(request.url).searchParams.get("teste"));
  return json({ ready: Boolean(mode), amount: mode?.amount ?? PRODUCT.amount, test: Boolean(mode?.test) });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Requisição inválida." }, 400);
  }

  const mode = await saleMode(env, body.teste);
  if (!mode) return json({ error: "Pagamento indisponível no momento." }, 503);

  const name = String(body.name || "").trim().slice(0, 120);
  const email = normEmail(body.email).slice(0, 160);
  const document = digits(body.document);
  const phone = digits(body.phone).slice(0, 13);
  const password = String(body.password || "");

  if (name.split(/\s+/).length < 2) return json({ error: "Informe seu nome completo." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido." }, 400);
  if (!validCpf(document)) return json({ error: "CPF inválido." }, 400);
  if (password.length < 6 || password.length > 128) return json({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400);

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
      amount: mode.amount,
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

  const order = { id: String(data.idTransaction), reference, name, email, phone, passwordHash: await hashPassword(password), amount: mode.amount, test: mode.test, createdAt: new Date().toISOString() };
  // Kept for 30 days so a late webhook can still activate the member.
  await env.MEMBERS.put(`order:${order.id}`, JSON.stringify(order), { expirationTtl: 30 * 86400 });

  return json({
    id: order.id,
    reference,
    amount: mode.amount,
    product: PRODUCT.name,
    code: data.paymentCode,
    qrBase64: data.paymentCodeBase64 || null,
    expiresIn: EXPIRATION,
  });
}
