'use strict';
/* ═══════════════════════════════════════════════════════════════
   ENHANCE.JS  —  AVA Digital + Meow Wolf inspired layer
   · Count-up number animations        (AVA Digital)
   · Magnetic hover on buttons         (AVA Digital)
   · Word-by-word fly-up reveal        (AVA Digital)
   · Clip-path horizontal wipe reveal  (AVA Digital)
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. Count-up animation ───────────────────────────────────── */
function initCountUp() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el      = entry.target;
      if (el.dataset.countDone) return;
      el.dataset.countDone = '1';

      const target  = parseFloat(el.dataset.count);
      const suffix  = el.dataset.suffix  || '';
      const display = el.dataset.display || (target + suffix);
      const dur     = 1800;
      const start   = performance.now();

      (function tick(now) {
        const t     = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);           /* ease-out cubic */
        el.textContent = Math.round(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else        el.textContent = display;
      })(performance.now());
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

/* ── 2. Magnetic hover effect ────────────────────────────────── */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3;

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  * 0.5)) * strength;
      const dy = (e.clientY - (r.top  + r.height * 0.5)) * strength;
      el.style.transition = 'transform 0.12s ease';
      el.style.transform  = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
      el.style.transform  = 'translate(0,0)';
    });
  });
}

/* ── 3. Word-by-word fly-up reveal ───────────────────────────── */
function initWordReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const baseDelay = parseFloat(entry.target.dataset.revealDelay || 0);
      entry.target.querySelectorAll('.wrd').forEach((w, i) => {
        setTimeout(() => w.classList.add('visible'), baseDelay + i * 90);
      });
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-word-reveal]').forEach(el => {
    if (el.querySelector('.wrd')) { obs.observe(el); return; }
    const raw   = el.textContent.trim();
    el.innerHTML = raw.split(/\s+/).map(
      w => `<span class="wrd-outer"><span class="wrd">${w}</span></span>`
    ).join('&thinsp;');
    obs.observe(el);
  });
}

/* ── 4. Clip-path horizontal wipe reveal ─────────────────────── */
function initClipReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const delay = parseFloat(entry.target.dataset.clipDelay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-clip').forEach(el => obs.observe(el));
}

/* ── 5. Recommendation card flip ─────────────────────────────── */
function initRecFlip() {
  document.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

/* ── Boot ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCountUp();
  initMagnetic();
  initWordReveal();
  initClipReveal();
  initRecFlip();
});
