/* Mobile-Navigation */
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('primary-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

/* Smooth Scrolling (für interne Links) */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nav.getAttribute('data-open') === 'true') {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

/* Countdown (zeigt Tage/Std/Min bis zur Trauung) */
const cd = document.querySelector('.countdown');
if (cd) {
  const targetISO = cd.getAttribute('data-target');
  const target = targetISO ? new Date(targetISO) : null;

  const tick = () => {
    if (!target) return;
    const diff = target - new Date();
    if (diff <= 0) {
      cd.textContent = 'Heute wird gefeiert!';
      return;
    }
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;

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
