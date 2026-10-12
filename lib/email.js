// Transactional e-mail through Resend. Sending never blocks or fails the caller:
// errors are logged and the function resolves to false.

export const SITE = "https://www.bolosgelados.site";
const FROM = "Bolos Gelados <acesso@bolosgelados.site>";

const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const firstName = (name) => esc(String(name || "").trim().split(/\s+/)[0] || "aluna");

export async function sendEmail(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM || FROM, to: [to], subject, html, text }),
    });
    if (!res.ok) console.error("resend error", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("resend error", err);
    return false;
  }
}

const layout = (title, body, cta) => `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fdf6f1;font-family:Arial,Helvetica,sans-serif;color:#6b3a1e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #eadfd8;border-radius:16px">
<tr><td style="padding:22px 26px 0;font-size:18px;font-weight:bold">Bolos <span style="color:#c2306f">Gelados</span></td></tr>
<tr><td style="padding:14px 26px 6px"><h1 style="margin:0 0 12px;font-size:21px">${title}</h1>${body}</td></tr>
<tr><td style="padding:10px 26px 26px"><a href="${cta.href}" style="display:inline-block;background:#2bb389;color:#fff;text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:10px">${cta.label}</a></td></tr>
</table><p style="font-size:12px;color:#7a6a62;margin:14px 0 0">bolosgelados.site</p></td></tr></table></body></html>`;

export function welcomeEmail({ name, email }) {
  const link = `${SITE}/membros/`;
  return {
    subject: "Seu acesso está liberado!",
    html: layout(
      `Bem-vinda, ${firstName(name)}!`,
      `<p style="margin:0 0 10px;line-height:1.5">Seu pagamento foi confirmado e seu acesso à área de membros já está liberado.</p>
       <p style="margin:0 0 10px;line-height:1.5">Entre com o e-mail <b>${esc(email)}</b> e a senha que você criou no checkout. O módulo 1 já está disponível e os próximos são liberados a cada dois dias.</p>`,
      { href: link, label: "Acessar a área de membros" },
    ),
    text: `Seu pagamento foi confirmado e seu acesso está liberado.\nEntre em ${link} com o e-mail ${email} e a senha que você criou no checkout.`,
  };
}

export function resetEmail({ name, token }) {
  const link = `${SITE}/membros/?reset=${encodeURIComponent(token)}`;
  return {
    subject: "Redefinição de senha",
    html: layout(
      `Olá, ${firstName(name)}`,
      `<p style="margin:0 0 10px;line-height:1.5">Recebemos um pedido para redefinir a senha da sua área de membros. O link vale por 1 hora.</p>
       <p style="margin:0 0 10px;line-height:1.5;color:#7a6a62;font-size:14px">Se não foi você, ignore este e-mail. Sua senha continua a mesma.</p>`,
      { href: link, label: "Criar nova senha" },
    ),
    text: `Para criar uma nova senha, acesse (válido por 1 hora): ${link}\nSe não foi você, ignore este e-mail.`,
  };
}
