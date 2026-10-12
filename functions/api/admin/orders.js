// Admin: Pix orders (paid ones are kept; unpaid ones expire after 30 days) and a sales summary.

import { isAdmin, json } from "../../../lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);

  const orders = [];
  let cursor;
  do {
    const page = await env.MEMBERS.list({ prefix: "order:", cursor });
    for (const k of page.keys) {
      const o = await env.MEMBERS.get(k.name, "json");
      if (!o) continue;
      orders.push({
        id: o.id,
        reference: o.reference,
        name: o.name,
        email: o.email,
        phone: o.phone || "",
        amount: Number(o.amount || 0),
        test: Boolean(o.test),
        paid: Boolean(o.paid),
        createdAt: o.createdAt,
        paidAt: o.paidAt || null,
      });
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  orders.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const real = orders.filter((o) => !o.test);
  const paid = real.filter((o) => o.paid);
  const today = new Date().toISOString().slice(0, 10);
  const summary = {
    paidCount: paid.length,
    revenue: paid.reduce((sum, o) => sum + o.amount, 0),
    pendingCount: real.filter((o) => !o.paid).length,
    paidToday: paid.filter((o) => String(o.paidAt).startsWith(today)).length,
    conversion: real.length ? paid.length / real.length : 0,
  };
  return json({ summary, orders });
}
