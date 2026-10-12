// Post-purchase password creation for the buyer, who is already signed in via the
// session cookie set when the payment confirmed. Used by the checkout "paid" screen.

import { currentMember, hashPassword, json, sessionCookie } from "../../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  const member = await currentMember(request, env);
  if (!member) return json({ error: "Sessão expirada. Use o link enviado no seu e-mail." }, 401);

  const password = String((await request.json().catch(() => ({}))).password || "");
  if (password.length < 6 || password.length > 128) return json({ error: "A senha precisa ter pelo menos 6 caracteres." }, 400);

  member.passwordHash = await hashPassword(password);
  delete member.needsPassword;
  await env.MEMBERS.put(`member:${member.email}`, JSON.stringify(member));
  return json({ ok: true }, 200, { "Set-Cookie": await sessionCookie(env, member.email) });
}
