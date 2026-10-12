// Course structure for the members area. Content is only sent to a member once
// the module is unlocked, so locked lessons never reach the browser.
//
// unlockAfterDays: days after purchase before the module opens (0 = immediately).
// youtube: video id; the player uses the privacy-enhanced youtube-nocookie embed.

const lesson = (id, youtube, title) => ({ id, youtube, title });

export const COURSE = {
  title: "Especialista em Bolos Gelados",
  modules: [
    {
      id: "m1",
      title: "Módulo 1 · Bolos Gelados Embrulhados",
      unlockAfterDays: 0,
      lessons: [
        lesson("m1-a1", "EBy_jC46flU", "Embrulhado de coco com abacaxi"),
        lesson("m1-a2", "MjGPA0sM8q4", "Embrulhado de ninho com brigadeiro"),
        lesson("m1-a3", "8Q66NCKqZdM", "Embrulhado de olho de sogra"),
        lesson("m1-a4", "rfuYBHZTp0c", "Embrulhado de coco (toalha felpuda)"),
        lesson("m1-a5", "iITQ8bXFSSo", "Embrulhado de chocolate com brigadeiro"),
      ],
    },
    {
      id: "m2",
      title: "Módulo 2 · Bolos Gelados na Marmita",
      unlockAfterDays: 2,
      lessons: [
        lesson("m2-a1", "ZQSVQbu886A", "Leite Ninho na marmita"),
        lesson("m2-a2", "roaGDr5kQEM", "Coco na marmita (toalha felpuda)"),
        lesson("m2-a3", "mZqrmDCZZD0", "Brigadeiro com calda cremosa na marmita"),
        lesson("m2-a4", "MSKiuR4vQXs", "Limão na marmita"),
        lesson("m2-a5", "ZS0wVCqk2rs", "Bolo integral fit na marmita"),
        lesson("m2-a6", "O4ZPZHF1GTk", "Fatia de Leite Ninho com Nutella na marmita"),
      ],
    },
    {
      id: "m3",
      title: "Módulo 3 · Fatias e Slice Cakes",
      unlockAfterDays: 4,
      lessons: [
        lesson("m3-a1", "3zTKLCdVDgM", "Fatia gourmet de prestígio"),
        lesson("m3-a2", "R6k4WpNVF2Q", "Slice cake bombom de morango"),
        lesson("m3-a3", "uOu7itaA92c", "Super fatia Oreo"),
        lesson("m3-a4", "7Yx9jom0vXg", "Red velvet para festival de fatias"),
      ],
    },
    {
      id: "m4",
      title: "Módulo 4 · Bolos Gelados Clássicos",
      unlockAfterDays: 6,
      lessons: [
        lesson("m4-a1", "075fSRyVU3Q", "Bolo de Leite Ninho"),
        lesson("m4-a2", "IZ5UQXO2mTw", "Leite Ninho na travessa"),
        lesson("m4-a3", "wZ7VOoCaHkw", "Leite Ninho com geleia de morango"),
        lesson("m4-a4", "jjEiwvFtn0g", "Folhado de morango com leite condensado"),
        lesson("m4-a5", "AtmJu3bV6q0", "Prestígio"),
        lesson("m4-a6", "2O3EA0HWz74", "Chocolate recheado"),
        lesson("m4-a7", "kbMfDJN7f4Q", "Mousse de chocolate branco"),
        lesson("m4-a8", "dOAG1yyxwN0", "Chocolate com Leite Ninho e morango"),
        lesson("m4-a9", "iWcX_mteW7U", "Chocolate com maracujá"),
        lesson("m4-a10", "6_7lRJYssoc", "Quatro leites com coco"),
        lesson("m4-a11", "aDA0KiF5luc", "Coco com doce de leite"),
      ],
    },
  ],
};

export const allLessonIds = () => COURSE.modules.flatMap((m) => m.lessons.map((l) => l.id));
