/**
 * Conexão Solidária — script.js (v2 · do zero)
 * Vanilla ES Modules · sem bibliotecas externas
 */

const API = {
  health: '/api/health',
  stats: '/api/stats',
  register: '/api/inscricao',
};

const LS = {
  theme: 'cs_theme',
  user: 'cs_user',
  count: 'cs_count',
};

const MIN_AGE = 14;
const KIT_GOAL = 6;

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const KIT_LABELS = {
  caderno: '📓 Caderno',
  alimento: '🥫 Alimento',
  livro: '📚 Livro',
  roupa: '👕 Roupa',
  brinquedo: '🧸 Brinquedo',
  higiene: '🧴 Higiene',
  arte: '🎨 Arte',
  carinho: '💛 Acolhimento',
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', init);

function init() {
  $('#year').textContent = new Date().getFullYear();
  initTheme();
  initCursor();
  initTopbar();
  initScrollProgress();
  initReveal();
  initSplitText();
  initTilt();
  initMagnetic();
  initParallax();
  initSceneCard();
  initParticles();
  initCounters();
  initRipple();
  initKitGame();
  initForm();
  initDevPhoto();
  loadStats();
}

/* ── Theme ── */
function initTheme() {
  const saved = localStorage.getItem(LS.theme);
  applyTheme(saved || 'light', false);

  $('#themeBtn')?.addEventListener('click', (e) => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    const overlay = $('#themeOverlay');
    if (overlay) {
      overlay.style.setProperty('--tx', `${(e.clientX / innerWidth) * 100}%`);
      overlay.style.setProperty('--ty', `${(e.clientY / innerHeight) * 100}%`);
      overlay.classList.add('is-active');
      setTimeout(() => overlay.classList.remove('is-active'), 450);
    }
    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  });
}

function applyTheme(mode, save = true) {
  document.documentElement.dataset.theme = mode;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = mode === 'dark' ? '#0a0e18' : '#003082';
  if (save) localStorage.setItem(LS.theme, mode);
}

/* ── Cursor ── */
function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx}px, ${my}px)`;
  });

  const loop = () => {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    const ring = $('.cursor__ring', cursor);
    if (ring) ring.style.transform = `translate(calc(-50% + ${rx - mx}px), calc(-50% + ${ry - my}px))`;
    requestAnimationFrame(loop);
  };
  loop();

  document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

  $$('a, button, input, textarea, summary, [data-magnetic]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

/* ── Topbar ── */
function initTopbar() {
  const topbar = $('#topbar');
  const nav = $('#topNav');
  const indicator = $('#navIndicator');
  const menuBtn = $('#menuBtn');
  const links = $$('.topbar__link');
  const sections = links.map((l) => $(`#${l.dataset.nav}`)).filter(Boolean);

  const onScroll = () => {
    topbar?.classList.toggle('is-solid', scrollY > 40);

    let current = sections[0]?.id;
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= 120) current = sec.id;
    }

    links.forEach((link) => {
      const active = link.dataset.nav === current;
      link.classList.toggle('is-active', active);
      if (active && indicator && nav) {
        const navRect = nav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.left = `${linkRect.left - navRect.left}px`;
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuBtn?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(!!open));
  });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      nav?.classList.remove('is-open');
      menuBtn?.classList.remove('is-open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── Scroll progress ── */
function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = max > 0 ? `${(scrollY / max) * 100}%` : '0%';
  }, { passive: true });
}

/* ── Reveal on scroll ── */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => io.observe(el));
}

/* ── Split text ── */
function initSplitText() {
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${i * 0.025}s`;
      el.appendChild(span);
    });
  });

  const chars = $$('.split-char');
  if (!chars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('[data-split]').forEach((el) => io.observe(el));
}

/* ── 3D Tilt ── */
function initTilt() {
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--ry', `${x * 12}deg`);
      el.style.setProperty('--rx', `${-y * 12}deg`);
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/* ── Magnetic buttons ── */
function initMagnetic() {
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.setProperty('--mx', `${x * 0.2}px`);
      btn.style.setProperty('--my', `${y * 0.2}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

/* ── Parallax orbs ── */
function initParallax() {
  const orbs = $$('.intro__orb');
  if (!orbs.length) return;
  window.addEventListener('scroll', () => {
    const y = scrollY * 0.15;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${y * (i + 1) * 0.3}px)`;
    });
  }, { passive: true });
}

/* ── Scene card shine ── */
function initSceneCard() {
  const card = $('#sceneCard');
  if (!card) return;
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 100;
    const sy = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--sx', `${sx}%`);
    card.style.setProperty('--sy', `${sy}%`);
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--ry', `${x * 10}deg`);
    card.style.setProperty('--rx', `${-y * 10}deg`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
}

/* ── Canvas particles ── */
function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  const resize = () => {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: Math.random() > 0.5 ? 'rgba(0,48,130,0.35)' : 'rgba(197,107,48,0.3)',
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ── Counters ── */
function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animNum(entry.target, Number(entry.target.dataset.count));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach((el) => io.observe(el));
}

function animNum(el, target) {
  const start = performance.now();
  const dur = 1200;
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setCounterValue(id, val) {
  const el = $(id);
  if (el) animNum(el, val);
}

/* ── Ripple ── */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/* ── Kit game ── */
function initKitGame() {
  const items = $('#kitItems');
  const drop = $('#kitDrop');
  const score = $('#kitScore');
  const reset = $('#kitReset');
  if (!items || !drop) return;

  const picked = new Set();

  const render = () => {
    drop.innerHTML = '';
    if (!picked.size) {
      drop.innerHTML = '<span class="game__empty">Seu kit aparece aqui</span>';
    } else {
      picked.forEach((key) => {
        const chip = document.createElement('span');
        chip.className = 'game__chip';
        chip.textContent = KIT_LABELS[key];
        drop.appendChild(chip);
      });
    }
    const pct = Math.min(100, Math.round((picked.size / KIT_GOAL) * 100));
    if (score) score.textContent = `${pct}%`;
  };

  items.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-kit]');
    if (!btn) return;
    const key = btn.dataset.kit;
    if (picked.has(key)) {
      picked.delete(key);
      btn.classList.remove('is-on');
    } else if (picked.size < KIT_GOAL) {
      picked.add(key);
      btn.classList.add('is-on');
    }
    render();
  });

  reset?.addEventListener('click', () => {
    picked.clear();
    $$('.game__items button', items).forEach((b) => b.classList.remove('is-on'));
    render();
  });
}

/* ── API & stats ── */
async function apiUp() {
  try {
    const res = await fetch(API.health, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function loadStats() {
  let count = Number(localStorage.getItem(LS.count)) || 0;

  if (await apiUp()) {
    try {
      const res = await fetch(API.stats);
      const data = await res.json();
      count = data.contador ?? count;
      localStorage.setItem(LS.count, count);
    } catch { /* fallback */ }
  }

  setCounterValue('#heroCounter', count);
  setCounterValue('#liveCounter', count);

  const saved = localStorage.getItem(LS.user);
  if (saved) {
    try {
      const user = JSON.parse(saved);
      showSuccess(user.nome);
    } catch { /* ignore */ }
  }
}

/* ── Form ── */
function initForm() {
  const form = $('#signupForm');
  if (!form) return;

  const fields = {
    nome: { el: $('#nome'), err: $('#errNome') },
    idade: { el: $('#idade'), err: $('#errIdade') },
    email: { el: $('#email'), err: $('#errEmail') },
    motivo: { el: $('#motivo'), err: $('#errMotivo') },
  };

  Object.entries(fields).forEach(([name, { el }]) => {
    el?.addEventListener('blur', () => validateField(name, fields));
    el?.addEventListener('input', () => {
      if (el.closest('.form__field')?.classList.contains('is-bad')) {
        validateField(name, fields);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = Object.keys(fields).every((k) => validateField(k, fields));
    if (!valid) return setStatus('Corrija os campos destacados.', 'bad');

    const payload = {
      nome: fields.nome.el.value.trim(),
      idade: Number(fields.idade.el.value),
      email: fields.email.el.value.trim(),
      motivo: fields.motivo.el.value.trim(),
    };

    const btn = $('#submitBtn');
    const label = $('#submitLabel');
    btn.disabled = true;
    if (label) label.textContent = 'Enviando...';

    try {
      if (await apiUp()) {
        const res = await fetch(API.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) {
          openDupDialog();
          return;
        }
        if (!res.ok) throw new Error(data.error || 'Erro ao inscrever.');
        localStorage.setItem(LS.user, JSON.stringify({ nome: payload.nome, email: payload.email }));
        localStorage.setItem(LS.count, data.contador);
        setCounterValue('#heroCounter', data.contador);
        setCounterValue('#liveCounter', data.contador);
        showSuccess(payload.nome);
        setStatus('', '');
      } else {
        saveLocal(payload);
        showSuccess(payload.nome);
      }
    } catch (err) {
      if (err.message.includes('inscrito')) {
        openDupDialog();
      } else {
        setStatus(err.message || 'Erro ao enviar. Tente novamente.', 'bad');
      }
    } finally {
      btn.disabled = false;
      if (label) label.textContent = 'Confirmar inscrição';
    }
  });

  $('#dupOk')?.addEventListener('click', closeDupDialog);
  $('#dupClose')?.addEventListener('click', closeDupDialog);
}

function validateField(name, fields) {
  const { el, err } = fields[name];
  const wrap = el?.closest('.form__field');
  if (!el || !wrap) return false;

  let msg = '';
  const val = el.value.trim();

  switch (name) {
    case 'nome':
      if (val.length < 3) msg = 'Nome deve ter ao menos 3 caracteres.';
      break;
    case 'idade': {
      const age = Number(val);
      if (!Number.isInteger(age) || age < MIN_AGE) msg = `Idade mínima: ${MIN_AGE} anos.`;
      else if (age > 120) msg = 'Idade inválida.';
      break;
    }
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'E-mail inválido.';
      break;
    case 'motivo':
      if (val.length < 20) msg = 'Motivação muito curta (mín. 20 caracteres).';
      break;
    default:
      break;
  }

  wrap.classList.toggle('is-bad', !!msg);
  wrap.classList.toggle('is-ok', !msg && val.length > 0);
  if (err) err.textContent = msg;
  return !msg;
}

function setStatus(msg, type) {
  const el = $('#formStatus');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('is-ok', type === 'ok');
  el.classList.toggle('is-bad', type === 'bad');
}

function saveLocal(payload) {
  const prev = localStorage.getItem(LS.user);
  if (prev) {
    try {
      if (JSON.parse(prev).email === payload.email) {
        openDupDialog();
        return;
      }
    } catch { /* ignore */ }
  }
  localStorage.setItem(LS.user, JSON.stringify({ nome: payload.nome, email: payload.email }));
  const count = Number(localStorage.getItem(LS.count) || 0) + 1;
  localStorage.setItem(LS.count, count);
  setCounterValue('#heroCounter', count);
  setCounterValue('#liveCounter', count);
}

function showSuccess(nome) {
  $('#joinGrid')?.classList.add('hidden');
  const panel = $('#successPanel');
  const text = $('#successText');
  if (text) text.textContent = `${nome}, sua inscrição no Conexão Solidária foi registrada. Obrigado por fazer parte dessa rede de apoio!`;
  panel?.classList.remove('hidden');
}

function openDupDialog() {
  $('#dupDialog')?.showModal();
}

function closeDupDialog() {
  $('#dupDialog')?.close();
}

/* ── Dev photo ── */
function initDevPhoto() {
  const avatar = $('#devAvatar');
  if (!avatar) return;
  const img = new Image();
  img.onload = () => {
    avatar.textContent = '';
    avatar.appendChild(img);
  };
  img.src = 'assets/dev-ana.jpg';
}
