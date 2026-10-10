// LofyPay calls plus turning a paid Pix order into a member account.

export const LOFYPAY_API = "https://app.lofypay.com/api/v1";

export async function lofypayStatus(env, id) {
  const res = await fetch(`${LOFYPAY_API}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.LOFYPAY_SECRET_KEY}` },
    body: JSON.stringify({ idtransaction: id }),
  });
  const data = await res.json().catch(() => ({}));
  return data.status || "UNKNOWN";
}

// Idempotent: safe to call from both the status poll and the webhook.
// Returns the member email once the order is paid, otherwise null.
export async function activateOrder(env, id) {
  const order = await env.MEMBERS.get(`order:${id}`, "json");
  if (!order) return null;
  if (order.paid) return order.email;
  if ((await lofypayStatus(env, id)) !== "PAID_OUT") return null;

  const key = `member:${order.email}`;
  const existing = await env.MEMBERS.get(key, "json");
  const member = existing || {
    email: order.email,
    name: order.name,
    phone: order.phone,
    passwordHash: order.passwordHash,
    since: new Date().toISOString(),
    progress: {},
  };
  member.active = true;
  member.orders = [...new Set([...(member.orders || []), id])];
  await env.MEMBERS.put(key, JSON.stringify(member));
  await env.MEMBERS.put(`order:${id}`, JSON.stringify({ ...order, paid: true, paidAt: new Date().toISOString() }));
  return order.email;
}
