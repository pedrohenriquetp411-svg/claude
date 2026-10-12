// Sends a password reset link. Always answers ok so it does not reveal which
// e-mails are members.

import { json, normEmail } from "../../../lib/auth.js";
import { resetEmail, sendEmail } from "../../../lib/email.js";

const TOKEN_TTL = 3600;
const THROTTLE_TTL = 120;

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const email = normEmail(body.email);
  const member = email && (await env.MEMBERS.get(`member:${email}`, "json"));

  if (member && member.active !== false && !(await env.MEMBERS.get(`reset-throttle:${email}`))) {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const token = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await env.MEMBERS.put(`reset:${token}`, email, { expirationTtl: TOKEN_TTL });
    await env.MEMBERS.put(`reset-throttle:${email}`, "1", { expirationTtl: THROTTLE_TTL });
    await sendEmail(env, { to: email, ...resetEmail({ name: member.name, token }) });
  }
  return json({ ok: true });
}
