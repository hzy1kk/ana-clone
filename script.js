/**
 * Conexão Solidária — Application logic
 * Vanilla JS · localStorage · animations · form validation
 */

/* -------------------------------------------------------------------------- */
/* Configuração — atualize os links da desenvolvedora quando disponíveis      */
/* -------------------------------------------------------------------------- */
const DEV_LINKS = {
  github: 'https://github.com/hzy1kk',
  repository: 'https://github.com/hzy1kk/ana-clone',
};

const STORAGE_KEYS = {
  registration: 'conexaoSolidaria_inscricao',
  counter: 'conexaoSolidaria_contador',
  theme: 'conexaoSolidaria_tema',
};

const MIN_AGE = 14;

/* -------------------------------------------------------------------------- */
/* DOM references                                                             */
/* -------------------------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const form = document.getElementById('inscricaoForm');
const volunteerCountEl = document.getElementById('volunteerCount');
const successCard = document.getElementById('successCard');
const successMessage = document.getElementById('successMessage');
const formFeedback = document.getElementById('formFeedback');
const submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('alreadyRegisteredModal');
const modalClose = document.getElementById('modalClose');
const modalOk = document.getElementById('modalOk');
const yearEl = document.getElementById('year');
const githubLink = document.getElementById('githubLink');
const repoLink = document.getElementById('repoLink');
const devPhotoFrame = document.getElementById('devPhotoFrame');

/* -------------------------------------------------------------------------- */
/* Init                                                                       */
/* -------------------------------------------------------------------------- */
function init() {
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initTheme();
  initDevLinks();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initParallax();
  initParticles();
  initStatsCounter();
  initProgressBars();
  initGallerySlots();
  initForm();
  syncUIWithStorage();
}

document.addEventListener('DOMContentLoaded', init);

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  setTheme(theme);

  themeToggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
  });
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
}

/* -------------------------------------------------------------------------- */
/* Developer links & photo slot                                                 */
/* -------------------------------------------------------------------------- */
function initDevLinks() {
  if (DEV_LINKS.github && githubLink) {
    githubLink.href = DEV_LINKS.github;
    githubLink.removeAttribute('data-placeholder');
  }
  if (DEV_LINKS.repository && repoLink) {
    repoLink.href = DEV_LINKS.repository;
    repoLink.removeAttribute('data-placeholder');
  }

  // Carrega foto da desenvolvedora se existir em assets/dev-ana.jpg
  const img = new Image();
  img.src = 'assets/dev-ana.jpg';
  img.alt = 'Ana Flávia';
  img.onload = () => {
    if (!devPhotoFrame) return;
    devPhotoFrame.querySelector('.dev-initials')?.remove();
    devPhotoFrame.querySelector('.dev-photo-hint')?.remove();
    devPhotoFrame.appendChild(img);
  };
}

/* -------------------------------------------------------------------------- */
/* Navbar                                                                     */
/* -------------------------------------------------------------------------- */
function initNavbar() {
  const onScroll = () => {
    navbar?.classList.toggle('is-scrolled', window.scrollY > 40);
    updateActiveNavLink();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function updateActiveNavLink() {
  const sections = ['inicio', 'voluntariado', 'causa', 'projeto', 'inscricao', 'desenvolvedora'];
  const scrollPos = window.scrollY + 120;

  let current = 'inicio';
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollPos) current = id;
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('is-active', href === current);
  });
}

function initMobileMenu() {
  navToggle?.addEventListener('click', () => {
    const open = navMenu?.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Scroll reveal & stagger                                                      */
/* -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.dataset.delay || 0) * 100;
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));

  // Hero: animar imediatamente
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 150 + i * 120);
  });
}

/* -------------------------------------------------------------------------- */
/* Parallax                                                                   */
/* -------------------------------------------------------------------------- */
function initParallax() {
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual) return;

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      heroVisual.style.transform = `translateY(${y * 0.25}px)`;
    },
    { passive: true }
  );
}

/* -------------------------------------------------------------------------- */
/* Particles (canvas)                                                         */
/* -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  const createParticles = () => {
    const count = Math.min(60, Math.floor(canvas.width / 25));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.fill();
      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
    });
    animationId = requestAnimationFrame(draw);
  };

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  return () => cancelAnimationFrame(animationId);
}

/* -------------------------------------------------------------------------- */
/* Stats counter animation                                                    */
/* -------------------------------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        animateNumber(el, 0, target, 1800);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
}

function animateNumber(el, start, end, duration) {
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = end;
  };
  requestAnimationFrame(step);
}

/* -------------------------------------------------------------------------- */
/* Progress bars                                                              */
/* -------------------------------------------------------------------------- */
function initProgressBars() {
  const cards = document.querySelectorAll('.glass-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.progress-fill').forEach((bar) => {
          const w = bar.dataset.width || '0';
          bar.style.width = `${w}%`;
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  cards.forEach((card) => observer.observe(card));
}

/* -------------------------------------------------------------------------- */
/* Gallery photo slots                                                        */
/* -------------------------------------------------------------------------- */
function initGallerySlots() {
  document.querySelectorAll('.photo-slot').forEach((slot) => {
    const src = slot.dataset.image;
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      slot.style.backgroundImage = `url('${src}')`;
      slot.classList.add('has-image');
    };
  });
}

/* -------------------------------------------------------------------------- */
/* localStorage — counter & registration                                      */
/* -------------------------------------------------------------------------- */
function getCounter() {
  const raw = localStorage.getItem(STORAGE_KEYS.counter);
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function setCounter(value) {
  localStorage.setItem(STORAGE_KEYS.counter, String(value));
  updateCounterDisplay(value);
}

function updateCounterDisplay(value) {
  if (volunteerCountEl) volunteerCountEl.textContent = value;
}

function getRegistration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.registration);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRegistration(data) {
  localStorage.setItem(STORAGE_KEYS.registration, JSON.stringify(data));
}

function syncUIWithStorage() {
  updateCounterDisplay(getCounter());

  const reg = getRegistration();
  if (reg) {
    showSuccessState(reg, false);
    disableFormFields(true);
  }
}

function disableFormFields(disabled) {
  form?.querySelectorAll('input, textarea, button[type="submit"]').forEach((el) => {
    el.disabled = disabled;
  });
}

function showSuccessState(data, animate = true) {
  if (!successCard) return;
  successCard.classList.remove('is-hidden');
  if (successMessage) {
    successMessage.textContent = `Obrigado, ${data.nome.split(' ')[0]}! Sua inscrição foi salva neste navegador. Nos vemos em 17/10/2026.`;
  }
  if (animate) {
    successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function openAlreadyRegisteredModal() {
  if (!modal) return;
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
}

function closeModal() {
  modal?.close?.();
  modal?.removeAttribute('open');
}

modalClose?.addEventListener('click', closeModal);
modalOk?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

/* -------------------------------------------------------------------------- */
/* Form validation & submit                                                   */
/* -------------------------------------------------------------------------- */
function initForm() {
  if (!form) return;

  const fields = {
    nome: document.getElementById('nome'),
    idade: document.getElementById('idade'),
    email: document.getElementById('email'),
    motivo: document.getElementById('motivo'),
  };

  Object.entries(fields).forEach(([key, input]) => {
    input?.addEventListener('blur', () => validateField(key, input));
    input?.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validateField(key, input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (getRegistration()) {
      openAlreadyRegisteredModal();
      return;
    }

    const valid = ['nome', 'idade', 'email', 'motivo'].every((key) =>
      validateField(key, fields[key])
    );

    if (!valid) {
      setFormFeedback('Revise os campos destacados antes de enviar.', false);
      return;
    }

    const payload = {
      nome: fields.nome.value.trim(),
      idade: Number(fields.idade.value),
      email: fields.email.value.trim().toLowerCase(),
      motivo: fields.motivo.value.trim(),
      inscritoEm: new Date().toISOString(),
    };

    submitBtn?.classList.add('is-loading');
    submitBtn.disabled = true;

    await delay(800);

    saveRegistration(payload);
    const newCount = getCounter() + 1;
    setCounter(newCount);

    showSuccessState(payload, true);
    disableFormFields(true);

    setFormFeedback(
      'Inscrição registrada com sucesso! Seus dados foram salvos no localStorage deste navegador.',
      true
    );

    submitBtn?.classList.remove('is-loading');
    form.reset();
  });
}

function validateField(name, input) {
  if (!input) return false;
  const errorEl = document.getElementById(`error-${name}`);
  let message = '';

  const value = input.value.trim();

  switch (name) {
    case 'nome':
      if (value.length < 3) message = 'Informe seu nome completo (mín. 3 caracteres).';
      else if (!/^[\p{L}\s'-]+$/u.test(value)) message = 'Use apenas letras no nome.';
      break;
    case 'idade': {
      const age = Number(value);
      if (!value) message = 'Informe sua idade.';
      else if (!Number.isInteger(age)) message = 'Idade deve ser um número inteiro.';
      else if (age < MIN_AGE) message = `É necessário ter pelo menos ${MIN_AGE} anos para participar.`;
      else if (age > 120) message = 'Informe uma idade válida.';
      break;
    }
    case 'email':
      if (!value) message = 'Informe seu e-mail.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'E-mail inválido.';
      break;
    case 'motivo':
      if (value.length < 20) message = 'Conte um pouco mais sobre sua motivação (mín. 20 caracteres).';
      break;
    default:
      break;
  }

  const valid = !message;
  input.classList.toggle('is-invalid', !valid);
  input.classList.toggle('is-valid', valid && value.length > 0);
  if (errorEl) errorEl.textContent = message;

  return valid;
}

function setFormFeedback(text, success) {
  if (!formFeedback) return;
  formFeedback.textContent = text;
  formFeedback.classList.toggle('is-success', Boolean(success));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
