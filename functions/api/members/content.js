// Returns the course for the signed-in member. Locked modules only expose their
// title and unlock date; lesson videos and text are sent only once unlocked.

import { currentMember, json } from "../../../lib/auth.js";
import { COURSE, allLessonIds } from "../../../lib/content.js";

export async function onRequestGet({ request, env }) {
  const member = await currentMember(request, env);
  if (!member) return json({ error: "Faça login para continuar." }, 401);

  const since = new Date(member.since).getTime();
  const progress = member.progress || {};
  const total = allLessonIds().filter((id) => !COURSE.modules.some((m) => m.lessons.some((l) => l.id === id && l.requiresCompletion)));
  const done = total.filter((id) => progress[id]).length;
  const courseComplete = done === total.length;

  const modules = COURSE.modules.map((m) => {
    const unlockAt = since + m.unlockAfterDays * 864e5;
    const unlocked = Date.now() >= unlockAt;
    return {
      id: m.id,
      title: m.title,
      unlocked,
      unlockAt: new Date(unlockAt).toISOString(),
      lessons: m.lessons.map((l) => {
        const open = unlocked && (!l.requiresCompletion || courseComplete);
        const base = { id: l.id, title: l.title, unlocked: open, done: Boolean(progress[l.id]) };
        if (!open) return { ...base, lockReason: unlocked ? "Conclua todas as aulas para liberar." : null };
        return { ...base, video: l.video || "", body: l.body || "", download: l.download || "" };
      }),
    };
  });

  return json({
    member: { name: member.name, email: member.email, since: member.since },
    course: COURSE.title,
    progress: { done, total: total.length },
    modules,
  });
}
