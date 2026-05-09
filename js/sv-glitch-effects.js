/* =============================================================
   sv-glitch-effects.js
   Spider-Verse cinematic glitch effects — inspired by
   "Into the Spider-Verse" & "Across the Spider-Verse"

   1. CMYK print-plate mis-registration glitch
   2. Dimension portal ripple rings on click
   3. Spider-web corner crack (random corners)
   4. Spider-sense stutter on section header reveal
   5. Ink-splat section reveal (replaces heavy panel wipe)
   ============================================================= */
'use strict';
(function () {

  /* Skip if user prefers reduced motion */
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ── 1. CMYK MIS-REGISTRATION GLITCH ──────────────────────────
     Mimics old comic printing where CMYK plates slip out of
     register, ghosting red/blue halos around text.
     A body class pumps up the text-shadow offsets; a blended
     colour-wash overlay shifts the overall hue — both in stepped
     frames for the On-2s comic-book feel.
     Fires every 5–12 s (first trigger at 3–6 s).               */

  function doCmykGlitch() {
    /* colour-wash overlay — uses mix-blend-mode:color so it
       tints without nuking child element animations            */
    const overlay = document.createElement('div');
    overlay.className = 'sv-cmyk-overlay';
    document.body.appendChild(overlay);

    /* text-shadow stutter: add → off → on → off → on → off    */
    document.body.classList.add('sv-cmyk-active');
    setTimeout(() => document.body.classList.remove('sv-cmyk-active'), 60);
    setTimeout(() => document.body.classList.add('sv-cmyk-active'),   120);
    setTimeout(() => document.body.classList.remove('sv-cmyk-active'), 200);
    setTimeout(() => document.body.classList.add('sv-cmyk-active'),   240);
    setTimeout(() => document.body.classList.remove('sv-cmyk-active'), 520);

    setTimeout(() => overlay.remove(), 560);

    setTimeout(doCmykGlitch, 5000 + Math.random() * 7000);
  }

  if (!noMotion) {
    setTimeout(doCmykGlitch, 3000 + Math.random() * 3000);
  }


  /* ── 2. DIMENSION PORTAL RIPPLE RINGS ─────────────────────────
     Every click spawns three concentric rings (red → blue →
     yellow) that expand from the click point — like opening a
     rift between Spider-Verse dimensions.                        */

  const RING_COLORS = ['#E23636', '#1A3A8F', '#F7C948'];

  if (!noMotion) {
    document.addEventListener('click', (e) => {
      RING_COLORS.forEach((color, i) => {
        setTimeout(() => {
          const ring = document.createElement('div');
          ring.className = 'sv-portal-ring';
          ring.style.left        = e.clientX + 'px';
          ring.style.top         = e.clientY + 'px';
          ring.style.borderColor = color;
          document.body.appendChild(ring);
          setTimeout(() => ring.remove(), 750);
        }, i * 80);
      });
    });
  }


  /* ── 3. SPIDER-WEB CORNER CRACK ───────────────────────────────
     An SVG web radiates from a random viewport corner, flickering
     twice (On-2s) before fading.  Fires every 20–35 s.          */

  const CRACK_POSITIONS = [
    { top: '0',    left: '0',   transform: 'none'       },
    { top: '0',    right: '0',  transform: 'scaleX(-1)' },
    { bottom: '0', left: '0',   transform: 'scaleY(-1)' },
    { bottom: '0', right: '0',  transform: 'scale(-1,-1)'},
  ];

  function buildWebSvg() {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="#0D0D0D" stroke-linecap="round">
        <line x1="0" y1="0" x2="200" y2="80"  stroke-width="1.5"/>
        <line x1="0" y1="0" x2="160" y2="200" stroke-width="1.5"/>
        <line x1="0" y1="0" x2="100" y2="200" stroke-width="1.2"/>
        <line x1="0" y1="0" x2="40"  y2="200" stroke-width="1.2"/>
        <line x1="0" y1="0" x2="200" y2="150" stroke-width="1.2"/>
        <line x1="0" y1="0" x2="200" y2="20"  stroke-width="1"/>
        <line x1="0" y1="0" x2="20"  y2="200" stroke-width="1"/>
        <path d="M50,0 Q25,25 0,50"            stroke-width="1"/>
        <path d="M100,0 Q50,50 0,100"          stroke-width="1"/>
        <path d="M150,0 Q75,75 0,150"          stroke-width="1.2"/>
        <path d="M200,0 Q100,100 0,200"        stroke-width="1.5"/>
        <path d="M200,50 Q125,125 50,200"      stroke-width="1"/>
        <path d="M200,100 Q150,150 100,200"    stroke-width="0.8"/>
      </g>
      <g stroke="#E23636" stroke-linecap="round" opacity="0.55">
        <line x1="0" y1="0" x2="200" y2="80"  stroke-width="2.5"/>
        <line x1="0" y1="0" x2="100" y2="200" stroke-width="2"/>
        <path d="M200,0 Q100,100 0,200"        stroke-width="2.5"/>
      </g>
    </svg>`;
  }

  function spawnWebCrack() {
    const pos = CRACK_POSITIONS[Math.floor(Math.random() * CRACK_POSITIONS.length)];
    const el  = document.createElement('div');
    el.className = 'sv-web-crack';
    /* Reset all sides then apply only the needed ones */
    el.style.cssText = `top:auto;right:auto;bottom:auto;left:auto;transform:${pos.transform}`;
    if (pos.top    !== undefined) el.style.top    = pos.top;
    if (pos.right  !== undefined) el.style.right  = pos.right;
    if (pos.bottom !== undefined) el.style.bottom = pos.bottom;
    if (pos.left   !== undefined) el.style.left   = pos.left;

    el.innerHTML = buildWebSvg();
    document.body.appendChild(el);

    /* On-2s flicker × 2, then hold, then fade */
    setTimeout(() => el.classList.add('sv-web-crack--on'),     0);
    setTimeout(() => el.classList.remove('sv-web-crack--on'),  60);
    setTimeout(() => el.classList.add('sv-web-crack--on'),     120);
    setTimeout(() => el.classList.remove('sv-web-crack--on'),  190);
    setTimeout(() => el.classList.add('sv-web-crack--on'),     230);
    setTimeout(() => el.classList.add('sv-web-crack--fade'),   440);
    setTimeout(() => el.remove(), 680);

    setTimeout(spawnWebCrack, 20000 + Math.random() * 15000);
  }

  if (!noMotion) {
    setTimeout(spawnWebCrack, 10000 + Math.random() * 8000);
  }


  /* ── 4. SPIDER-SENSE STUTTER ───────────────────────────────────
     When section headers first scroll into view (IntersectionObs)
     the wrapper gets .sv-spider-sense for a 480 ms stepped
     translateX + skewX wobble — the horizontal axis only, so it
     cannot conflict with child reveal animations (translateY/opacity).
     Fires once per element, 400 ms after the reveal starts.      */

  function initSpiderSense() {
    const headers = document.querySelectorAll('.section-header, .ft-left-inner');
    if (!headers.length) return;

    const seen = new WeakSet();
    const obs  = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          obs.unobserve(entry.target);
          /* Let the text-reveal start first, then stutter */
          setTimeout(() => {
            const el = entry.target;
            el.classList.add('sv-spider-sense');
            setTimeout(() => el.classList.remove('sv-spider-sense'), 500);
          }, 400);
        }
      });
    }, { threshold: 0.4 });

    headers.forEach(h => obs.observe(h));
  }


  /* ── 5. INK-SPLAT SECTION REVEAL ──────────────────────────────
     Replaces the heavy black-block panel wipe.  When a section
     scrolls into view a small red ink circle expands briefly from
     a viewport edge then contracts — 300 ms total, very subtle.  */

  const SPLAT_PAIRS = [
    ['circle(0% at 0% 50%)',   'circle(32% at 0% 50%)' ],
    ['circle(0% at 100% 50%)', 'circle(32% at 100% 50%)'],
    ['circle(0% at 50% 0%)',   'circle(32% at 50% 0%)' ],
    ['circle(0% at 50% 100%)','circle(32% at 50% 100%)'],
  ];

  let   _splatsScrolled = false;
  const _splatsSeen     = new WeakSet();

  window.addEventListener('scroll', () => { _splatsScrolled = true; },
                          { once: true, passive: true });

  function spawnInkSplat() {
    const [start, end] = SPLAT_PAIRS[Math.floor(Math.random() * SPLAT_PAIRS.length)];
    const el = document.createElement('div');
    el.className      = 'sv-ink-splat';
    el.style.clipPath = start;
    document.body.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = 'clip-path 0.14s cubic-bezier(0.2,0,0.8,1)';
      el.style.clipPath   = end;
      setTimeout(() => {
        el.style.transition = 'clip-path 0.18s cubic-bezier(0.2,0,0.8,1)';
        el.style.clipPath   = start;
        setTimeout(() => el.remove(), 200);
      }, 160);
    }));
  }

  function initInkSplats() {
    const sections = document.querySelectorAll('section');
    if (!sections.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && _splatsScrolled
            && !_splatsSeen.has(entry.target)) {
          _splatsSeen.add(entry.target);
          obs.unobserve(entry.target);
          spawnInkSplat();
        }
      });
    }, { threshold: 0.2 });

    sections.forEach(s => obs.observe(s));
  }


  /* ── Boot ──────────────────────────────────────────────────────
     Both sense + splat observers need the DOM.                    */
  function boot() {
    if (!noMotion) {
      initSpiderSense();
      initInkSplats();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
