// Admin panel sign-in with ADMIN_KEY. Failed attempts are throttled per IP.

import { adminCookie, isAdminKey, json } from "../../../lib/auth.js";

const MAX_FAILS = 10;
const WINDOW = 900;

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const failKey = `admin-fail:${ip}`;
  const fails = Number((await env.MEMBERS.get(failKey)) || 0);
  if (fails >= MAX_FAILS) return json({ error: "Muitas tentativas. Tente de novo em 15 minutos." }, 429);

  const body = await request.json().catch(() => ({}));
  if (!isAdminKey(env, body.key)) {
    await env.MEMBERS.put(failKey, String(fails + 1), { expirationTtl: WINDOW });
    return json({ error: "Chave de administrador incorreta." }, 401);
  }
  return json({ ok: true }, 200, { "Set-Cookie": await adminCookie(env) });
}
