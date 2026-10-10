// Polled by the checkout page. When the Pix is paid it creates the member account
// and signs the buyer in, so they can go straight to the members area.

import { json, sessionCookie } from "../../lib/auth.js";
import { activateOrder, lofypayStatus } from "../../lib/lofypay.js";

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[\w-]{1,100}$/.test(id) || !env.LOFYPAY_SECRET_KEY) return json({ status: "UNKNOWN" }, 400);

  const email = await activateOrder(env, id);
  if (email) {
    // Auto sign-in only right after payment; later the member logs in with their password.
    const order = await env.MEMBERS.get(`order:${id}`, "json");
    const fresh = order?.paidAt && Date.now() - Date.parse(order.paidAt) < 2 * 3600e3;
    return json({ status: "PAID_OUT", paid: true }, 200, fresh ? { "Set-Cookie": await sessionCookie(env, email) } : {});
  }

  return json({ status: await lofypayStatus(env, id), paid: false });
}
