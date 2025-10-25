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

/* Hero effects: blur and parallax while scrolling
   - updates CSS variables for blur and parallax transforms
   - uses requestAnimationFrame for performance
*/
const hero = document.querySelector('.hero');
if (hero){
  let heroTick = false;
  function updateHeroEffects(){
    const rect = hero.getBoundingClientRect();
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    // Blur effect (0 = at top, 1 = scrolled past)
    const blurProgress = Math.min(Math.max(0, -rect.top / rect.height), 1);
    const maxBlur = 12;
    const blur = (blurProgress * maxBlur).toFixed(2) + 'px';
    
    // Parallax effects
    // Background moves slower (0.3x) than scroll speed
    const bgOffset = Math.min(scrollY * 0.3, rect.height * 0.3);
    // Numbers move at 0.15x scroll speed (even slower than bg)
    const numsOffset = Math.min(scrollY * 0.15, rect.height * 0.15);
    
    // Apply all effects
    document.documentElement.style.setProperty('--hero-blur', blur);
    document.documentElement.style.setProperty('--parallax-bg', `${bgOffset}px`);
    document.documentElement.style.setProperty('--parallax-nums', `${-numsOffset}px`);
    
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
      threshold: 0.15, // trigger when 15% visible
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
