// Returns the LofyPay status of a Pix charge so the checkout page can poll it.

const LOFYPAY_API = "https://app.lofypay.com/api/v1";

export async function lofypayStatus(env, id) {
  const res = await fetch(`${LOFYPAY_API}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.LOFYPAY_SECRET_KEY}` },
    body: JSON.stringify({ idtransaction: id }),
  });
  const data = await res.json().catch(() => ({}));
  return data.status || "UNKNOWN";
}

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[\w-]{4,100}$/.test(id) || !env.LOFYPAY_SECRET_KEY) {
    return Response.json({ status: "UNKNOWN" }, { status: 400 });
  }
  const status = await lofypayStatus(env, id);
  return Response.json({ status, paid: status === "PAID_OUT" }, { headers: { "Cache-Control": "no-store" } });
}
