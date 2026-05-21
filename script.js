/**
 * Conexão Solidária — Premium 3D/4D Experience
 * Spring cursor · Split text · 3D tilt · Parallax · Canvas particles
 */

const API = { stats: '/api/stats', health: '/api/health', inscricao: '/api/inscricao' };
const LS  = { reg: 'cs_v4_reg', theme: 'cs_v4_theme' };
const MIN_AGE = 14;
const GAME_GOAL = 6;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const body = document.body;

/* ─── INIT ─── */
function init() {
  $('#yr').textContent = new Date().getFullYear();
  initTheme();
  initCursor();
  initNav();
  initScrollProgress();
  initReveal();
  initSplitText();
  initHeroTitle();
  initTilt();
  initMagnetic();
  initParallaxOrbs();
  initHeroCard();
  initHeroCanvas();
  initCounters();
  initGame();
  initForm();
  initDevPhoto();
  initRipple();
  syncCounter();
}

document.addEventListener('DOMContentLoaded', init);

/* ─── THEME ─── */
function initTheme() {
  const saved = localStorage.getItem(LS.theme) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved, false);
  $('#themeToggle')?.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    localStorage.setItem(LS.theme, next);
  });
}

function applyTheme(theme, anim) {
  const go = () => {
    html.dataset.theme = theme;
    $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#060810' : '#f6f7fb');
  };

  if (!anim || matchMedia('(prefers-reduced-motion: reduce)').matches) { go(); return; }

  if (typeof document.startViewTransition === 'function') {
    const flash = $('#flash');
    if (flash) { flash.classList.add('is-on'); setTimeout(() => flash.classList.remove('is-on'), 400); }
    document.startViewTransition(() => go());
  } else {
    const flash = $('#flash');
    if (flash) {
      flash.classList.add('is-on');
      setTimeout(() => { go(); setTimeout(() => flash.classList.remove('is-on'), 300); }, 180);
    } else go();
  }
}

/* ─── SPRING CURSOR ─── */
function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) {
    $('#cursor')?.remove();
    return;
  }
  const cursor = $('#cursor');
  const dot = cursor?.querySelector('.cursor__dot');
  const ring = cursor?.querySelector('.cursor__ring');
  if (!cursor || !dot || !ring) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const ease = 0.1;
  (function loop() {
    rx += (mx - rx) * ease;
    ry += (my - ry) * ease;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mousedown', () => {
    dot.style.width = dot.style.height = '12px';
    ring.style.width = ring.style.height = '28px';
  });
  document.addEventListener('mouseup', () => {
    dot.style.width = dot.style.height = '';
    ring.style.width = ring.style.height = '';
  });
  document.addEventListener('mouseleave', () => { mx = my = -300; rx = ry = -300; });
}

/* ─── NAV ─── */
function initNav() {
  const nav = $('#nav');
  const burger = $('#navBurger');
  const links = $('#navLinks');
  const underline = $('#navUnderline');
  const navLinkEls = $$('.nav__link', links);

  // Scroll spy + sticky
  const sectionIds = ['contexto','desafio','solucao','impacto','suporte','participe'];
  const onScroll = () => {
    nav?.classList.toggle('is-scrolled', scrollY > 30);
    const pos = scrollY + 100;
    let current = sectionIds[0];
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el && el.offsetTop <= pos) current = id; });
    navLinkEls.forEach((l) => { l.classList.toggle('is-active', l.getAttribute('href') === `#${current}`); });
    updateUnderline($('.nav__link.is-active', links));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Underline
  function updateUnderline(el) {
    if (!underline || !links || !el) { if (underline) underline.style.opacity = '0'; return; }
    const pr = links.getBoundingClientRect();
    const lr = el.getBoundingClientRect();
    underline.style.opacity = '1';
    underline.style.width = `${lr.width}px`;
    underline.style.transform = `translateX(${lr.left - pr.left}px)`;
  }

  navLinkEls.forEach((l) => {
    l.addEventListener('mouseenter', () => updateUnderline(l));
    l.addEventListener('click', (e) => {
      const id = l.getAttribute('href');
      if (!id?.startsWith('#')) return;
      e.preventDefault();
      document.getElementById(id.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      links.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    });
  });
  links?.addEventListener('mouseleave', () => updateUnderline($('.nav__link.is-active', links)));

  // Burger
  burger?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  // Smooth all anchor links
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  addEventListener('resize', () => updateUnderline($('.nav__link.is-active', links)));
}

/* ─── SCROLL PROGRESS ─── */
function initScrollProgress() {
  const bar = $('#scrollBar');
  if (!bar) return;
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }, { passive: true });
}

/* ─── SCROLL REVEAL ─── */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const d = Number(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('is-revealed'), d);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  $$('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return; // hero animated separately
    io.observe(el);
  });
}

/* ─── HERO ENTRY ANIMATION ─── */
function initHeroTitle() {
  $$('[data-reveal]', $('.hero')).forEach((el) => {
    const d = Number(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('is-revealed'), 200 + d);
  });
  // Line masks
  $$('.t-inner').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-revealed'), 250 + i * 140);
  });
}

/* ─── SPLIT TEXT (data-split headings) ─── */
function initSplitText() {
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = ch === ' ' ? '\u00A0' : ch;
      span.appendChild(inner);
      span.style.setProperty('--ch-delay', `${i * 28}ms`);
      el.appendChild(span);
    });

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      $$('.char', el).forEach((ch) => {
        setTimeout(() => ch.classList.add('is-revealed'), parseInt(ch.style.getPropertyValue('--ch-delay')));
      });
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
  });
}

/* ─── 3D TILT ─── */
function initTilt() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tilt-x', `${-y * 10}deg`);
      el.style.setProperty('--tilt-y', `${x * 10}deg`);
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    });
  });
}

/* ─── MAGNETIC BUTTONS ─── */
function initMagnetic() {
  if (matchMedia('(pointer: coarse)').matches) return;
  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.15;
      const y = (e.clientY - r.top - r.height / 2) * 0.15;
      btn.style.setProperty('--mx', `${x}px`);
      btn.style.setProperty('--my', `${y}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

/* ─── PARALLAX ORBS ─── */
function initParallaxOrbs() {
  const orbs = $$('.hero__orb');
  const scene = $('#heroScene');
  if (!scene || orbs.length === 0) return;

  addEventListener('scroll', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const y = scrollY;
    orbs[0]?.style.setProperty('transform', `translate(0, ${y * 0.12}px)`);
    orbs[1]?.style.setProperty('transform', `translate(0, ${y * 0.06}px)`);
    orbs[2]?.style.setProperty('transform', `translate(0, ${y * 0.18}px)`);
  }, { passive: true });

  // Mouse parallax
  if (!matchMedia('(pointer: coarse)').matches) {
    addEventListener('mousemove', (e) => {
      const cx = (e.clientX / innerWidth - 0.5);
      const cy = (e.clientY / innerHeight - 0.5);
      orbs[0]?.style.setProperty('margin-left', `${cx * 24}px`);
      orbs[1]?.style.setProperty('margin-right', `${-cx * 18}px`);
    });
  }
}

/* ─── HERO CARD 3D ─── */
function initHeroCard() {
  const card = $('#heroCard');
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    card.style.setProperty('--tilt-x', `${-y * 18}deg`);
    card.style.setProperty('--tilt-y', `${x * 18}deg`);
    card.style.setProperty('--shine-x', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--shine-y', `${(y + 0.5) * 100}%`);
  });
}

/* ─── CANVAS PARTICLES ─── */
function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let pts = [];
  let raf;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const n = Math.min(90, Math.floor(canvas.width / 15));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.4,
      vy: Math.random() * 0.4 + 0.08,
      vx: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.55 + 0.05,
      c: Math.random() > 0.7 ? '#c56b30' : '#4888ff',
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c.replace(')', `,${p.a})`).replace('rgb', 'rgba').replace('#4888ff', `rgba(72,136,255,${p.a})`).replace('#c56b30', `rgba(197,107,48,${p.a})`);
      ctx.fill();
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
    });
    raf = requestAnimationFrame(draw);
  };

  resize();
  draw();
  addEventListener('resize', resize);
  return () => cancelAnimationFrame(raf);
}

/* ─── COUNTERS ─── */
function initCounters() {
  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const t0 = performance.now();
      const dur = 1600;
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

/* ─── RIPPLE EFFECT ─── */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

/* ─── GAME ─── */
function initGame() {
  const picked = new Set();
  const labels = {
    caderno: '📓 Caderno',
    alimento: '🥫 Alimento',
    livro: '📚 Livro',
    roupa: '👕 Roupa',
    brinquedo: '🧸 Brinquedo',
    higiene: '🧴 Higiene',
    arte: '🎨 Arte',
    carinho: '💛 Acolhimento',
  };
  const drop = $('#gameDrop');
  const pct  = $('#gamePct');

  const render = () => {
    const n = picked.size;
    const score = Math.min(100, Math.round((n / GAME_GOAL) * 100));
    if (pct) pct.textContent = `${score}%`;
    if (!drop) return;
    drop.innerHTML = '';
    if (n === 0) { drop.innerHTML = '<span>Seu kit aparece aqui</span>'; return; }
    [...picked].forEach((k) => {
      const chip = document.createElement('span');
      chip.className = 'game-chip';
      chip.textContent = labels[k];
      drop.appendChild(chip);
    });
    if (n >= GAME_GOAL) {
      const win = document.createElement('p');
      win.className = 'game-win';
      win.textContent = '🎉 Kit completo! Você está pronto para a visita!';
      drop.appendChild(win);
    }
  };

  $$('#gameItems button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.g;
      if (picked.has(k)) { picked.delete(k); btn.classList.remove('is-on'); }
      else { picked.add(k); btn.classList.add('is-on'); }
      render();
    });
  });

  $('#gameReset')?.addEventListener('click', () => {
    picked.clear();
    $$('#gameItems button').forEach((b) => b.classList.remove('is-on'));
    render();
  });
}

/* ─── API ─── */
async function apiAvailable() {
  try { return (await fetch(API.health)).ok; } catch { return false; }
}

async function syncCounter() {
  let n = 0;
  if (await apiAvailable()) {
    try { n = (await (await fetch(API.stats)).json()).contador ?? 0; } catch {}
  }
  if (!n) {
    n = Number(localStorage.getItem('conexaoSolidaria_contador') || 0);
    if (localStorage.getItem(LS.reg)) n = Math.max(n, 1);
  }
  $$('#heroCounter, #liveCount').forEach((el) => {
    if (el) animateNum(el, 0, n, 1200);
  });

  const saved = localStorage.getItem(LS.reg);
  if (saved) {
    try { showSuccess(JSON.parse(saved), false); } catch {}
  }
}

function animateNum(el, from, to, ms) {
  if (!el) return;
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / ms, 1);
    el.textContent = Math.floor(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = to;
  };
  requestAnimationFrame(step);
}

/* ─── FORM ─── */
function initForm() {
  const form = $('#regForm');
  if (!form) return;

  const f = {
    nome:  $('#fNome'),
    idade: $('#fIdade'),
    email: $('#fEmail'),
    motivo:$('#fMotivo'),
  };

  Object.entries(f).forEach(([k, inp]) => {
    inp?.addEventListener('blur',  () => validateField(k, inp));
    inp?.addEventListener('input', () => { if (inp.classList.contains('is-bad')) validateField(k, inp); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = Object.entries(f).every(([k, inp]) => validateField(k, inp));
    if (!ok) { setMsg('Revise os campos destacados.', false); return; }

    const payload = {
      nome:   f.nome.value.trim(),
      idade:  Number(f.idade.value),
      email:  f.email.value.trim().toLowerCase(),
      motivo: f.motivo.value.trim(),
    };

    const btn = $('#fSubmit');
    const btnText = $('#fBtnText');
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Enviando…';
    setMsg('', true);

    try {
      if (await apiAvailable()) {
        const res = await fetch(API.inscricao, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.status === 409) { openDupModal(); return; }
        if (!res.ok) throw new Error(data.error || 'Erro ao inscrever.');
        localStorage.setItem(LS.reg, JSON.stringify(payload));
        setMsg(data.message || 'Inscrição confirmada!', true);
        animateNum($('#heroCounter'), 0, data.contador, 800);
        animateNum($('#liveCount'), 0, data.contador, 800);
        showSuccess(payload);
      } else {
        if (localStorage.getItem(LS.reg)) { openDupModal(); return; }
        localStorage.setItem(LS.reg, JSON.stringify(payload));
        const c = Number(localStorage.getItem('conexaoSolidaria_contador') || 0) + 1;
        localStorage.setItem('conexaoSolidaria_contador', String(c));
        animateNum($('#heroCounter'), 0, c, 800);
        animateNum($('#liveCount'), 0, c, 800);
        setMsg('Salvo localmente. Use npm start para API completa.', true);
        showSuccess(payload);
      }
    } catch (err) {
      setMsg(err.message || 'Falha ao enviar.', false);
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'Confirmar inscrição';
    }
  });

  // Dup modal
  $('#dupClose')?.addEventListener('click', () => $('#dupModal')?.close());
  $('#dupOk')?.addEventListener('click',    () => $('#dupModal')?.close());
  $('#dupModal')?.addEventListener('click', (e) => { if (e.target === $('#dupModal')) $('#dupModal')?.close(); });
}

function validateField(key, inp) {
  if (!inp) return false;
  const v = inp.value.trim();
  const err = $(`#e${key.charAt(0).toUpperCase() + key.slice(1)}`);
  let msg = '';

  switch (key) {
    case 'nome':   if (v.length < 3) msg = 'Nome obrigatório.'; break;
    case 'idade': {
      const n = Number(v);
      if (!v || isNaN(n)) msg = 'Informe a idade.';
      else if (n < MIN_AGE) msg = `Mínimo ${MIN_AGE} anos.`;
      else if (n > 120) msg = 'Idade inválida.';
      break;
    }
    case 'email':  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'E-mail inválido.'; break;
    case 'motivo': if (v.length < 20) msg = 'Mínimo 20 caracteres.'; break;
  }

  inp.classList.toggle('is-bad', !!msg);
  inp.classList.toggle('is-ok', !msg && v.length > 0);
  if (err) err.textContent = msg;
  return !msg;
}

function setMsg(text, ok) {
  const el = $('#fMsg');
  if (!el) return;
  el.textContent = text;
  el.className = `form-msg${ok && text ? ' is-ok' : ''}`;
}

function showSuccess(data, scroll = true) {
  const panel = $('#successPanel');
  const form  = $('#regForm');
  const game  = $('#gameBox');
  panel?.classList.remove('is-hidden');
  form?.classList.add('is-hidden');
  game?.classList.add('is-hidden');
  const name = data.nome?.split(' ')[0] || 'Voluntário(a)';
  const el = $('#successText');
  if (el) el.textContent = `Obrigado, ${name}! Sua inscrição foi registrada com sucesso. Nos vemos na próxima visita! 💛`;
  if (scroll) panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function openDupModal() {
  const m = $('#dupModal');
  if (m?.showModal) m.showModal();
  else m?.setAttribute('open', '');
}

/* ─── DEV PHOTO ─── */
function initDevPhoto() {
  const av = $('#devAvatar');
  if (!av) return;
  const img = new Image();
  img.src = 'assets/dev-ana.jpg';
  img.alt = 'Ana Flávia';
  img.onload = () => { av.textContent = ''; av.appendChild(img); };
}
