// Admin-only: list members, or add/disable one manually (e.g. buyers from before
// the Pix checkout). Send "Authorization: Bearer <ADMIN_KEY>".

import { hashPassword, json, normEmail } from "../../../lib/auth.js";

function authorized(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return env.ADMIN_KEY && auth === `Bearer ${env.ADMIN_KEY}`;
}

export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);
  const members = [];
  let cursor;
  do {
    const page = await env.MEMBERS.list({ prefix: "member:", cursor });
    for (const k of page.keys) {
      const m = await env.MEMBERS.get(k.name, "json");
      if (m) members.push({ email: m.email, name: m.name, since: m.since, active: m.active !== false, orders: m.orders || [] });
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return json({ count: members.length, members });
}

// Body: { email, name, password }  → creates or reactivates a member.
// Body: { email, active: false }   → blocks access (e.g. after a refund).
export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);
  const body = await request.json().catch(() => ({}));
  const email = normEmail(body.email);
  if (!email) return json({ error: "email obrigatório" }, 400);

  const key = `member:${email}`;
  const member = (await env.MEMBERS.get(key, "json")) || { email, since: new Date().toISOString(), progress: {} };
  if (body.name) member.name = String(body.name);
  if (body.password) member.passwordHash = await hashPassword(String(body.password));
  if (!member.passwordHash) return json({ error: "password obrigatório para novo membro" }, 400);
  member.active = body.active !== false;
  await env.MEMBERS.put(key, JSON.stringify(member));
  return json({ ok: true, email, active: member.active });
}
