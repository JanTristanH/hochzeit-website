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

/* Hero background blur while scrolling out of view
   - updates CSS variable --hero-blur on :root
   - uses a requestAnimationFrame loop on scroll for performance
*/
const hero = document.querySelector('.hero');
if (hero){
  let heroTick = false;
  function updateHeroBlur(){
    const rect = hero.getBoundingClientRect();
    // progress: 0 = hero top is at/above viewport top; 1 = hero fully scrolled past
    const progress = Math.min(Math.max(0, -rect.top / rect.height), 1);
    // max blur in px
    const maxBlur = 12;
    const blur = (progress * maxBlur).toFixed(2) + 'px';
    document.documentElement.style.setProperty('--hero-blur', blur);
    heroTick = false;
  }

  const headerDateSpan = document.querySelector('.date-revealed-with-maxblur');
  const lastNum = document.querySelector('#hero-date .num:last-child');

  if (headerDateSpan && lastNum) {
    const ioDate = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // When "26" leaves the viewport, show the header date
        if (!entry.isIntersecting) {
          headerDateSpan.classList.add('is-visible');
        } else {
          headerDateSpan.classList.remove('is-visible');
        }
      });
    }, {
      threshold: 0.05, // trigger when ~5% visible
    });

    ioDate.observe(lastNum);
  }

  window.addEventListener('scroll', () => {
    if (!heroTick){
      window.requestAnimationFrame(updateHeroBlur);
      heroTick = true;
    }
  }, { passive: true });
  // update on load/resize so initial state is correct
  window.addEventListener('resize', () => {
    updateHeroBlur();
  });
  updateHeroBlur();
}

/* Date morph: fade/scale hero date into header date when scrolling down */
const heroDate = document.getElementById('hero-date');
const headerDate = document.getElementById('header-date');
if (heroDate && headerDate){
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // When hero date leaves the top (scrolling down), show header date
      if (entry.isIntersecting){
        headerDate.classList.remove('is-visible');
      } else {
        headerDate.classList.add('is-visible');
      }
    });
  }, { rootMargin: `-${header.getBoundingClientRect().height + 8}px 0px 0px 0px`, threshold: 0 });
  io.observe(heroDate);
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
