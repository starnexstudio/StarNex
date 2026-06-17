/* ==========================================================
   StarNex – script.js  (Frontend Only)
   ========================================================== */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hamburger menu ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
});

mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

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
