/* ==========================================================
   StarNex – script.js  (Frontend Only)
   ========================================================== */

/* ── Navbar scroll effect ── */
window.addEventListener('scroll', () => {
  if (window.innerWidth > 900) {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── Hamburger menu ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');

  hamburger.classList.toggle('active', open);
  navbar.classList.toggle('menu-open', open);

  hamburger.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
});

  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navbar.classList.remove('menu-open');
    });
  });
}


/* ── Intersection Observer – scroll animations ── */
const animated = document.querySelectorAll(
  '.animate-fadeUp, .animate-fadeIn, .animate-slideLeft, .animate-slideRight'
);
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
animated.forEach(el => observer.observe(el));

/* ── Back to top ── */
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backBtn.hidden = window.scrollY < 500;
}, { passive: true });
backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Footer year ── */
const yr = document.getElementById('currentYear');
if (yr) yr.textContent = new Date().getFullYear();


/* ==========================================================
   Contact form – validation + WhatsApp redirect
   ========================================================== */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '355684976315';

  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');

  if (!form) return;

  /* ── Validators ── */
  const rules = {
    fullName: {
      validate: v => v.trim().length >= 2,
      msg: 'Ju lutem shkruani emrin tuaj të plotë.'
    },
    phone: {
      validate: v => /^[+\d\s\-()]{7,20}$/.test(v.trim()),
      msg: 'Numri i telefonit duhet të jetë i vlefshëm.'
    },
    email: {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      msg: 'Adresa e email-it duhet të jetë e vlefshme.'
    },
    service: {
      validate: v => v !== '',
      msg: 'Ju lutem zgjidhni një shërbim.'
    },
    message: {
      validate: v => v.trim().length >= 20,
      msg: 'Mesazhi duhet të ketë të paktën 20 karaktere.'
    }
  };

  /* Service label map */
  const serviceLabels = {
    'custom-website': 'Zhvillim Uebsajti Custom',
    'business-website': 'Uebsajt Biznesi',
    'ecommerce': 'Dyqan E-commerce',
    'web-app': 'Aplikacion Web',
    'uiux': 'Dizajn UI/UX',
    'branding': 'Dizajn Logo & Branding',
    'seo': 'Optimizim SEO',
    'database': 'Dizajn & Zhvillim Databaze',
    'maintenance': 'Mirëmbajtje Uebsajti',
    'automation': 'Automatizim Biznesi',
    'other': 'Tjetër'
  };

  function showError(id, msg) {
    const el    = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el)    el.textContent = msg;
    if (input) input.style.borderColor = 'var(--red)';
  }

  function clearError(id) {
    const el    = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el)    el.textContent = '';
    if (input) input.style.borderColor = '';
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

    Object.keys(rules).forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      if (!rules[id].validate(input.value)) { showError(id, rules[id].msg); valid = false; }
      else clearError(id);
    });

    if (!valid) return;

    /* Loading state */
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.hidden     = true;
    btnLoading.hidden  = false;

    /* Collect data */
    const fullName    = document.getElementById('fullName').value.trim();
    const companyName = document.getElementById('companyName').value.trim();
    const phone       = document.getElementById('phone').value.trim();
    const email       = document.getElementById('email').value.trim();
    const serviceVal  = document.getElementById('service').value;
    const serviceText = serviceLabels[serviceVal] || serviceVal;
    const message     = document.getElementById('message').value.trim();

    /* Build WhatsApp message */
    const company = companyName ? `\nKompania: ${companyName}` : '';
    const waText  =
      `Përshëndetje StarNex! 👋\n\n` +
      `Emri: ${fullName}${company}\n` +
      `Telefon: ${phone}\n` +
      `Email: ${email}\n` +
      `Shërbimi: ${serviceText}\n\n` +
      `Mesazhi:\n${message}`;

    const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    /* Show success, then open WhatsApp */
    form.hidden    = true;
    success.hidden = false;

    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
    }, 600);

    submitBtn.disabled = false;
    btnText.hidden     = false;
    btnLoading.hidden  = true;
  });
  
const slider = document.getElementById("clientsSlider");

let position = 0;
let speed = 0.7;
let paused = false;

function animateClients() {
  if (!paused) {
    position -= speed;

    // infinite loop
    if (Math.abs(position) >= slider.scrollWidth / 2) {
      position = 0;
    }

    slider.style.transform = `translateX(${position}px)`;
  }

  requestAnimationFrame(animateClients);
}

animateClients();

/* pause on hover */
slider.addEventListener("mouseenter", () => paused = true);
slider.addEventListener("mouseleave", () => paused = false);

})();

const slider = document.getElementById("clientsSlider");

if (slider) {
  let position = 0;
  let speed = 0.7;
  let paused = false;

  function animateClients() {
    if (!paused) {
      position -= speed;

      if (Math.abs(position) >= slider.scrollWidth / 2) {
        position = 0;
      }

      slider.style.transform = `translateX(${position}px)`;
    }

    requestAnimationFrame(animateClients);
  }

  animateClients();

  slider.addEventListener("mouseenter", () => paused = true);
  slider.addEventListener("mouseleave", () => paused = false);
}

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