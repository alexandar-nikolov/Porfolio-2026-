'use strict';

/* ── Cursor Glow ─────────────────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  });
}

/* ── Entry Loader ────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('entry-loader');
  if (!loader) return;
  /* Bar animation takes 1.8s — dismiss after a short hold */
  setTimeout(() => loader.classList.add('hidden'), 2200);
});

/* ── Main App ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  const aside   = document.getElementById('aside');
  const toggle  = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  const sections = document.querySelectorAll('.section');

  /* Collect all section IDs present on this page */
  const sectionIds = new Set(Array.from(sections).map(s => '#' + s.id));

  /* ── Show section ──────────────────────────────────────────── */
  function showSection(hash) {
    if (!sectionIds.has(hash)) return;

    sections.forEach(s => {
      const wasActive = s.classList.contains('active');
      s.classList.remove('active', 'back-section');
      if (wasActive) s.classList.add('back-section');
    });

    const target = document.getElementById(hash.slice(1));
    if (target) {
      target.classList.remove('back-section');
      target.classList.add('active');
      target.scrollTop = 0;
    }

    /* Sync nav highlight */
    document.querySelectorAll('.nav > ul > li > a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === hash);
    });
  }

  /* ── Handle all internal (#) link clicks ────────────────────── */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!sectionIds.has(href)) return;  /* let external/project links navigate normally */
    e.preventDefault();
    showSection(href);
    history.pushState(null, '', href);
    closeMobileNav();
  });

  /* ── Mobile nav ─────────────────────────────────────────────── */
  function closeMobileNav() {
    if (aside)   aside.classList.remove('open');
    if (toggle)  toggle.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      aside.classList.toggle('open');
      toggle.classList.toggle('open');
      overlay && overlay.classList.toggle('visible');
    });
  }
  if (overlay) overlay.addEventListener('click', closeMobileNav);

  /* ── Logo → home ─────────────────────────────────────────────── */
  const logo = document.querySelector('.logo a');
  if (logo) {
    logo.addEventListener('click', e => {
      e.preventDefault();
      showSection('#home');
      history.pushState(null, '', '#home');
      closeMobileNav();
    });
  }

  /* ── Initial section from URL hash ──────────────────────────── */
  const initHash = window.location.hash || '#home';
  showSection(sectionIds.has(initHash) ? initHash : '#home');

  /* ── Typed.js ────────────────────────────────────────────────── */
  if (window.Typed && document.querySelector('.typing')) {
    new Typed('.typing', {
      strings: ['Frontend Developer', 'ICT Student', 'Web Designer'],
      typeSpeed: 80,
      backSpeed: 55,
      backDelay: 1600,
      loop: true,
    });
  }

});
