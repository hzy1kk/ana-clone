/**
 * Conexão Solidária — Front-end premium
 * Animações · jogo · API + fallback localStorage
 */

const API = {
  stats: '/api/stats',
  inscricao: '/api/inscricao',
  check: (email) => `/api/inscricao/check?email=${encodeURIComponent(email)}`,
};

const STORAGE = {
  reg: 'cs_inscricao_v2',
  theme: 'cs_theme_v2',
};

const MIN_AGE = 14;
const GAME_GOAL = 5;

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const html = document.documentElement;
const nav = $('#nav');
const navPill = $('#navPill');
const navLinks = $$('[data-nav]');
const themeToggle = $('#themeToggle');
const themeOverlay = $('#themeOverlay');
const cursorGlow = $('#cursorGlow');
const heroCard3d = $('#heroCard3d');
const heroScene = $('#heroScene');
const heroCanvas = $('#heroCanvas');
const liveCounter = $('#liveCounter');
const form = $('#formInscricao');
const formFeedback = $('#formFeedback');
const successPanel = $('#successPanel');
const successText = $('#successText');
const modalDup = $('#modalDup');
const modalClose = $('#modalClose');
const yearEl = $('#year');
const devAvatar = $('#devAvatar');

/* ── Init ── */
function init() {
  yearEl && (yearEl.textContent = new Date().getFullYear());
  initTheme();
  initCursor();
  initNav();
  initMobileNav();
  initScrollReveal();
  initSplitReveal();
  initCounters();
  initTilt();
  initMagnetic();
  initHero3d();
  initHeroCanvas();
  initParallax();
  initGame();
  initForm();
  initDevPhoto();
  syncStats();
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-in'), 200 + i * 100);
  });
}

document.addEventListener('DOMContentLoaded', init);

/* ── Theme ── */
function initTheme() {
  const saved = localStorage.getItem(STORAGE.theme);
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'), false);

  themeToggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
    localStorage.setItem(STORAGE.theme, next);
  });
}

function setTheme(theme, animate = true) {
  const apply = () => {
    html.setAttribute('data-theme', theme);
    themeToggle?.setAttribute('aria-checked', theme === 'dark');
    $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080c12' : '#1b4f8a');
  };

  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply();
    return;
  }

  const fade = () => {
    themeOverlay?.classList.add('is-active');
    setTimeout(() => {
      if (document.startViewTransition) document.startViewTransition(() => apply());
      else apply();
      setTimeout(() => themeOverlay?.classList.remove('is-active'), 350);
    }, 180);
  };
  fade();
}

/* ── Cursor glow ── */
function initCursor() {
  if (!cursorGlow || matchMedia('(pointer: coarse)').matches) return;
  let x = 0;
  let y = 0;
  let cx = 0;
  let cy = 0;

  document.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    html.style.setProperty('--cursor-x', `${x}px`);
    html.style.setProperty('--cursor-y', `${y}px`);
    html.style.setProperty('--cursor-opacity', '1');
  });

  const tick = () => {
    cx += (x - cx) * 0.12;
    cy += (y - cy) * 0.12;
    cursorGlow.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
    requestAnimationFrame(tick);
  };
  tick();

  document.addEventListener('mouseleave', () => html.style.setProperty('--cursor-opacity', '0'));
}

/* ── Nav pill + scroll spy ── */
function initNav() {
  const movePill = (link) => {
    if (!navPill || !link || innerWidth < 900) {
      navPill && (navPill.style.opacity = '0');
      return;
    }
    const parent = link.parentElement?.parentElement || link.closest('.nav__links');
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    navPill.style.opacity = '1';
    navPill.style.width = `${lr.width}px`;
    navPill.style.transform = `translateX(${lr.left - pr.left}px)`;
  };

  const sections = ['contexto', 'desafio', 'solucao', 'resultado', 'convite'];
  const onScroll = () => {
    nav?.classList.toggle('nav--scrolled', scrollY > 24);
    const pos = scrollY + 120;
    let current = 'contexto';
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= pos) current = id;
    });
    navLinks.forEach((l) => {
      const active = l.getAttribute('href') === `#${current}`;
      l.classList.toggle('is-active', active);
      if (active) movePill(l);
    });
  };

  navLinks.forEach((l) => {
    l.addEventListener('mouseenter', () => movePill(l));
    l.addEventListener('click', (e) => {
      e.preventDefault();
      const id = l.getAttribute('href')?.slice(1);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  $('#navLinks')?.addEventListener('mouseleave', onScroll);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

function initMobileNav() {
  const burger = $('#navBurger');
  const links = $('#navLinks');
  burger?.addEventListener('click', () => {
    const open = links?.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.forEach((l) => l.addEventListener('click', () => links?.classList.remove('is-open')));
}

/* ── Scroll reveal ── */
function initScrollReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const d = Number(e.target.dataset.delay || 0) * 90;
        setTimeout(() => e.target.classList.add('is-in'), d);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  $$('.reveal').forEach((el) => io.observe(el));
}

function initSplitReveal() {
  $$('.split-reveal').forEach((el) => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
  });
}

/* ── Counters ── */
function initCounters() {
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        animateNum(el, 0, target, 1600);
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
  });
}

function animateNum(el, from, to, ms) {
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / ms, 1);
    const eased = 1 - (1 - p) ** 3;
    el.textContent = Math.floor(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = to;
  };
  requestAnimationFrame(step);
}

/* ── 3D tilt cards ── */
function initTilt() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--tilt-x', `${-y * 12}deg`);
      card.style.setProperty('--tilt-y', `${x * 12}deg`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

function initHero3d() {
  if (!heroCard3d || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  heroCard3d.addEventListener('mousemove', (e) => {
    const r = heroCard3d.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    heroCard3d.style.setProperty('--tilt-x', `${-y * 18}deg`);
    heroCard3d.style.setProperty('--tilt-y', `${x * 18}deg`);
  });
  heroCard3d.addEventListener('mouseleave', () => {
    heroCard3d.style.setProperty('--tilt-x', '0deg');
    heroCard3d.style.setProperty('--tilt-y', '0deg');
  });
}

/* ── Magnetic buttons ── */
function initMagnetic() {
  if (matchMedia('(pointer: coarse)').matches) return;
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.setProperty('--magnetic-x', `${x * 0.2}px`);
      btn.style.setProperty('--magnetic-y', `${y * 0.2}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--magnetic-x', '0px');
      btn.style.setProperty('--magnetic-y', '0px');
    });
  });
}

/* ── Parallax orbs ── */
function initParallax() {
  if (!heroScene) return;
  window.addEventListener(
    'scroll',
    () => {
      const y = Math.min(scrollY, innerHeight);
      heroScene.style.setProperty('--orb-blue-y', `${y * 0.15}px`);
      heroScene.style.setProperty('--orb-orange-y', `${y * 0.08}px`);
    },
    { passive: true }
  );
}

/* ── Hero canvas particles ── */
function initHeroCanvas() {
  if (!heroCanvas) return;
  const ctx = heroCanvas.getContext('2d');
  let pts = [];
  let raf;

  const resize = () => {
    heroCanvas.width = heroCanvas.offsetWidth;
    heroCanvas.height = heroCanvas.offsetHeight;
    const n = Math.min(80, Math.floor(heroCanvas.width / 18));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * heroCanvas.width,
      y: Math.random() * heroCanvas.height,
      r: Math.random() * 2 + 0.5,
      vy: Math.random() * 0.35 + 0.08,
      vx: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.35 + 0.08,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < 0) {
        p.y = heroCanvas.height;
        p.x = Math.random() * heroCanvas.width;
      }
    });
    raf = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ── Game: Kit Solidário ── */
function initGame() {
  const items = $$('.game__item');
  const box = $('#gameBox');
  const scoreEl = $('#gameScore');
  const resetBtn = $('#gameReset');
  const picked = new Set();

  const labels = {
    arroz: '🍚 Arroz',
    feijao: '🫘 Feijão',
    livro: '📚 Livro',
    brinquedo: '🧸 Brinquedo',
    fruta: '🍎 Fruta',
    carinho: '💛 Acolhimento',
  };

  const update = () => {
    const n = picked.size;
    const score = Math.min(100, Math.round((n / GAME_GOAL) * 100));
    scoreEl.textContent = score;
    if (!box) return;
    if (n === 0) {
      box.innerHTML = '<span class="game__box-placeholder">Seu kit aparece aqui</span>';
      return;
    }
    box.innerHTML = [...picked]
      .map((k) => `<span class="game__chip">${labels[k]}</span>`)
      .join('');
    if (n >= GAME_GOAL) {
      box.insertAdjacentHTML('beforeend', '<p class="game__win">Kit completo! Você está pronto para o dia da ação. 🎉</p>');
    }
  };

  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.item;
      if (picked.has(key)) {
        picked.delete(key);
        btn.classList.remove('is-picked');
      } else {
        picked.add(key);
        btn.classList.add('is-picked');
        btn.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
          { duration: 280 }
        );
      }
      update();
    });
  });

  resetBtn?.addEventListener('click', () => {
    picked.clear();
    items.forEach((b) => b.classList.remove('is-picked'));
    update();
  });
}

/* ── API + Form ── */
async function apiAvailable() {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

async function syncStats() {
  let count = 0;
  const hasApi = await apiAvailable();
  if (hasApi) {
    try {
      const res = await fetch(API.stats);
      const data = await res.json();
      count = data.contador ?? 0;
    } catch { /* fallback */ }
  }
  if (!count) {
    const legacy = Number(localStorage.getItem('conexaoSolidaria_contador') || 0);
    count = legacy;
    if (localStorage.getItem(STORAGE.reg)) count = Math.max(count, 1);
  }
  if (liveCounter) liveCounter.textContent = count;

  const saved = localStorage.getItem(STORAGE.reg);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      showSuccess(data, false);
      form?.classList.add('is-disabled');
    } catch { /* */ }
  }
}

function showSuccess(data, scroll = true) {
  successPanel?.classList.remove('is-hidden');
  form?.classList.add('is-hidden');
  const name = data.nome?.split(' ')[0] || 'Voluntário(a)';
  successText.textContent = `Obrigado, ${name}! Sua inscrição foi registrada. Nos vemos em 17/10/2026 no Centro Esperança Viva.`;
  if (scroll) successPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initForm() {
  if (!form) return;

  const fields = {
    nome: $('#nome'),
    idade: $('#idade'),
    email: $('#email'),
    motivo: $('#motivo'),
  };

  Object.entries(fields).forEach(([key, input]) => {
    input?.addEventListener('blur', () => validate(key, input));
    input?.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validate(key, input);
    });
  });

  modalClose?.addEventListener('click', () => modalDup?.close());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = Object.entries(fields).every(([k, inp]) => validate(k, inp));
    if (!valid) {
      setFeedback('Revise os campos destacados.', false);
      return;
    }

    const payload = {
      nome: fields.nome.value.trim(),
      idade: Number(fields.idade.value),
      email: fields.email.value.trim().toLowerCase(),
      motivo: fields.motivo.value.trim(),
    };

    const btn = $('#formSubmit');
    btn.disabled = true;
    setFeedback('Enviando inscrição...', true);

    const hasApi = await apiAvailable();
    try {
      if (hasApi) {
        const res = await fetch(API.inscricao, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) {
          modalDup?.showModal();
          setFeedback(data.error || 'Inscrição já existente.', false);
          return;
        }
        if (!res.ok) throw new Error(data.error || 'Erro ao inscrever.');
        localStorage.setItem(STORAGE.reg, JSON.stringify({ ...payload, inscritoEm: new Date().toISOString() }));
        if (liveCounter) liveCounter.textContent = data.contador;
        setFeedback(data.message + ' (salvo no servidor)', true);
        showSuccess(payload);
      } else {
        if (localStorage.getItem(STORAGE.reg)) {
          modalDup?.showModal();
          setFeedback('Você já está inscrito(a) nesta ação.', false);
          return;
        }
        localStorage.setItem(STORAGE.reg, JSON.stringify({ ...payload, inscritoEm: new Date().toISOString() }));
        const c = Number(localStorage.getItem('conexaoSolidaria_contador') || 0) + 1;
        localStorage.setItem('conexaoSolidaria_contador', String(c));
        if (liveCounter) liveCounter.textContent = c;
        setFeedback('Inscrição salva localmente (inicie o servidor para API).', true);
        showSuccess(payload);
      }
    } catch (err) {
      setFeedback(err.message || 'Falha ao enviar. Tente novamente.', false);
    } finally {
      btn.disabled = false;
    }
  });
}

function validate(key, input) {
  const err = $(`#err-${key}`);
  let msg = '';
  const v = input?.value?.trim() ?? '';

  switch (key) {
    case 'nome':
      if (v.length < 3) msg = 'Nome completo obrigatório.';
      break;
    case 'idade': {
      const n = Number(v);
      if (!v) msg = 'Informe a idade.';
      else if (n < MIN_AGE) msg = `Mínimo ${MIN_AGE} anos.`;
      else if (n > 120) msg = 'Idade inválida.';
      break;
    }
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'E-mail inválido.';
      break;
    case 'motivo':
      if (v.length < 20) msg = 'Mínimo 20 caracteres.';
      break;
    default:
      break;
  }

  input?.classList.toggle('is-invalid', !!msg);
  input?.classList.toggle('is-valid', !msg && v.length > 0);
  if (err) err.textContent = msg;
  return !msg;
}

function setFeedback(text, ok) {
  if (!formFeedback) return;
  formFeedback.textContent = text;
  formFeedback.classList.toggle('is-ok', ok);
}

function initDevPhoto() {
  const img = new Image();
  img.src = 'assets/dev-ana.jpg';
  img.alt = 'Ana Flávia';
  img.onload = () => {
    if (!devAvatar) return;
    devAvatar.innerHTML = '';
    devAvatar.appendChild(img);
  };
}
