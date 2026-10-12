// Sets a new password from a reset link and signs the member in.

import { hashPassword, json, sessionCookie } from "../../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (password.length < 6 || password.length > 128) return json({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400);

  const email = /^[\w-]{20,64}$/.test(token) && (await env.MEMBERS.get(`reset:${token}`));
  const member = email && (await env.MEMBERS.get(`member:${email}`, "json"));
  if (!member || member.active === false) return json({ error: "Link inválido ou expirado. Peça um novo." }, 400);

  member.passwordHash = await hashPassword(password);
  await env.MEMBERS.put(`member:${email}`, JSON.stringify(member));
  await env.MEMBERS.delete(`reset:${token}`);
  return json({ ok: true }, 200, { "Set-Cookie": await sessionCookie(env, email) });
}
