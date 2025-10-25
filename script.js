/* ===========================
   Mobile Navigation
   =========================== */
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('primary-nav');

if (toggle && nav) {
  // Toggle open/close
  toggle.addEventListener('click', () => {
    const isOpen = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close menu on in-page link click (mobile)
  nav.querySelectorAll('a[href^="#"]').forEach(a =>
    a.addEventListener('click', () => {
      nav.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // Close on outside click/tap
  document.addEventListener('click', (e) => {
    const isOpen = nav.getAttribute('data-open') === 'true';
    if (!isOpen) return;
    const clickedInsideNav = nav.contains(e.target);
    const clickedToggle = toggle.contains(e.target);
    if (!clickedInsideNav && !clickedToggle) {
      nav.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
      nav.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/* ===========================
   Header height CSS variable
   =========================== */
const header = document.querySelector('.site-header');
function setHeaderVar(){
  if (!header) return;
  const h = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
}
setHeaderVar();
window.addEventListener('load', setHeaderVar);   // ensure after fonts/layout
window.addEventListener('resize', setHeaderVar); // keep CSS var fresh

/* ===========================
   Smooth in-page scrolling
   (offset by sticky header)
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ===========================
   Scroll direction flag
   (for optional styling)
   =========================== */
let lastY = window.scrollY;
let dirTick = false;
function onScrollDir(){
  const y = window.scrollY;
  const up = y < lastY;
  document.body.classList.toggle('scrolling-up', up);
  lastY = y;
  dirTick = false;
}
window.addEventListener('scroll', () => {
  if (!dirTick){
    window.requestAnimationFrame(onScrollDir);
    dirTick = true;
  }
}, { passive: true });

/* ===========================
   Hero: Linear Blur + Parallax
   (robust on mobile, starts on first pixel)
   =========================== */
const hero = document.querySelector('.hero');

if (hero){
  let heroTick = false;

  // Baseline scroll position at load; progress uses distance scrolled from here.
  let startY = Math.max(window.scrollY, 0);

  function updateHeroEffects(){
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height;

    // Distance scrolled since load; clamp to [0, heroH] for a 0..1 progress
    const deltaY = Math.max(window.scrollY - startY, 0);
    const progress = Math.min(deltaY / heroH, 1);  // 0..1 linear

    // ---- Linear blur (no easing, starts immediately) ----
    const maxBlur = 12;
    const blurValue = progress * maxBlur;

    // ---- Parallax (linear to match blur) ----
    // Background down, foreground (hero__inner) slightly up
    const bgOffset = 0.30 * heroH * progress;   // +
    const fgOffset = -0.15 * heroH * progress;  // -

    // Reduced motion
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blurPx = prefersReduce ? 0 : blurValue;
    const bg = prefersReduce ? 0 : bgOffset;
    const fg = prefersReduce ? 0 : fgOffset;

    // Apply CSS variables
    document.documentElement.style.setProperty('--hero-blur', `${blurPx.toFixed(2)}px`);
    document.documentElement.style.setProperty('--parallax-bg', `${bg}px`);
    document.documentElement.style.setProperty('--parallax-fg', `${fg}px`);

    heroTick = false;
  }

  // IMPORTANT: do NOT reset startY on resize (mobile URL bar collapse = resize).
  // Only reset on full reload/navigation.
  window.addEventListener('pageshow', () => { startY = Math.max(window.scrollY, 0); });

  // Scroll loop (rAF throttled)
  window.addEventListener('scroll', () => {
    if (!heroTick){
      window.requestAnimationFrame(updateHeroEffects);
      heroTick = true;
    }
  }, { passive: true });

  // Initial state
  updateHeroEffects();
}

/* ===========================
   Countdown
   =========================== */
const cd = document.querySelector('.countdown');
if (cd && cd.dataset.target){
  const target = new Date(cd.dataset.target).getTime();
  const MIN = 60 * 1000;
  const HR  = 60 * MIN;
  const DAY = 24 * HR;

  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / DAY);
    const h = Math.floor((diff % DAY) / HR);
    const m = Math.floor((diff % HR) / MIN);
    const dd = cd.querySelector('.dd');
    const hh = cd.querySelector('.hh');
    const mm = cd.querySelector('.mm');
    if (dd) dd.textContent = d.toString().padStart(2, '0');
    if (hh) hh.textContent = h.toString().padStart(2, '0');
    if (mm) mm.textContent = m.toString().padStart(2, '0');
  };

  tick();
  setInterval(tick, 30 * 1000);
}
