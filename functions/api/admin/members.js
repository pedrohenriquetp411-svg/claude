// Admin: list members, or add / block / unblock / reset the password of one.

import { hashPassword, isAdmin, json, normEmail } from "../../../lib/auth.js";
import { allLessonIds } from "../../../lib/content.js";

async function listByPrefix(env, prefix) {
  const keys = [];
  let cursor;
  do {
    const page = await env.MEMBERS.list({ prefix, cursor });
    keys.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return keys;
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  const total = allLessonIds().length;
  const members = [];
  for (const key of await listByPrefix(env, "member:")) {
    const m = await env.MEMBERS.get(key, "json");
    if (!m) continue;
    members.push({
      email: m.email,
      name: m.name || "",
      phone: m.phone || "",
      since: m.since,
      active: m.active !== false,
      orders: m.orders || [],
      progress: { done: Object.keys(m.progress || {}).length, total },
    });
  }
  members.sort((a, b) => String(b.since).localeCompare(String(a.since)));
  return json({ count: members.length, members });
}

// Body: { email, name, password }  → creates a member, or resets the password of an existing one.
// Body: { email, active: false }   → blocks access (e.g. after a refund). active: true unblocks.
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  const body = await request.json().catch(() => ({}));
  const email = normEmail(body.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido." }, 400);

  const key = `member:${email}`;
  const existing = await env.MEMBERS.get(key, "json");
  const member = existing || { email, since: new Date().toISOString(), progress: {}, orders: [] };
  if (body.name) member.name = String(body.name).trim().slice(0, 120);
  if (body.password) {
    if (String(body.password).length < 6) return json({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400);
    member.passwordHash = await hashPassword(String(body.password));
  }
  if (!member.passwordHash) return json({ error: "Informe uma senha para o novo membro." }, 400);
  if (typeof body.active === "boolean") member.active = body.active;
  else if (!existing) member.active = true;

  await env.MEMBERS.put(key, JSON.stringify(member));
  return json({ ok: true, email, active: member.active !== false, created: !existing });
}
