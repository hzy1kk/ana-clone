/**
 * Conexão Solidária — Wix-grade interactions
 */

const API = { stats: '/api/stats', inscricao: '/api/inscricao' };
const LS = { reg: 'cs_v3_reg', theme: 'cs_v3_theme' };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;

async function apiOk() {
  try {
    return (await fetch('/api/health')).ok;
  } catch {
    return false;
  }
}

function init() {
  $('#yr').textContent = new Date().getFullYear();
  initTheme();
  initHeader();
  initReveal();
  initCounters();
  initGame();
  initForm();
  initDevImg();
  syncCount();
  $$('.wix-hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), 100 + i * 80));
}

document.addEventListener('DOMContentLoaded', init);

/* Theme */
function initTheme() {
  const t = localStorage.getItem(LS.theme) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(t, false);
  $('#themeBtn')?.addEventListener('click', () => {
    const n = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(n, true);
    localStorage.setItem(LS.theme, n);
  });
}

function applyTheme(theme, anim) {
  const go = () => {
    html.dataset.theme = theme;
    $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0e14' : '#ffffff');
  };
  if (!anim || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    go();
    return;
  }
  const flash = $('#themeFlash');
  flash?.classList.add('is-on');
  if (document.startViewTransition) document.startViewTransition(go);
  else go();
  setTimeout(() => flash?.classList.remove('is-on'), 400);
}

/* Header */
function initHeader() {
  const header = $('#header');
  const menu = $('#headerMenu');
  const nav = $('#headerNav');

  const onScroll = () => header?.classList.toggle('header--fixed', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menu?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    menu.classList.toggle('is-open', open);
  });

  $$('#headerNav a, .wix-btn[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href?.startsWith('#')) return;
      const el = $(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
      nav?.classList.remove('is-open');
    });
  });
}

/* Reveal */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const d = Number(e.target.dataset.d || 0) * 80;
        setTimeout(() => e.target.classList.add('is-visible'), d);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );
  $$('.reveal').forEach((el) => io.observe(el));
}

/* Counters */
function initCounters() {
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / 1400, 1);
        el.textContent = Math.floor(target * (1 - (1 - p) ** 3));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

async function syncCount() {
  let n = 0;
  if (await apiOk()) {
    try {
      n = (await (await fetch(API.stats)).json()).contador ?? 0;
    } catch { /* */ }
  }
  if (!n) n = Number(localStorage.getItem('conexaoSolidaria_contador') || 0);
  $('#liveCount').textContent = n;
  $('#heroStat').textContent = n;
  if (localStorage.getItem(LS.reg)) showOk(JSON.parse(localStorage.getItem(LS.reg)), false);
}

/* Game */
function initGame() {
  const picked = new Set();
  const labels = { arroz: '🍚', feijao: '🫘', livro: '📚', fruta: '🍎', brinquedo: '🧸', carinho: '💛' };
  const box = $('#gameBox');
  const pct = $('#gamePct');

  const render = () => {
    const n = picked.size;
    pct.textContent = `${Math.min(100, Math.round((n / 5) * 100))}%`;
    box.innerHTML = n
      ? [...picked].map((k) => `<span class="wix-game__chip">${labels[k]} ${k}</span>`).join('')
      : 'Seu kit aparece aqui';
    if (n >= 5) box.innerHTML += '<p class="wix-game__win">Kit completo! 🎉</p>';
  };

  $$('.wix-game__items button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.g;
      picked.has(k) ? picked.delete(k) : picked.add(k);
      btn.classList.toggle('is-on', picked.has(k));
      render();
    });
  });
  $('#gameReset')?.addEventListener('click', () => {
    picked.clear();
    $$('.wix-game__items button').forEach((b) => b.classList.remove('is-on'));
    render();
  });
}

/* Form */
function initForm() {
  const form = $('#wixForm');
  if (!form) return;

  const f = { nome: $('#fNome'), idade: $('#fIdade'), email: $('#fEmail'), motivo: $('#fMotivo') };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll(f)) return;

    const payload = {
      nome: f.nome.value.trim(),
      idade: Number(f.idade.value),
      email: f.email.value.trim().toLowerCase(),
      motivo: f.motivo.value.trim(),
    };

    $('#fMsg').textContent = 'Enviando...';
    try {
      if (await apiOk()) {
        const res = await fetch(API.inscricao, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) {
          $('#wixModal')?.showModal();
          $('#fMsg').textContent = data.error || '';
          return;
        }
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem(LS.reg, JSON.stringify(payload));
        $('#liveCount').textContent = data.contador;
        $('#heroStat').textContent = data.contador;
        $('#fMsg').textContent = data.message;
        showOk(payload);
      } else {
        if (localStorage.getItem(LS.reg)) {
          $('#wixModal')?.showModal();
          return;
        }
        localStorage.setItem(LS.reg, JSON.stringify(payload));
        const c = Number(localStorage.getItem('conexaoSolidaria_contador') || 0) + 1;
        localStorage.setItem('conexaoSolidaria_contador', String(c));
        $('#liveCount').textContent = c;
        $('#heroStat').textContent = c;
        $('#fMsg').textContent = 'Salvo localmente (use npm start para API).';
        showOk(payload);
      }
    } catch (err) {
      $('#fMsg').textContent = err.message || 'Erro ao enviar.';
    }
  });

  $('#wixModalClose')?.addEventListener('click', () => $('#wixModal')?.close());
}

function validateAll(f) {
  let ok = true;
  const rules = [
    ['nome', f.nome, (v) => v.length >= 3 || 'Nome obrigatório.', 'eNome'],
    ['idade', f.idade, (v) => (Number(v) >= 14 && Number(v) <= 120) || 'Idade mínima 14.', 'eIdade'],
    ['email', f.email, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido.', 'eEmail'],
    ['motivo', f.motivo, (v) => v.length >= 20 || 'Mín. 20 caracteres.', 'eMotivo'],
  ];
  rules.forEach(([, inp, rule, errId]) => {
    const msg = rule(inp.value.trim());
    if (msg !== true) {
      $(`#${errId}`).textContent = msg;
      inp.classList.add('is-bad');
      ok = false;
    } else {
      $(`#${errId}`).textContent = '';
      inp.classList.remove('is-bad');
    }
  });
  return ok;
}

function showOk(data, scroll = true) {
  $('#wixForm')?.classList.add('is-hidden');
  $('#wixGame')?.classList.add('is-hidden');
  const panel = $('#wixSuccess');
  panel?.classList.remove('is-hidden');
  $('#wixSuccessText').textContent = `Obrigado, ${data.nome.split(' ')[0]}! Nos vemos em 17/10/2026.`;
  if (scroll) panel?.scrollIntoView({ behavior: 'smooth' });
}

function initDevImg() {
  const img = new Image();
  img.src = 'assets/dev-ana.jpg';
  img.onload = () => {
    const av = $('#devAv');
    if (!av) return;
    av.textContent = '';
    av.appendChild(img);
  };
}
