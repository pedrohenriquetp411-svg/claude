// Course structure for the members area. Content is only sent to a member once
// the module is unlocked, so locked lessons never reach the browser.
//
// unlockAfterDays: days after purchase before the module opens (0 = immediately).
// video: embed URL (YouTube "embed/…", Vimeo "player.vimeo.com/video/…", Panda, etc.).
// Leave video empty to show "conteúdo em breve".

export const COURSE = {
  title: "Especialista em Bolos Gelados",
  modules: [
    {
      id: "m1",
      title: "Módulo 1 · Introdução e Boas-Vindas",
      unlockAfterDays: 0,
      lessons: [
        { id: "m1-a1", title: "Boas-vindas e como aproveitar o treinamento", video: "", body: "" },
        { id: "m1-a2", title: "Utensílios básicos para começar", video: "", body: "" },
      ],
    },
    {
      id: "m2",
      title: "Módulo 2 · Massas Perfeitas para Bolos Gelados",
      unlockAfterDays: 0,
      lessons: [
        { id: "m2-a1", title: "Massa branca tradicional", video: "", body: "" },
        { id: "m2-a2", title: "Massa de chocolate", video: "", body: "" },
        { id: "m2-a3", title: "Massa dark", video: "", body: "" },
      ],
    },
    {
      id: "m3",
      title: "Módulo 3 · Recheios e Caldas",
      unlockAfterDays: 2,
      lessons: [
        { id: "m3-a1", title: "Recheios cremosos", video: "", body: "" },
        { id: "m3-a2", title: "Mousses", video: "", body: "" },
        { id: "m3-a3", title: "Complementos especiais", video: "", body: "" },
        { id: "m3-a4", title: "Caldas", video: "", body: "" },
      ],
    },
    {
      id: "m4",
      title: "Módulo 4 · Embalagens e Apresentação",
      unlockAfterDays: 4,
      lessons: [{ id: "m4-a1", title: "Escolhendo e montando as embalagens", video: "", body: "" }],
    },
    {
      id: "m5",
      title: "Módulo 5 · Montagem dos Bolos Gelados",
      unlockAfterDays: 6,
      lessons: [{ id: "m5-a1", title: "Montagem passo a passo", video: "", body: "" }],
    },
    {
      id: "m6",
      title: "Módulo 6 · Validade, Armazenamento e Congelamento",
      unlockAfterDays: 7,
      lessons: [{ id: "m6-a1", title: "Validade, armazenamento e congelamento", video: "", body: "" }],
    },
    {
      id: "bonus",
      title: "Bônus",
      unlockAfterDays: 0,
      lessons: [
        { id: "b-planilha", title: "Planilha de Precificação Inteligente", video: "", body: "", download: "" },
        { id: "b-certificado", title: "Certificado de Conclusão", video: "", body: "Disponível ao concluir todas as aulas.", requiresCompletion: true },
      ],
    },
  ],
};

export const allLessonIds = () => COURSE.modules.flatMap((m) => m.lessons.map((l) => l.id));
