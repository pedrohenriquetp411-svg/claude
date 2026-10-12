// Returns the course for the signed-in member. Locked modules only expose their
// title and unlock date; the video is sent only once the module is unlocked.

import { currentMember, json } from "../../../lib/auth.js";
import { COURSE, allLessonIds } from "../../../lib/content.js";

const embed = (id) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;

export async function onRequestGet({ request, env }) {
  const member = await currentMember(request, env);
  if (!member) return json({ error: "Faça login para continuar." }, 401);

  const since = new Date(member.since).getTime();
  const progress = member.progress || {};
  const ids = allLessonIds();

  const modules = COURSE.modules.map((m) => {
    const unlockAt = since + m.unlockAfterDays * 864e5;
    const unlocked = Date.now() >= unlockAt;
    return {
      id: m.id,
      title: m.title,
      unlocked,
      unlockAt: new Date(unlockAt).toISOString(),
      lessons: m.lessons.map((l) => {
        const base = { id: l.id, title: l.title, unlocked, done: Boolean(progress[l.id]) };
        return unlocked && l.youtube ? { ...base, video: embed(l.youtube) } : base;
      }),
    };
  });

  return json({
    member: { name: member.name, email: member.email, since: member.since },
    course: COURSE.title,
    progress: { done: ids.filter((id) => progress[id]).length, total: ids.length },
    modules,
  });
}
