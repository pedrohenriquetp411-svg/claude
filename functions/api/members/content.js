// Returns the course and the bonuses the signed-in member is entitled to.
// All modules are open now (unlockAfterDays = 0); locked content is never sent.
// Bonus content (e.g. the cardápio text) is only included when the member owns it.

import { currentMember, json } from "../../../lib/auth.js";
import { BONUSES, COURSE, allLessonIds, bonusIds } from "../../../lib/content.js";
import { entitlementsFor } from "../../../lib/pricing.js";

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
      lessons: m.lessons.map((l) => {
        const base = { id: l.id, title: l.title, unlocked, done: Boolean(progress[l.id]) };
        return unlocked && l.youtube ? { ...base, video: embed(l.youtube) } : base;
      }),
    };
  });

  // Legacy members (no entitlements recorded) keep full access.
  const ent = member.entitlements || entitlementsFor(null);
  const bonuses = bonusIds()
    .filter((id) => ent[id])
    .map((id) => {
      const b = BONUSES[id];
      if (b.type === "content") return { id: b.id, type: "content", title: b.title, desc: b.desc, sections: b.sections, tips: b.tips };
      return { id: b.id, type: "tool", tool: b.tool, title: b.title, desc: b.desc };
    });

  return json({
    member: { name: member.name, email: member.email, since: member.since },
    course: COURSE.title,
    progress: { done: ids.filter((id) => progress[id]).length, total: ids.length },
    modules,
    bonuses,
  });
}
