// LofyPay notification_url callback. It is unsigned, so the payment is re-checked
// against the status endpoint before being trusted. Hook order fulfillment in here.

import { lofypayStatus } from "./status.js";

export async function onRequestPost({ request, env }) {
  const event = await request.json().catch(() => ({}));
  if (!event.idTransaction || !env.LOFYPAY_SECRET_KEY) return new Response("ignored", { status: 200 });

  const status = await lofypayStatus(env, String(event.idTransaction));
  if (status === "PAID_OUT") {
    console.log("pix paid", event.idTransaction, event.external_reference, event.amount);
  }
  return new Response("ok", { status: 200 });
}
