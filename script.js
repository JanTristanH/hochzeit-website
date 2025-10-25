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
window.addEventListener('resize', setHeaderVar);

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
   Hero: Blur + Parallax
   (start on first pixel)
   =========================== */
const hero = document.querySelector('.hero');

if (hero){
  let heroTick = false;

  // Remember the hero's initial top so progress grows immediately on scroll,
  // regardless of sticky header or hero starting offset.
  let heroTopAtLoad = hero.getBoundingClientRect().top;

  function updateHeroEffects(){
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height;

    // Distance the hero moved since load (px). >0 as soon as you scroll 1px.
    const delta = heroTopAtLoad - rect.top;

    // 0..1 progress based on delta, not viewport top.
    const progress = Math.min(Math.max(delta / heroH, 0), 1);

    // ---- Blur: starts immediately with a tiny base ----
    const maxBlur = 12;
    const minBlurOnScroll = 1.2;      // small initial blur once scrolling begins
    const eased = Math.pow(progress, 0.75); // front-loaded ramp
    const hasScrolled = delta > 0;

    const blurValue = hasScrolled
      ? (minBlurOnScroll + eased * (maxBlur - minBlurOnScroll))
      : 0;

    // ---- Parallax (now also starts on first pixel) ----
    // Background moves down slowly, foreground (entire hero content) moves up slightly.
    const bgOffset = 0.30 * heroH * eased;   // +
    const fgOffset = -0.15 * heroH * eased;  // -

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

  // Recalculate starting top on layout changes (e.g., fonts, header size).
  const recalcStart = () => {
    heroTopAtLoad = hero.getBoundingClientRect().top;
    updateHeroEffects();
  };
  window.addEventListener('resize', recalcStart);
  window.addEventListener('load', recalcStart);

  // Intersection observers for header date reveal
  const heroNums = hero.querySelectorAll('.num');
  const headerDateParts = document.querySelectorAll('.date-revealed-with-maxblur');

  heroNums.forEach((num, index) => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        headerDateParts.forEach(part => {
          if (part.dataset.index === String(index)) {
            if (!entry.isIntersecting) {
              part.classList.add('is-visible');
            } else {
              part.classList.remove('is-visible');
            }
          }
        });
      });
    }, {
      threshold: 0.075,            // ~7.5% visible triggers
      rootMargin: '-10% 0px -10% 0px'
    });

    io.observe(num);
  });

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
