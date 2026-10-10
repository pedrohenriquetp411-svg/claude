import { json, normEmail, sessionCookie, verifyPassword } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const email = normEmail(body.email);
  const member = email && (await env.MEMBERS.get(`member:${email}`, "json"));
  const ok = member && member.active !== false && (await verifyPassword(String(body.password || ""), member.passwordHash));
  if (!ok) return json({ error: "E-mail ou senha incorretos." }, 401);
  return json({ ok: true }, 200, { "Set-Cookie": await sessionCookie(env, email) });
}
