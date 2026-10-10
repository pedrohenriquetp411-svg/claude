// Creates a Pix charge on LofyPay. The price lives here, never in the browser.
// Requires the LOFYPAY_SECRET_KEY secret on the Pages project (sk_live_... or sk_test_...).

const PRODUCT = { name: "Especialista em Bolos Gelados", amount: 197.0 };
const LOFYPAY_API = "https://app.lofypay.com/api/v1";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const digits = (v) => String(v || "").replace(/\D/g, "");

function validCpf(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(cpf[len])) return false;
  }
  return true;
}

// Lets the A/B script know whether the Pix checkout can take payments.
export async function onRequestGet({ env }) {
  return json({ ready: Boolean(env.LOFYPAY_SECRET_KEY) });
}

export async function onRequestPost({ request, env }) {
  if (!env.LOFYPAY_SECRET_KEY) return json({ error: "Pagamento indisponível no momento." }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Requisição inválida." }, 400);
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 160);
  const document = digits(body.document);
  const phone = digits(body.phone).slice(0, 13);

  if (name.split(/\s+/).length < 2) return json({ error: "Informe seu nome completo." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido." }, 400);
  if (!validCpf(document)) return json({ error: "CPF inválido." }, 400);

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
      amount: PRODUCT.amount,
      method: "pix",
      external_reference: reference,
      notification_url: `${origin}/api/webhook`,
      expiration: 1800,
      client: { name, email, document, phone },
    }),
  });

  const data = await res.json().catch(() => ({}));
  const ok = ["success", "OK"].includes(data.status) && data.idTransaction && data.paymentCode;
  if (!ok) {
    console.error("lofypay gateway error", res.status, JSON.stringify(data));
    return json({ error: "Não foi possível gerar o Pix. Tente novamente." }, 502);
  }

  return json({
    id: data.idTransaction,
    reference,
    amount: PRODUCT.amount,
    product: PRODUCT.name,
    code: data.paymentCode,
    qrBase64: data.paymentCodeBase64 || null,
    expiresIn: 1800,
  });
}
