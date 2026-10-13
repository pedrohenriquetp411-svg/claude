// LofyPay calls plus turning a paid Pix order into a member account.

import { sendEmail, welcomeEmail } from "./email.js";
import { entitlementsFor, mergeEntitlements } from "./pricing.js";

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
    since: new Date().toISOString(),
    progress: {},
  };
  member.active = true;
  member.orders = [...new Set([...(member.orders || []), id])];
  member.entitlements = mergeEntitlements(member.entitlements, entitlementsFor(order));
  // Password is created after the purchase. New accounts start without one.
  const needsPassword = !member.passwordHash;
  if (needsPassword) member.needsPassword = true;
  await env.MEMBERS.put(key, JSON.stringify(member));
  await env.MEMBERS.put(`order:${id}`, JSON.stringify({ ...order, paid: true, paidAt: new Date().toISOString() }));

  // Welcome e-mail: a one-hour link to create the password when the account has none.
  let setToken = null;
  if (needsPassword) {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    setToken = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await env.MEMBERS.put(`reset:${setToken}`, order.email, { expirationTtl: 24 * 3600 });
  }
  await sendEmail(env, { to: order.email, ...welcomeEmail({ name: member.name, email: order.email, setToken }) });
  return order.email;
}
