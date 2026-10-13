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

  const progress = member.progress || {};
  // Legacy members (no entitlements recorded) keep full access.
  const ent = member.entitlements || entitlementsFor(null);
  const hasFull = ent.recipes === "full";

  let available = 0;
  const modules = COURSE.modules.map((m) => {
    const unlocked = m.tier === "basic" || hasFull;
    if (unlocked) available += m.lessons.length;
    return {
      id: m.id,
      title: m.title,
      unlocked,
      lockReason: unlocked ? null : "Disponível no acesso completo",
      lessons: m.lessons.map((l) => {
        const base = { id: l.id, title: l.title, unlocked, done: Boolean(progress[l.id]) };
        return unlocked && l.youtube ? { ...base, video: embed(l.youtube) } : base;
      }),
    };
  });
  const bonuses = bonusIds()
    .filter((id) => ent[id])
    .map((id) => {
      const b = BONUSES[id];
      if (b.type === "content") return { id: b.id, type: "content", title: b.title, desc: b.desc, sections: b.sections, tips: b.tips };
      return { id: b.id, type: "tool", tool: b.tool, title: b.title, desc: b.desc };
    });

  const doneCount = Object.keys(progress).filter((id) => allLessonIds().includes(id)).length;
  return json({
    member: { name: member.name, email: member.email, since: member.since },
    course: COURSE.title,
    upgrade: !hasFull,
    progress: { done: doneCount, total: available },
    modules,
    bonuses,
  });
}
