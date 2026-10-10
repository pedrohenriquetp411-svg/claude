// Marks a lesson as done (or not) for the signed-in member.

import { currentMember, json } from "../../../lib/auth.js";
import { allLessonIds } from "../../../lib/content.js";

export async function onRequestPost({ request, env }) {
  const member = await currentMember(request, env);
  if (!member) return json({ error: "Faça login para continuar." }, 401);

  const body = await request.json().catch(() => ({}));
  if (!allLessonIds().includes(body.lessonId)) return json({ error: "Aula inválida." }, 400);

  member.progress = member.progress || {};
  if (body.done) member.progress[body.lessonId] = new Date().toISOString();
  else delete member.progress[body.lessonId];
  await env.MEMBERS.put(`member:${member.email}`, JSON.stringify(member));
  return json({ ok: true });
}
