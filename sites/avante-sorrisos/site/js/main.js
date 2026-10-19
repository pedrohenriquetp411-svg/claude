(() => {
  const WHATSAPP = '553532124798';
  const DEFAULT_MESSAGE = 'Olá! Gostaria de agendar uma avaliação na Clínica Avante Sorrisos e Saúde.';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canTilt = !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const whatsappUrl = (message) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

  // Todos os botões de WhatsApp apontam para o mesmo número.
  document.querySelectorAll('[data-wa]').forEach((link) => {
    link.href = whatsappUrl(link.dataset.wa || DEFAULT_MESSAGE);
  });

  // Menu mobile
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('is-open', !open);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    });
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Revela os blocos conforme entram na tela
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Inclinação 3D acompanhando o ponteiro
  const relativePosition = (event, element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
  };

  if (canTilt) {
    const scene = document.querySelector('.scene');
    scene.addEventListener('pointermove', (event) => {
      const { x, y } = relativePosition(event, scene);
      scene.style.setProperty('--ry', `${(x * 24).toFixed(1)}deg`);
      scene.style.setProperty('--rx', `${(-y * 24).toFixed(1)}deg`);
    });
    scene.addEventListener('pointerleave', () => {
      scene.style.setProperty('--rx', '0deg');
      scene.style.setProperty('--ry', '0deg');
    });

    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const { x, y } = relativePosition(event, card);
        card.style.transform = `perspective(900px) rotateX(${(-y * 12).toFixed(1)}deg) rotateY(${(x * 12).toFixed(1)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Formulário: monta a mensagem e abre o WhatsApp da clínica
  const form = document.getElementById('form-agendar');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const lines = [
      `Olá! Meu nome é ${data.get('nome').trim()}.`,
      `Serviço de interesse: ${data.get('servico') || 'avaliação geral'}`,
    ];
    const message = data.get('mensagem').trim();
    if (message) lines.push(`Mensagem: ${message}`);
    lines.push(`Meu WhatsApp: ${data.get('telefone').trim()}`);

    window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener');
  });

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
