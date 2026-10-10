// LofyPay notification_url callback. It is unsigned, so activateOrder re-checks the
// payment against the status endpoint before creating the member account.

import { activateOrder } from "../../lib/lofypay.js";

export async function onRequestPost({ request, env }) {
  const event = await request.json().catch(() => ({}));
  if (event.idTransaction && env.LOFYPAY_SECRET_KEY) {
    const email = await activateOrder(env, String(event.idTransaction));
    if (email) console.log("member activated", email, event.idTransaction);
  }
  return new Response("ok", { status: 200 });
}
