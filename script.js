/* Mobile-Navigation */
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('primary-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
  // Close menu on link click (mobile)
  nav.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    nav.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// Close mobile menu when tapping/clicking outside
document.addEventListener('click', (e) => {
  if (!nav || !toggle) return;

  const isOpen = nav.getAttribute('data-open') === 'true';
  const clickedInsideNav = nav.contains(e.target);
  const clickedToggle = toggle.contains(e.target);

  if (isOpen && !clickedInsideNav && !clickedToggle) {
    nav.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
  }
});


/* Header height CSS variable for offsets */
const header = document.querySelector('.site-header');
function setHeaderVar(){
  if (!header) return;
  const h = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
}
setHeaderVar();
window.addEventListener('resize', setHeaderVar);

/* Smooth scrolling with header offset (prevents sections being hidden) */
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

/* Blur background when scrolling UP */
let lastY = window.scrollY;
let ticking = false;
function onScrollDir(){
  const y = window.scrollY;
  const up = y < lastY;
  document.body.classList.toggle('scrolling-up', up);
  lastY = y;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking){
    window.requestAnimationFrame(onScrollDir);
    ticking = true;
  }
}, { passive: true });

/* Hero effects: blur and parallax while scrolling
   - updates CSS variables for blur and parallax transforms
   - uses requestAnimationFrame for performance
*/
const hero = document.querySelector('.hero');
if (hero){
  let heroTick = false;
  function updateHeroEffects(){
    const rect = hero.getBoundingClientRect();
    const heroH = rect.height;

    // 0..1 progress based on how far the hero has moved past the top
    const progress = Math.min(Math.max(0, -rect.top / heroH), 1);

    // ---- Blur: start immediately on first pixel of scroll ----
    const maxBlur = 12;           // your original cap
    const minBlurOnScroll = 1.2;  // tiny blur as soon as scroll begins

    // front-load the ramp a bit so it feels snappier at the beginning
    const eased = Math.pow(progress, 0.75); // 0.75 -> faster early ramp (1 = linear)

    // Detect "has started scrolling" (down from top)
    const hasScrolled = window.scrollY > 0 || rect.top < 0;

    // If not scrolled -> 0px; if scrolled -> start at minBlurOnScroll and ramp to max
    const blurValue = hasScrolled
      ? (minBlurOnScroll + eased * (maxBlur - minBlurOnScroll))
      : 0;

    // ---- Parallax offsets (unchanged) ----
    const bgOffset = 0.30 * heroH * progress;   // + down
    const fgOffset = -0.15 * heroH * progress;  // - up

    // Reduced motion respect
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bg = prefersReduce ? 0 : bgOffset;
    const fg = prefersReduce ? 0 : fgOffset;
    const blurPx = prefersReduce ? 0 : blurValue;

    // Apply
    document.documentElement.style.setProperty('--hero-blur', `${blurPx.toFixed(2)}px`);
    document.documentElement.style.setProperty('--parallax-bg', `${bg}px`);
    document.documentElement.style.setProperty('--parallax-fg', `${fg}px`);

    heroTick = false;
  }


  // Setup intersection observers for each number in the hero
  const heroNums = hero.querySelectorAll('.num');
  const headerDateParts = document.querySelectorAll('.date-revealed-with-maxblur');

  // Create observers for each number in the hero
  heroNums.forEach((num, index) => {
    // Each number reveals its corresponding group in the header (by data-index)
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Find all parts with matching index
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
      threshold: 0.075, // trigger when 15% visible
      rootMargin: '-10% 0px -10% 0px' // slightly tighter observation window
    });

    io.observe(num);
  });

  window.addEventListener('scroll', () => {
    if (!heroTick){
      window.requestAnimationFrame(updateHeroEffects);
      heroTick = true;
    }
  }, { passive: true });
  // update on load/resize so initial state is correct
  window.addEventListener('resize', () => {
    updateHeroEffects();
  });
  updateHeroEffects();
}

/* Countdown */
const cd = document.querySelector('.countdown');
if (cd && cd.dataset.target){
  const target = new Date(cd.dataset.target).getTime();
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / day);
    const h = Math.floor((diff % day) / hr);
    const m = Math.floor((diff % hr) / min);
    cd.querySelector('.dd').textContent = d.toString().padStart(2, '0');
    cd.querySelector('.hh').textContent = h.toString().padStart(2, '0');
    cd.querySelector('.mm').textContent = m.toString().padStart(2, '0');
  };
  tick();
  setInterval(tick, 30 * 1000);
}
