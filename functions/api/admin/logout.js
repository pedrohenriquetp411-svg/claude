import { clearAdminCookie, json } from "../../../lib/auth.js";

export const onRequestPost = () => json({ ok: true }, 200, { "Set-Cookie": clearAdminCookie() });
