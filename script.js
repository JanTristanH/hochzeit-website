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
function setHeaderVar() {
  if (!header) return;
  const h = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
}
setHeaderVar();
window.addEventListener('load', setHeaderVar);   // ensure after fonts/layout
window.addEventListener('resize', setHeaderVar); // keep CSS var fresh

/* ===========================
   Dresscode Color Picker
   =========================== */
const dresscodeSwatches = document.querySelectorAll('.dresscode-swatches .swatch');
const dresscodeSelectedColor = document.getElementById('dresscode-selected-color');

if (dresscodeSwatches.length > 0 && dresscodeSelectedColor) {
  const defaultCream = getComputedStyle(document.documentElement).getPropertyValue('--dresscode-1').trim() || '#F9F9F2';

  function clearDresscodeSelection() {
    dresscodeSwatches.forEach((swatch) => {
      swatch.classList.remove('is-selected');
      swatch.setAttribute('aria-pressed', 'false');
    });

    document.documentElement.style.setProperty('--cream', defaultCream);
    dresscodeSelectedColor.textContent = '';
    dresscodeSelectedColor.hidden = true;
  }

  function applyDresscodeSelection(activeSwatch) {
    const color = activeSwatch.dataset.color;
    const colorName = activeSwatch.dataset.colorName;

    if (!color || !colorName) return;

    dresscodeSwatches.forEach((swatch) => {
      const isActive = swatch === activeSwatch;
      swatch.classList.toggle('is-selected', isActive);
      swatch.setAttribute('aria-pressed', String(isActive));
    });

    document.documentElement.style.setProperty('--cream', color);
    dresscodeSelectedColor.textContent = `Ausgewählte Farbe: ${colorName}`;
    dresscodeSelectedColor.hidden = false;
  }

  clearDresscodeSelection();

  dresscodeSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const isActive = swatch.getAttribute('aria-pressed') === 'true';
      if (isActive) {
        clearDresscodeSelection();
        return;
      }

      applyDresscodeSelection(swatch);
    });
  });
}

/* ===========================
   Smooth in-page scrolling
   (offset by sticky header)
   =========================== */
/* ===========================
   Smooth in-page scrolling + proper hash updates
   (works with sticky header, deep links, back/forward)
   =========================== */
function getHeaderH() {
  return header ? header.getBoundingClientRect().height : 0;
}

function scrollToTargetId(id, addToHistory = true) {
  const el = document.querySelector(id);
  if (!el) return;

  // Update URL first (no jump because we prevent default)
  if (addToHistory) {
    history.pushState(null, "", id); // adds to history without triggering hashchange
  }

  const y = el.getBoundingClientRect().top + window.scrollY - getHeaderH() - 12;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function scrollToHash(addToHistory = false) {
  const hash = window.location.hash;
  if (!hash) return;
  // Don’t re-add the same hash to history
  scrollToTargetId(hash, addToHistory);
}

// Click handler for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    if (!document.querySelector(id)) return;

    e.preventDefault();
    scrollToTargetId(id, true);
  });
});

// Handle initial load with hash (after layout settles)
window.addEventListener('load', () => {
  if (location.hash) {
    // Allow header var/fonts to settle first
    requestAnimationFrame(() => scrollToHash(false));
  }
});

// Handle user changing hash manually (or links without our handler)
window.addEventListener('hashchange', () => {
  // hashchange fires only when location.hash is set directly
  scrollToHash(false);
});

// Handle back/forward navigation when we used pushState
window.addEventListener('popstate', () => {
  scrollToHash(false);
});


/* ===========================
   Scroll direction flag
   (for optional styling)
   =========================== */
let lastY = window.scrollY;
let dirTick = false;
function onScrollDir() {
  const y = window.scrollY;
  const up = y < lastY;
  document.body.classList.toggle('scrolling-up', up);
  lastY = y;
  dirTick = false;
}
window.addEventListener('scroll', () => {
  if (!dirTick) {
    window.requestAnimationFrame(onScrollDir);
    dirTick = true;
  }
}, { passive: true });

/* ===========================
   Hero: Linear Blur + Parallax
   (robust on mobile, starts on first pixel)
   =========================== */
const hero = document.querySelector('.hero');

if (hero) {
  let heroTick = false;

  // Baseline scroll position at load; progress uses distance scrolled from here.
  let startY = Math.max(window.scrollY, 0);

  function updateHeroEffects() {
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
    if (!heroTick) {
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
if (cd && cd.dataset.target) {
  const target = new Date(cd.dataset.target).getTime();
  const MIN = 60 * 1000;
  const HR = 60 * MIN;
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

/* ===========================
   OneSignal Subscribe Button
   =========================== */
const pushSubscribeBtn = document.getElementById('onesignal-subscribe-btn');
const pushUnsubscribeBtn = document.getElementById('onesignal-unsubscribe-btn');
const pushSubscribeStatus = document.getElementById('onesignal-subscribe-status');

if (pushSubscribeBtn && pushUnsubscribeBtn && pushSubscribeStatus) {
  const BUTTON_TEXT_DEFAULT = '🔔 Benachrichtigungen aktivieren';
  const BUTTON_TEXT_LOADING = 'Aktiviere Benachrichtigungen...';
  const BUTTON_TEXT_DONE = 'Benachrichtigungen aktiviert';
  const BUTTON_UNSUBSCRIBE_DEFAULT = '🔕 Benachrichtigungen deaktivieren';

  let isRequestPending = false;

  function shouldShowPushUnsubscribe(label) {
    return label === BUTTON_TEXT_DONE;
  }

  function setPushStatus(message, state = '') {
    pushSubscribeStatus.textContent = message;
    if (state) {
      pushSubscribeStatus.dataset.state = state;
    } else {
      delete pushSubscribeStatus.dataset.state;
    }
  }

  function setPushButtonState({ label = BUTTON_TEXT_DEFAULT, disabled = false }) {
    pushSubscribeBtn.textContent = label;
    pushSubscribeBtn.disabled = disabled;
    pushSubscribeBtn.setAttribute('aria-disabled', String(disabled));

    const isUnsubscribeVisible = shouldShowPushUnsubscribe(label);
    setPushSubscribeVisibility(!isUnsubscribeVisible);
    setPushUnsubscribeVisibility(isUnsubscribeVisible);
    setPushUnsubscribeButtonState({ label: BUTTON_UNSUBSCRIBE_DEFAULT, disabled: true });
  }

  function setPushUnsubscribeButtonState({ label = BUTTON_UNSUBSCRIBE_DEFAULT, disabled = true }) {
    pushUnsubscribeBtn.textContent = label;
    pushUnsubscribeBtn.disabled = disabled;
    pushUnsubscribeBtn.setAttribute('aria-disabled', String(disabled));
  }

  function setPushUnsubscribeVisibility(isVisible) {
    pushUnsubscribeBtn.hidden = !isVisible;
    pushUnsubscribeBtn.setAttribute('aria-hidden', String(!isVisible));
  }

  function setPushSubscribeVisibility(isVisible) {
    pushSubscribeBtn.hidden = !isVisible;
    pushSubscribeBtn.setAttribute('aria-hidden', String(!isVisible));
  }

  function setPushUnavailableState(message) {
    setPushButtonState({ label: BUTTON_TEXT_DEFAULT, disabled: true });
    setPushStatus(message, 'error');
  }

  function buildPushUiSync(OneSignal) {
    return function syncPushUi() {
      const permission = Notification.permission;
      const isOptedIn = Boolean(OneSignal?.User?.PushSubscription?.optedIn);

      if (isOptedIn) {
        setPushButtonState({ label: BUTTON_TEXT_DONE, disabled: true });
        setPushUnsubscribeButtonState({ label: BUTTON_UNSUBSCRIBE_DEFAULT, disabled: false });
        setPushStatus('Benachrichtigungen sind bereits aktiviert.', 'success');
        return;
      }

      setPushButtonState({ label: BUTTON_TEXT_DEFAULT, disabled: false });

      if (permission === 'denied') {
        setPushStatus('Benachrichtigungen sind im Browser blockiert.', 'error');
        return;
      }

      setPushStatus('Tippe auf den Button, um Hochzeits-Updates zu erhalten.', 'info');
    };
  }

  async function initPushSubscribeController(OneSignal) {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushUnavailableState('Benachrichtigungen werden von diesem Browser nicht unterstützt.');
      return;
    }

    const requestPermission = OneSignal?.Notifications?.requestPermission;
    const pushSubscription = OneSignal?.User?.PushSubscription;
    const optIn = pushSubscription?.optIn;
    const optOut = pushSubscription?.optOut;

    if (typeof requestPermission !== 'function' || !pushSubscription) {
      setPushUnavailableState('Benachrichtigungen sind aktuell nicht verfügbar.');
      return;
    }

    const syncPushUi = buildPushUiSync(OneSignal);
    syncPushUi();

    if (typeof pushSubscription.addEventListener === 'function') {
      pushSubscription.addEventListener('change', syncPushUi);
    }

    pushSubscribeBtn.addEventListener('click', async () => {
      if (isRequestPending) return;
      isRequestPending = true;

      setPushButtonState({ label: BUTTON_TEXT_LOADING, disabled: true });
      setPushStatus('', '');

      try {
        if (typeof optIn === 'function') {
          await optIn.call(pushSubscription);
        } else {
          await requestPermission.call(OneSignal.Notifications);
        }
        syncPushUi();
      } catch (error) {
        setPushButtonState({ label: BUTTON_TEXT_DEFAULT, disabled: false });
        setPushUnsubscribeButtonState({ label: BUTTON_UNSUBSCRIBE_DEFAULT, disabled: true });
        setPushStatus('Aktivierung fehlgeschlagen. Bitte versuche es erneut.', 'error');
        console.error('OneSignal subscribe failed:', error);
      } finally {
        isRequestPending = false;
      }
    });

    pushUnsubscribeBtn.addEventListener('click', async () => {
      if (isRequestPending || typeof optOut !== 'function') return;
      isRequestPending = true;

      setPushButtonState({ label: BUTTON_TEXT_DEFAULT, disabled: true });
      setPushStatus('', '');

      try {
        await optOut.call(pushSubscription);
        syncPushUi();
        setPushStatus('Benachrichtigungen wurden deaktiviert.', 'info');
      } catch (error) {
        syncPushUi();
        setPushStatus('Deaktivierung fehlgeschlagen. Bitte versuche es erneut.', 'error');
        console.error('OneSignal unsubscribe failed:', error);
      } finally {
        isRequestPending = false;
      }
    });
  }

  if (Array.isArray(window.OneSignalDeferred)) {
    window.OneSignalDeferred.push(initPushSubscribeController);
  } else {
    setPushUnavailableState('Benachrichtigungen sind aktuell nicht verfügbar.');
  }
}



// Intersection observers for header date reveal
const heroNums = hero.querySelectorAll('.num');
const headerDateParts = document.querySelectorAll('.date-revealed-with-maxblur');

heroNums.forEach((num, index) => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {

      headerDateParts.forEach((part, partIndex) => {
        // Index mapping rules:
        //  - Hero index 0 affects header parts 0 and 1
        //  - Hero index i >= 1 affects header part (i + 1)
        const match =
          (index === 0 && (partIndex === 0 || partIndex === 1)) ||
          (index >= 1 && partIndex === index + 1);

        if (match) {
          if (!entry.isIntersecting) {
            part.classList.add('is-visible');
          } else {
            part.classList.remove('is-visible');
          }
        }
      });

    });
  }, {
    threshold: 0.075,
    rootMargin: '-10% 0px -10% 0px'
  });

  io.observe(num);
});
