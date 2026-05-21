/**
 * Conexão Solidária
 * Premium interactions: spring cursor, split text, 3D tilt/card,
 * magnetic buttons, parallax, canvas particles, counters, game, form.
 */

/* ─── Config ─── */
const API  = { health: '/api/health', stats: '/api/stats', register: '/api/inscricao' };
const LS   = { theme: 'cs_theme_v5', reg: 'cs_reg_v5' };
const GOAL = 6;

/* ─── Utils ─── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;

/* ──────────────────────────────────── INIT ─── */
function init() {
  $('#yr').textContent = new Date().getFullYear();

  initTheme();
  initCursor();
  initHeader();
  initProgressBar();
  initHeroEntry();
  initSplitText();
  initReveal();
  initTilt3D();
  initMagnetic();
  initParallax();
  initHeroCard();
  initCanvas();
  initCounters();
  initGame();
  initForm();
  initDevPhoto();
  loadCounter();
}

document.addEventListener('DOMContentLoaded', init);

/* ──────────────────────────────────── THEME ─── */
function initTheme() {
  const saved = localStorage.getItem(LS.theme)
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved, false);

  $('#themeSwitch')?.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    localStorage.setItem(LS.theme, next);
  });
}

function applyTheme(theme, animate) {
  const apply = () => {
    html.dataset.theme = theme;
  };

  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply(); return;
  }

  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(apply);
    return;
  }

  const flash = $('#themeFlash');
  flash?.classList.add('is-on');
  setTimeout(() => {
    apply();
    setTimeout(() => flash?.classList.remove('is-on'), 260);
  }, 160);
}

/* ──────────────────────────────────── CURSOR ─── */
function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) {
    $('#cursor')?.remove();
    return;
  }

  const cursor = $('#cursor');
  const dot  = cursor?.querySelector('.cursor__dot');
  const halo = cursor?.querySelector('.cursor__halo');
  if (!cursor || !dot || !halo) return;

  let mx = -300, my = -300, hx = -300, hy = -300;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
  });

  (function loop() {
    hx += (mx - hx) * 0.1;
    hy += (my - hy) * 0.1;
    halo.style.left = `${hx}px`;
    halo.style.top  = `${hy}px`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mousedown', () => {
    dot.style.width  = dot.style.height  = '12px';
    halo.style.width = halo.style.height = '28px';
  });
  document.addEventListener('mouseup', () => {
    dot.style.width  = dot.style.height  = '';
    halo.style.width = halo.style.height = '';
  });
  document.addEventListener('mouseleave', () => { mx = my = -300; });
}

/* ──────────────────────────────────── HEADER ─── */
function initHeader() {
  const header  = $('#header');
  const nav     = $('#headerNav');
  const burger  = $('#headerBurger');
  const navLine = $('#navLine');
  const links   = $$('.header__link');
  const sections = ['contexto','desafio','solucao','impacto','suporte','participe'];

  /* Scroll solid + spy */
  const onScroll = () => {
    header?.classList.toggle('is-solid', scrollY > 24);

    const pos = scrollY + 110;
    let cur = sections[0];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= pos) cur = id;
    });
    links.forEach((l) => l.classList.toggle('is-current', l.dataset.section === cur));
    slideLine($('.header__link.is-current'));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Underline pill */
  function slideLine(target) {
    if (!navLine || !target || !nav) {
      if (navLine) navLine.style.opacity = '0';
      return;
    }
    if (innerWidth < 769) { navLine.style.opacity = '0'; return; }
    const nr = nav.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    navLine.style.opacity   = '1';
    navLine.style.width     = `${tr.width}px`;
    navLine.style.transform = `translateX(${tr.left - nr.left}px)`;
  }

  links.forEach((l) => {
    l.addEventListener('mouseenter', () => slideLine(l));
    l.addEventListener('click', (e) => {
      const href = l.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      nav.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    });
  });
  nav?.addEventListener('mouseleave', () => slideLine($('.header__link.is-current')));
  addEventListener('resize', () => slideLine($('.header__link.is-current')));

  /* Burger */
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* Smooth anchors everywhere */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      nav.classList.remove('is-open');
    });
  });
}

/* ──────────────────────────────────── PROGRESS BAR ─── */
function initProgressBar() {
  const bar = $('#progressBar');
  if (!bar) return;
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }, { passive: true });
}

/* ──────────────────────────────────── HERO ENTRY ─── */
function initHeroEntry() {
  /* Stagger v-fade elements in hero */
  $$('.v-fade').forEach((el) => {
    const delay = Number(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('is-in'), 150 + delay);
  });
  /* Line-clip titles */
  $$('.line-text').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-in'), 260 + i * 150);
  });
}

/* ──────────────────────────────────── SPLIT TEXT ─── */
function initSplitText() {
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split('').map((ch) =>
      `<span class="char-wrap" aria-hidden="true"><span>${ch === ' ' ? '\u00A0' : ch}</span></span>`
    ).join('');

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      $$('.char-wrap', el).forEach((w, i) => {
        setTimeout(() => w.classList.add('is-in'), i * 25);
      });
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
  });
}

/* ──────────────────────────────────── REVEAL ─── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const delay = Number(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('is-in'), delay);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });

  $$('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return; // hero handled separately
    io.observe(el);
  });
}

/* ──────────────────────────────────── 3D TILT ─── */
function initTilt3D() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty('--rx', `${-y * 9}deg`);
      el.style.setProperty('--ry', `${x * 9}deg`);
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/* ──────────────────────────────────── MAGNETIC ─── */
function initMagnetic() {
  if (matchMedia('(pointer: coarse)').matches) return;
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${(e.clientX - r.left - r.width  / 2) * 0.13}px`);
      btn.style.setProperty('--my', `${(e.clientY - r.top  - r.height / 2) * 0.13}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

/* ──────────────────────────────────── PARALLAX ─── */
function initParallax() {
  const a = $('.hero__orb--a');
  const b = $('.hero__orb--b');
  if (!a && !b) return;

  addEventListener('scroll', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const y = scrollY;
    if (a) a.style.transform = `translate(0, ${y * 0.1}px)`;
    if (b) b.style.transform = `translate(0, ${y * 0.06}px)`;
  }, { passive: true });
}

/* ──────────────────────────────────── HERO CARD 3D + SHINE ─── */
function initHeroCard() {
  const card  = $('.float-card');
  const shine = card?.querySelector('.float-card__shine');
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    const x = (e.clientX - r.left - r.width  / 2) / r.width;
    const y = (e.clientY - r.top  - r.height / 2) / r.height;
    card.style.setProperty('--rx', `${-y * 16}deg`);
    card.style.setProperty('--ry', `${x * 16}deg`);
    if (shine) {
      shine.style.setProperty('--sx', `${(x + 0.5) * 100}%`);
      shine.style.setProperty('--sy', `${(y + 0.5) * 100}%`);
    }
  });
}

/* ──────────────────────────────────── CANVAS PARTICLES ─── */
function initCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let pts = [], rafId;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const n = Math.min(80, Math.floor(canvas.width / 18));
    pts = Array.from({ length: n }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.35 + 0.07,
      vx: (Math.random() - 0.5) * 0.18,
      a:  Math.random() * 0.45 + 0.06,
      blue: Math.random() > 0.65,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.blue
        ? `rgba(40, 100, 220, ${p.a})`
        : `rgba(200, 100, 40, ${p.a})`;
      ctx.fill();
      p.y -= p.vy; p.x += p.vx;
      if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
    });
    rafId = requestAnimationFrame(draw);
  };

  resize();
  draw();
  addEventListener('resize', resize);
  return () => cancelAnimationFrame(rafId);
}

/* ──────────────────────────────────── COUNTERS ─── */
function initCounters() {
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      animNum(el, 0, target, 1500);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

function animNum(el, from, to, ms) {
  if (!el) return;
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / ms, 1);
    const v = Math.floor(from + (to - from) * (1 - (1 - p) ** 3));
    el.textContent = v;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = to;
  };
  requestAnimationFrame(step);
}

/* ──────────────────────────────────── GAME ─── */
function initGame() {
  const picked = new Set();
  const drop   = $('#kitDrop');
  const pct    = $('#kitPct');

  const ITEMS = {
    caderno: '📓 Caderno', alimento: '🥫 Alimento', livro: '📚 Livro',
    roupa:   '👕 Roupa',   brinquedo:'🧸 Brinquedo', higiene: '🧴 Higiene',
    arte:    '🎨 Arte',    carinho:  '💛 Acolhimento',
  };

  const render = () => {
    const n = picked.size;
    if (pct) pct.textContent = `${Math.min(100, Math.round(n / GOAL * 100))}%`;
    if (!drop) return;
    drop.innerHTML = '';
    if (n === 0) {
      drop.innerHTML = '<span class="kit-drop__empty">Seu kit aparece aqui</span>';
      return;
    }
    [...picked].forEach((k) => {
      const chip = document.createElement('span');
      chip.className = 'kit-chip';
      chip.textContent = ITEMS[k];
      drop.appendChild(chip);
    });
    if (n >= GOAL) {
      const win = document.createElement('p');
      win.className = 'kit-win';
      win.textContent = '🎉 Kit completo! Você está pronto para a visita!';
      drop.appendChild(win);
    }
  };

  $$('#kitItems button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.item;
      picked.has(k) ? (picked.delete(k), btn.classList.remove('is-on'))
                    : (picked.add(k),    btn.classList.add('is-on'));
      render();
    });
  });

  $('#kitReset')?.addEventListener('click', () => {
    picked.clear();
    $$('#kitItems button').forEach((b) => b.classList.remove('is-on'));
    render();
  });
}

/* ──────────────────────────────────── API ─── */
async function apiUp() {
  try { return (await fetch(API.health)).ok; } catch { return false; }
}

async function loadCounter() {
  let n = 0;

  if (await apiUp()) {
    try { n = (await (await fetch(API.stats)).json()).contador ?? 0; } catch { /* */ }
  }
  if (!n) {
    n = Number(localStorage.getItem('conexaoSolidaria_contador') || 0);
    if (localStorage.getItem(LS.reg)) n = Math.max(n, 1);
  }

  $$('#heroCount, #liveCount').forEach((el) => animNum(el, 0, n, 1200));

  /* Restore previous registration */
  const saved = localStorage.getItem(LS.reg);
  if (saved) {
    try { showSuccess(JSON.parse(saved), false); } catch { /* */ }
  }
}

/* ──────────────────────────────────── FORM ─── */
function initForm() {
  const form = $('#signupForm');
  if (!form) return;

  const fields = {
    nome:   $('#fNome'),
    idade:  $('#fIdade'),
    email:  $('#fEmail'),
    motivo: $('#fMotivo'),
  };

  /* Live validation on blur / fix-on-type */
  Object.entries(fields).forEach(([key, inp]) => {
    inp?.addEventListener('blur',  () => validate(key, inp));
    inp?.addEventListener('input', () => { if (inp.classList.contains('is-bad')) validate(key, inp); });
  });

  /* Ripple on primary button click */
  form.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn--primary');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.left   = `${e.clientX - r.left}px`;
    rip.style.top    = `${e.clientY - r.top}px`;
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 600);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const allOk = Object.entries(fields).every(([k, inp]) => validate(k, inp));
    if (!allOk) { setStatus('Revise os campos destacados.', false); return; }

    const payload = {
      nome:   fields.nome.value.trim(),
      idade:  Number(fields.idade.value),
      email:  fields.email.value.trim().toLowerCase(),
      motivo: fields.motivo.value.trim(),
    };

    const btn     = $('#submitBtn');
    const btnText = $('#submitText');
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Enviando…';
    setStatus('', true);

    try {
      if (await apiUp()) {
        const res  = await fetch(API.register, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) { openDupModal(); return; }
        if (!res.ok) throw new Error(data.error || 'Erro ao enviar.');
        localStorage.setItem(LS.reg, JSON.stringify(payload));
        $$('#heroCount, #liveCount').forEach((el) => animNum(el, 0, data.contador, 600));
        setStatus(data.message || 'Inscrição confirmada!', true);
        showSuccess(payload);
      } else {
        if (localStorage.getItem(LS.reg)) { openDupModal(); return; }
        localStorage.setItem(LS.reg, JSON.stringify(payload));
        const c = Number(localStorage.getItem('conexaoSolidaria_contador') || 0) + 1;
        localStorage.setItem('conexaoSolidaria_contador', String(c));
        $$('#heroCount, #liveCount').forEach((el) => animNum(el, 0, c, 600));
        setStatus('Inscrição salva localmente (use npm start para API completa).', true);
        showSuccess(payload);
      }
    } catch (err) {
      setStatus(err.message || 'Falha ao enviar. Tente novamente.', false);
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'Confirmar inscrição';
    }
  });

  /* Dup modal */
  $('#dupClose')?.addEventListener('click',  () => $('#dupModal')?.close());
  $('#dupOk')   ?.addEventListener('click',  () => $('#dupModal')?.close());
  $('#dupModal') ?.addEventListener('click', (e) => { if (e.target === $('#dupModal')) $('#dupModal')?.close(); });
}

function validate(key, inp) {
  if (!inp) return false;
  const v   = inp.value.trim();
  const err = $(`#err${key.charAt(0).toUpperCase() + key.slice(1)}`);
  let   msg = '';

  switch (key) {
    case 'nome':
      if (v.length < 3) msg = 'Nome obrigatório (mín. 3 caracteres).';
      break;
    case 'idade': {
      const n = Number(v);
      if (!v || isNaN(n))    msg = 'Informe a idade.';
      else if (n < 14)       msg = 'Mínimo 14 anos para participar.';
      else if (n > 120)      msg = 'Idade inválida.';
      break;
    }
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'E-mail inválido.';
      break;
    case 'motivo':
      if (v.length < 20) msg = 'Conte um pouco mais (mín. 20 caracteres).';
      break;
  }

  inp.classList.toggle('is-bad', !!msg);
  inp.classList.toggle('is-ok',  !msg && v.length > 0);
  if (err) err.textContent = msg;
  return !msg;
}

function setStatus(text, ok) {
  const el = $('#formStatus');
  if (!el) return;
  el.textContent = text;
  el.className   = `form-status${ok && text ? ' ok' : ''}`;
}

function showSuccess(data, scroll = true) {
  const pane = $('#successPane');
  const form = $('#signupForm');
  const game = $('#kitGame');

  form?.classList.add('is-gone');
  game?.classList.add('is-gone');
  pane?.classList.remove('is-gone');

  const name = data.nome?.split(' ')[0] || 'Voluntário(a)';
  const msg  = $('#successMsg');
  if (msg) msg.textContent = `Obrigado, ${name}! Sua inscrição foi registrada. Nos vemos na próxima visita! 💛`;

  if (scroll) pane?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function openDupModal() {
  const m = $('#dupModal');
  if (m?.showModal) m.showModal();
  else m?.setAttribute('open', '');
}

/* ──────────────────────────────────── DEV PHOTO ─── */
function initDevPhoto() {
  const av = $('#devAvatar');
  if (!av) return;
  const img = new Image();
  img.src = 'assets/dev-ana.jpg';
  img.alt = 'Ana Flávia';
  img.onload = () => { av.textContent = ''; av.appendChild(img); };
}
