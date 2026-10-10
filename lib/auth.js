// Password hashing (PBKDF2) and signed session cookies for the members area.

const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

const COOKIE = "ebg_session";
const SESSION_DAYS = 30;
const ITERATIONS = 100000;

export const normEmail = (e) => String(e || "").trim().toLowerCase();

export async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(bits)}`;
}

export async function verifyPassword(password, stored) {
  const [, , salt] = String(stored || "").split("$");
  if (!salt) return false;
  return timingSafeEqual(await hashPassword(password, unb64(salt)), stored);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function sessionCookie(env, email) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const payload = b64(enc.encode(JSON.stringify({ email, exp })));
  const token = `${payload}.${await hmac(env.SESSION_SECRET, payload)}`;
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export async function currentMember(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token || !env.SESSION_SECRET) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !timingSafeEqual(sig, await hmac(env.SESSION_SECRET, payload))) return null;
  let data;
  try {
    data = JSON.parse(new TextDecoder().decode(unb64(payload)));
  } catch {
    return null;
  }
  if (!data.email || data.exp < Date.now()) return null;
  const member = await env.MEMBERS.get(`member:${data.email}`, "json");
  return member && member.active !== false ? member : null;
}

export const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
