/* ==========================================================
   StarNex – script.js  (Frontend Only)
   ========================================================== */

/* ── Hero video: deferred load + data-saver fallback ──
   The video is kept out of the critical path: no `autoplay`/`<source>`
   at parse time (the `poster` image paints instantly instead), and the
   real source is only attached after the page has finished loading.
   On a metered/slow connection (Save-Data on, or 2G-class effective
   type), we skip the video entirely and keep the static poster —
   there's no backend involved, this is purely a client-side check via
   the Network Information API (unsupported browsers just skip the
   check and load the video normally). */
(function () {
  const video = document.querySelector('.hvs-vid');
  if (!video) return;
  const src = video.dataset.src;
  if (!src) return;

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isConstrained = !!conn && (conn.saveData || /^(slow-2g|2g)$/.test(conn.effectiveType || ''));
  if (isConstrained) return; // stay on the static poster

  function loadHeroVideo() {
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();
    video.play().catch(() => {});
  }

  if (document.readyState === 'complete') {
    loadHeroVideo();
  } else {
    window.addEventListener('load', loadHeroVideo, { once: true });
  }
})();

/* Navbar scroll effect */
const navbar = document.getElementById('navbar');

if (navbar) {
  const updateNavbarState = () => {
    const hero = document.querySelector('.hvs, #home, .hero');
    const heroHeight = hero ? hero.offsetHeight : 0;
    const triggerPoint = heroHeight ? Math.min(120, heroHeight * 0.16) : 48;
    const shouldScroll = window.scrollY > triggerPoint;

    navbar.classList.toggle('navbar-scrolled', shouldScroll);
    navbar.classList.toggle('scrolled', shouldScroll);
  };

  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });
  window.addEventListener('resize', updateNavbarState);
}

/* ── Hamburger menu ──
   Keyboard/AT support: background content is made `inert` while the
   menu is open (so Tab/screen-reader users can't reach content hidden
   behind the overlay), Escape closes it, and focus moves to the first
   link on open and back to the hamburger button on close. */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  const inertTargets = Array.from(document.body.children).filter(
    el => el !== navbar && el.tagName !== 'SCRIPT'
  );

  const setMenuOpen = (open) => {
    mobileMenu.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    if (navbar) navbar.classList.toggle('menu-open', open);

    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));

    inertTargets.forEach(el => { el.inert = open; });

    if (open) {
      const firstLink = mobileMenu.querySelector('.mobile-link');
      if (firstLink) firstLink.focus();
    }
  };

  hamburger.addEventListener('click', () => {
    setMenuOpen(!mobileMenu.classList.contains('open'));
  });

  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      setMenuOpen(false);
      hamburger.focus();
    }
  });
}


/* ── Intersection Observer – scroll animations ── */
const animated = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
);
animated.forEach(el => observer.observe(el));

/* ── Counter animation ── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  if (isNaN(target)) return;
  const duration = 1600;
  const startTime = performance.now();
  const isDecimal = String(target).includes('.');
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = eased * target;
    el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.count-up[data-target]').forEach(el => {
  el.textContent = el.dataset.prefix || '0';
  counterObserver.observe(el);
});

/* ── Staggered child reveals ── */
document.querySelectorAll('[data-stagger]').forEach(parent => {
  const children = parent.children;
  const delay = parseFloat(parent.dataset.stagger) || 0.10;
  Array.from(children).forEach((child, i) => {
    child.classList.add('reveal');
    child.style.transitionDelay = (i * delay) + 's';
    observer.observe(child);
  });
});

/* Compact workflow strip */
document.querySelectorAll('[data-workflow]').forEach(workflow => {
  const steps = [...workflow.querySelectorAll('[data-workflow-step]')];
  const notes = [...workflow.querySelectorAll('[data-workflow-note]')];
  if (!steps.length) return;

  let activeIndex = 0;
  let timer = null;
  let paused = false;

  const setActiveStep = (index) => {
    activeIndex = (index + steps.length) % steps.length;

    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === activeIndex;
      step.classList.toggle('active', isActive);
      step.setAttribute('aria-pressed', String(isActive));
    });

    notes.forEach((note, noteIndex) => {
      note.classList.toggle('active', noteIndex === activeIndex);
    });

    workflow.style.setProperty('--active-step', activeIndex);
    workflow.style.setProperty('--active-progress', `${((activeIndex + 1) / steps.length) * 100}%`);
  };

  const stopAuto = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const startAuto = () => {
    stopAuto();
    timer = window.setInterval(() => {
      if (!paused) setActiveStep(activeIndex + 1);
    }, 2600);
  };

  steps.forEach((step, index) => {
    step.addEventListener('mouseenter', () => {
      paused = true;
      setActiveStep(index);
    });
    step.addEventListener('focus', () => {
      paused = true;
      setActiveStep(index);
    });
    step.addEventListener('click', () => setActiveStep(index));
  });

  workflow.addEventListener('mouseleave', () => {
    paused = false;
  });
  workflow.addEventListener('focusout', event => {
    if (!workflow.contains(event.relatedTarget)) paused = false;
  });

  setActiveStep(0);
  startAuto();
});

/* Refined pricing focus */
document.querySelectorAll('[data-pricing-section]').forEach(section => {
  const cards = [...section.querySelectorAll('[data-pricing-card]')];
  if (!cards.length) return;

  const featured = cards.find(card => card.classList.contains('featured')) || cards[1] || cards[0];
  featured.classList.add('active');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cards.forEach(item => item.classList.toggle('active', item === card));
    });
  });

  section.addEventListener('mouseleave', () => {
    cards.forEach(item => item.classList.toggle('active', item === featured));
  });
});

const backBtn = document.getElementById('backToTop');
if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.hidden = window.scrollY < 500;
  }, { passive: true });
  backBtn.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* ── Footer year ── */
const yr = document.getElementById('currentYear');
if (yr) yr.textContent = new Date().getFullYear();


/* ==========================================================
   Contact form – validation + WhatsApp handoff

   The site has no backend, so messages are delivered to StarNex's own
   WhatsApp via CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/) —
   a free API that sends a WhatsApp message on your behalf when called
   with your phone number + a personal apikey.

   ONE-TIME SETUP (do this once, from the phone that should receive leads):
     1. Save this contact in WhatsApp:  CallMeBot's number (get it from
        the link above — it occasionally changes, so use their current page).
     2. From that phone, send it the WhatsApp message: "I allow callmebot to send me messages"
     3. CallMeBot replies with your personal "apikey" (a number).
     4. Paste that number below as CALLMEBOT_APIKEY.

   Until CALLMEBOT_APIKEY is filled in, the form falls back to opening a
   wa.me link for the visitor (the old behavior) so it still works.
   The form's native action="mailto:contact@starnexstudio.com" is a
   fallback only for the rare case where JS fails to load/run — this
   handler always preventDefault()s and takes over first.
   ========================================================== */
(function () {
  'use strict';

  const WHATSAPP_NUMBER   = '355682348060'; // same number used by the footer WhatsApp button — where leads are delivered
  const CALLMEBOT_APIKEY  = 'PASTE_YOUR_CALLMEBOT_APIKEY_HERE';

  const form = document.getElementById('cf-form');
  if (!form) return;

  const submitBtn = form.querySelector('.cf-submit');
  const success   = document.getElementById('cf-success');
  const isEn      = document.documentElement.lang === 'en';

  const t = isEn ? {
    fname:   'Please enter your full name.',
    phone:   'Please enter a valid phone number.',
    email:   'Please enter a valid email address.',
    service: 'Please select a service.',
    message: 'Your message should be at least 20 characters.',
    greeting: 'Hello StarNex! 👋',
    name: 'Name', company: 'Company', phoneLabel: 'Phone', emailLabel: 'Email',
    serviceLabel: 'Service', messageLabel: 'Message'
  } : {
    fname:   'Ju lutem shkruani emrin tuaj të plotë.',
    phone:   'Numri i telefonit duhet të jetë i vlefshëm.',
    email:   'Adresa e email-it duhet të jetë e vlefshme.',
    service: 'Ju lutem zgjidhni një shërbim.',
    message: 'Mesazhi duhet të ketë të paktën 20 karaktere.',
    greeting: 'Përshëndetje StarNex! 👋',
    name: 'Emri', company: 'Kompania', phoneLabel: 'Telefon', emailLabel: 'Email',
    serviceLabel: 'Shërbimi', messageLabel: 'Mesazhi'
  };

  /* ── Validators (phone is optional, so an empty value is valid) ── */
  const rules = {
    'cf-fname':   { validate: v => v.trim().length >= 2, msg: t.fname },
    'cf-phone':   { validate: v => v.trim() === '' || /^[+\d\s\-()]{7,20}$/.test(v.trim()), msg: t.phone },
    'cf-email':   { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: t.email },
    'cf-service': { validate: v => v !== '', msg: t.service },
    'cf-message': { validate: v => v.trim().length >= 20, msg: t.message }
  };

  function showError(id, msg) {
    const el    = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el)    el.textContent = msg;
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function clearError(id) {
    const el    = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el)    el.textContent = '';
    if (input) input.removeAttribute('aria-invalid');
  }

  /* ── Live validation ── */
  Object.keys(rules).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => {
      if (!rules[id].validate(input.value)) showError(id, rules[id].msg);
      else clearError(id);
    });
    input.addEventListener('input', () => clearError(id));
  });

  /* ── Submit → WhatsApp ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    let firstInvalid = null;

    Object.keys(rules).forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      if (!rules[id].validate(input.value)) {
        showError(id, rules[id].msg);
        valid = false;
        if (!firstInvalid) firstInvalid = input;
      } else {
        clearError(id);
      }
    });

    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    /* Collect data */
    const fullName    = document.getElementById('cf-fname').value.trim();
    const companyName = document.getElementById('cf-company').value.trim();
    const phone       = document.getElementById('cf-phone').value.trim();
    const email       = document.getElementById('cf-email').value.trim();
    const serviceText = document.getElementById('cf-service').value;
    const message      = document.getElementById('cf-message').value.trim();

    /* Build WhatsApp message */
    const company = companyName ? `\n${t.company}: ${companyName}` : '';
    const waText  =
      `${t.greeting}\n\n` +
      `${t.name}: ${fullName}${company}\n` +
      `${t.phoneLabel}: ${phone || '—'}\n` +
      `${t.emailLabel}: ${email}\n` +
      `${t.serviceLabel}: ${serviceText}\n\n` +
      `${t.messageLabel}:\n${message}`;

    const isConfigured = CALLMEBOT_APIKEY && CALLMEBOT_APIKEY.indexOf('PASTE_') !== 0;

    form.hidden = true;
    if (success) success.hidden = false;

    if (isConfigured) {
      /* Delivered automatically — no action needed from the visitor. */
      const cmbURL =
        `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}` +
        `&text=${encodeURIComponent(waText)}&apikey=${CALLMEBOT_APIKEY}`;
      fetch(cmbURL, { mode: 'no-cors' }).catch(() => {});
    } else {
      /* CallMeBot not set up yet — fall back to the visitor sending it themselves. */
      const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
      window.open(waURL, '_blank', 'noopener,noreferrer');
    }

    if (submitBtn) submitBtn.disabled = false;
  });
})();

/* ── Industry marquee: handled via CSS animation on .tr-track ── */

/* =========================================================
   DRAGGABLE LANGUAGE TOGGLE
   ========================================================= */

const languageToggle = document.getElementById("languageToggle");

if (languageToggle) {
  const track = languageToggle.querySelector(".language-toggle-track");
  const thumb = languageToggle.querySelector(".language-toggle-thumb");
  const options = [...languageToggle.querySelectorAll(".language-option")];

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let startTranslate = 0;

  const getOptionWidth = () => {
    return options[0].getBoundingClientRect().width;
  };

  const getCurrentIndex = () => {
    return languageToggle.dataset.currentLanguage === "en" ? 1 : 0;
  };

  const setActiveState = (index) => {
    options.forEach((option, optionIndex) => {
      const active = optionIndex === index;

      option.classList.toggle("active", active);
      option.setAttribute("aria-pressed", String(active));
    });
  };

  const updateTextColorDuringDrag = (progress) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (clampedProgress < 0.5) {
      setActiveState(0);
    } else {
      setActiveState(1);
    }
  };

  const navigateToLanguage = (index) => {
    const selectedOption = options[index];
    const currentIndex = getCurrentIndex();

    if (!selectedOption || index === currentIndex) {
      languageToggle.classList.remove("switching");
      return;
    }

    languageToggle.classList.add("switching");
    languageToggle.dataset.currentLanguage =
      selectedOption.dataset.language;

    setActiveState(index);

    /*
      E lëmë animacionin të përfundojë para se të hapet faqja tjetër.
      Kjo shmang ndjesinë e kalimit brutal.
    */
    window.setTimeout(() => {
      window.location.href = selectedOption.dataset.url;
    }, 420);
  };

  const snapToIndex = (index, navigate = true) => {
    const optionWidth = getOptionWidth();

    languageToggle.classList.remove("dragging");

    thumb.style.transform = `translateX(${index * optionWidth}px)`;

    setActiveState(index);

    if (navigate) {
      navigateToLanguage(index);
    }
  };

  const handlePointerDown = (event) => {
    if (languageToggle.classList.contains("switching")) return;

    isDragging = true;
    startX = event.clientX;

    const optionWidth = getOptionWidth();
    const currentIndex = getCurrentIndex();

    startTranslate = currentIndex * optionWidth;
    currentTranslate = startTranslate;

    languageToggle.classList.add("dragging");

    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    const optionWidth = getOptionWidth();
    const deltaX = event.clientX - startX;

    currentTranslate = Math.max(
      0,
      Math.min(optionWidth, startTranslate + deltaX)
    );

    thumb.style.transform = `translateX(${currentTranslate}px)`;

    updateTextColorDuringDrag(currentTranslate / optionWidth);
  };

  const handlePointerUp = (event) => {
    if (!isDragging) return;

    isDragging = false;

    const optionWidth = getOptionWidth();
    const targetIndex = currentTranslate >= optionWidth / 2 ? 1 : 0;

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    snapToIndex(targetIndex, true);
  };

  track.addEventListener("pointerdown", handlePointerDown);
  track.addEventListener("pointermove", handlePointerMove);
  track.addEventListener("pointerup", handlePointerUp);
  track.addEventListener("pointercancel", handlePointerUp);

  options.forEach((option, index) => {
    option.addEventListener("click", (event) => {
      /*
        Parandalon click-un e dyfishtë pas drag-ut.
      */
      if (isDragging) {
        event.preventDefault();
        return;
      }

      snapToIndex(index, true);
    });
  });

  /*
    Vendos thumb-in saktë kur faqja ngarkohet
    ose kur ndryshon madhësia e ekranit.
  */
  const positionThumb = () => {
    const optionWidth = getOptionWidth();
    const currentIndex = getCurrentIndex();

    thumb.style.transform =
      `translateX(${currentIndex * optionWidth}px)`;

    setActiveState(currentIndex);
  };

  window.addEventListener("resize", positionThumb);
  positionThumb();
}

/* FAQ accordion */
document.querySelectorAll("[data-faq-accordion]").forEach((accordion) => {
  const items = Array.from(accordion.querySelectorAll(".faq-item"));

  const setItemState = (item, open) => {
    const button = item.querySelector(".faq-question");
    const panel = item.querySelector(".faq-answer");

    if (!button || !panel) return;

    item.classList.toggle("active", open);
    button.setAttribute("aria-expanded", String(open));

    if (open) {
      panel.hidden = false;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      return;
    }

    panel.style.maxHeight = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.maxHeight = "0px";
    });

    const hidePanel = () => {
      if (!item.classList.contains("active")) panel.hidden = true;
      panel.removeEventListener("transitionend", hidePanel);
    };

    panel.addEventListener("transitionend", hidePanel);
  };

  items.forEach((item, index) => {
    const button = item.querySelector(".faq-question");
    const panel = item.querySelector(".faq-answer");
    const open = item.classList.contains("active") || index === 0;

    if (!button || !panel) return;

    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    item.classList.toggle("active", open);
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0px";

    button.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("active");

      items.forEach((otherItem) => {
        setItemState(otherItem, otherItem === item ? shouldOpen : false);
      });
    });
  });

  window.addEventListener("resize", () => {
    items.forEach((item) => {
      const panel = item.querySelector(".faq-answer");
      if (panel && item.classList.contains("active")) {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
});

/* ── Pricing card hover – rAF lerp animation ── */
(function initPricingHover() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = document.querySelectorAll('[data-pricing-card]');
  if (!cards.length) return;

  const stackedPricing = () => window.matchMedia('(max-width: 900px)').matches;
  const LERP      = 0.13;   // smoothing factor (lower = slower/smoother)
  const LIFT      = -8;     // extra px to lift on hover (added to base)
  const THRESHOLD = 0.04;   // stop rAF when delta < this

  cards.forEach(card => {
    const isFeatured  = card.classList.contains('featured');
    const baseScale   = isFeatured ? 1.05 : 1.0;
    const baseY       = isFeatured ? -20 : 0;   // featured starts 20px higher

    let currentY = baseY;
    let targetY  = baseY;
    let raf      = null;

    /* Set initial transform immediately */
    card.style.transform = stackedPricing() ? 'none' : `scale(${baseScale}) translateY(${baseY}px)`;

    function tick() {
      if (stackedPricing()) {
        card.style.transform = 'none';
        raf = null;
        return;
      }

      currentY += (targetY - currentY) * LERP;
      card.style.transform = `scale(${baseScale}) translateY(${currentY.toFixed(3)}px)`;

      if (Math.abs(targetY - currentY) > THRESHOLD) {
        raf = requestAnimationFrame(tick);
      } else {
        currentY = targetY;
        card.style.transform = `scale(${baseScale}) translateY(${currentY}px)`;
        raf = null;
      }
    }

    function start() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', () => {
      if (stackedPricing()) {
        currentY = 0;
        targetY = 0;
        card.style.transform = 'none';
      } else {
        currentY = baseY;
        targetY = baseY;
        card.style.transform = `scale(${baseScale}) translateY(${baseY}px)`;
      }
    }, { passive: true });

    if (prefersReduced) {
      /* Accessibility: skip animation, apply final state instantly */
      card.addEventListener('mouseenter', () => {
        if (stackedPricing()) return;
        card.style.transform = `scale(${baseScale}) translateY(${baseY + LIFT}px)`;
      });
      card.addEventListener('mouseleave', () => {
        if (stackedPricing()) return;
        card.style.transform = `scale(${baseScale}) translateY(${baseY}px)`;
      });
      return;
    }

    card.addEventListener('mouseenter', () => {
      if (stackedPricing()) return;
      targetY = baseY + LIFT;
      start();
    });

    card.addEventListener('mouseleave', () => {
      if (stackedPricing()) return;
      targetY = baseY;
      start();
    });
  });
}());


/* ── About Code Visual: JS-driven entrance tween, parallax, hover lift ── */
(function () {
  const visual = document.getElementById('aboutCodeVisual');
  const window_ = document.getElementById('aboutCodeWindow');
  const stage = window_ ? window_.closest('.about-code-stage') : null;
  if (!stage || !visual) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(visual.querySelectorAll('.acv-card'));
  const editorTilt = 'perspective(1100px) rotateY(-4deg) rotateX(2deg)';
  const isEditorTilted = () => window.innerWidth > 900;

  /* easeOutExpo — fast start, soft premium settle */
  const easeOutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function tweenIn(el, delay) {
    const duration = 760;
    let startTime = null;

    el.style.willChange = 'transform, opacity';

    function frame(now) {
      if (startTime === null) startTime = now + delay;
      const elapsed = now - startTime;
      if (elapsed < 0) { requestAnimationFrame(frame); return; }

      const t = Math.min(1, elapsed / duration);
      const eased = easeOutExpo(t);
      const y = 28 * (1 - eased);
      const scale = 0.97 + 0.03 * eased;

      el.style.opacity = eased;
      el.style.transform = el === window_
        ? `${isEditorTilted() ? editorTilt : ''} translateY(${y}px) scale(${scale})`
        : `translateY(${y}px) scale(${scale})`;

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.style.willChange = 'auto';
        el.classList.add('acv-settled');
      }
    }
    requestAnimationFrame(frame);
  }

  function runEntrance() {
    if (prefersReduced) {
      visual.classList.add('acv-visible', 'acv-done');
      return;
    }
    tweenIn(window_, 0);
    cards.forEach((card, i) => tweenIn(card, 140 + i * 120));
    setTimeout(() => visual.classList.add('acv-done'), 140 + cards.length * 120 + 760);
  }

  let done = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !done) {
        done = true;
        runEntrance();
        io.unobserve(visual);
      }
    });
  }, { threshold: 0.3 });
  io.observe(visual);

  /* Parallax tilt on the whole stage — smoothed with rAF lerp */
  if (!prefersReduced) {
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0, rafId = null;
    const LERP = 0.12;

    function tick() {
      curRX += (targetRX - curRX) * LERP;
      curRY += (targetRY - curRY) * LERP;
      stage.style.transform = `rotateY(${curRY.toFixed(3)}deg) rotateX(${curRX.toFixed(3)}deg)`;
      if (Math.abs(targetRX - curRX) > 0.01 || Math.abs(targetRY - curRY) > 0.01) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    visual.addEventListener('mousemove', (e) => {
      const rect = visual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = x * 4;
      targetRX = -y * 4;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    visual.addEventListener('mouseleave', () => {
      targetRX = 0; targetRY = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
  }

  /* Card hover lift — JS rAF lerp (lift + 3–4% scale, transform-origin center so it
     never shifts position) instead of CSS transition, for a smoother premium feel */
  if (!prefersReduced) {
    cards.forEach((card) => {
      card.style.transformOrigin = 'center center';

      let targetY = 0, targetS = 1, curY = 0, curS = 1, raf = null;

      function tick() {
        curY += (targetY - curY) * 0.16;
        curS += (targetS - curS) * 0.16;
        card.style.transform = `translateY(${curY.toFixed(2)}px) scale(${curS.toFixed(4)})`;
        if (Math.abs(targetY - curY) > 0.03 || Math.abs(targetS - curS) > 0.0005) {
          raf = requestAnimationFrame(tick);
        } else {
          curY = targetY; curS = targetS;
          card.style.transform = `translateY(${curY}px) scale(${curS})`;
          raf = null;
        }
      }

      card.addEventListener('mouseenter', () => {
        targetY = -8;
        targetS = 1.035;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      card.addEventListener('mouseleave', () => {
        targetY = 0;
        targetS = 1;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }
}());
