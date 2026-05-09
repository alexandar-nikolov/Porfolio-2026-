/* =============================================================
   sv-glitch-effects.js
   Spider-Verse effects + three-way visual theme switcher.

   Effects (ambient, non-interactive):
     1. CMYK print-plate mis-registration glitch (text only, no overlay)
     2. Spider-web corner crack (SVG, periodic)

   Theme switcher (user-facing button, bottom-right):
     COLOR  — default full Spider-Verse palette
     SKETCH — warm parchment / B&W pencil (sv-sketch-active permanent)
     NOIR   — Spider-Noir dark high-contrast (sv-theme-noir)
   ============================================================= */
'use strict';
(function () {

  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ── 1. CMYK MIS-REGISTRATION GLITCH ──────────────────────────
     Bumps text-shadow offsets on key text via a body class toggle.
     Pure CSS property change — no overlay, no blend-mode, no GPU.
     Fires every 8–18 s (first at 4–7 s). Skips in sketch/noir.  */

  function doCmykGlitch() {
    if (document.body.classList.contains('sv-theme-sketch') ||
        document.body.classList.contains('sv-theme-noir')) {
      setTimeout(doCmykGlitch, 8000 + Math.random() * 10000);
      return;
    }

    const add = () => document.body.classList.add('sv-cmyk-active');
    const rem = () => document.body.classList.remove('sv-cmyk-active');

    add();
    setTimeout(rem,  70);
    setTimeout(add, 130);
    setTimeout(rem, 480);

    setTimeout(doCmykGlitch, 8000 + Math.random() * 10000);
  }

  if (!noMotion) {
    setTimeout(doCmykGlitch, 4000 + Math.random() * 3000);
  }


  /* ── 2. SPIDER-WEB CORNER CRACK ───────────────────────────────
     SVG web in a random corner, On-2s flicker, then fades.
     Fires every 25–45 s (first at 12–20 s).                      */

  const CRACK_POS = [
    { top: '0',    left: '0',   t: 'none'        },
    { top: '0',    right: '0',  t: 'scaleX(-1)'  },
    { bottom: '0', left: '0',   t: 'scaleY(-1)'  },
    { bottom: '0', right: '0',  t: 'scale(-1,-1)'},
  ];

  const WEB_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
    <g stroke="#0D0D0D" stroke-linecap="round">
      <line x1="0" y1="0" x2="200" y2="80"  stroke-width="1.5"/>
      <line x1="0" y1="0" x2="160" y2="200" stroke-width="1.5"/>
      <line x1="0" y1="0" x2="100" y2="200" stroke-width="1.2"/>
      <line x1="0" y1="0" x2="40"  y2="200" stroke-width="1.2"/>
      <line x1="0" y1="0" x2="200" y2="150" stroke-width="1.2"/>
      <line x1="0" y1="0" x2="200" y2="20"  stroke-width="1"/>
      <line x1="0" y1="0" x2="20"  y2="200" stroke-width="1"/>
      <path d="M50,0 Q25,25 0,50"         stroke-width="1"/>
      <path d="M100,0 Q50,50 0,100"       stroke-width="1"/>
      <path d="M150,0 Q75,75 0,150"       stroke-width="1.2"/>
      <path d="M200,0 Q100,100 0,200"     stroke-width="1.5"/>
      <path d="M200,50 Q125,125 50,200"   stroke-width="1"/>
      <path d="M200,100 Q150,150 100,200" stroke-width="0.8"/>
    </g>
    <g stroke="#E23636" stroke-linecap="round" opacity="0.55">
      <line x1="0" y1="0" x2="200" y2="80"  stroke-width="2.5"/>
      <line x1="0" y1="0" x2="100" y2="200" stroke-width="2"/>
      <path d="M200,0 Q100,100 0,200"     stroke-width="2.5"/>
    </g>
  </svg>`;

  function spawnWebCrack() {
    const p  = CRACK_POS[Math.floor(Math.random() * CRACK_POS.length)];
    const el = document.createElement('div');
    el.className = 'sv-web-crack';
    el.style.cssText = `top:auto;right:auto;bottom:auto;left:auto;transform:${p.t}`;
    if (p.top    !== undefined) el.style.top    = p.top;
    if (p.right  !== undefined) el.style.right  = p.right;
    if (p.bottom !== undefined) el.style.bottom = p.bottom;
    if (p.left   !== undefined) el.style.left   = p.left;
    el.innerHTML = WEB_SVG;
    document.body.appendChild(el);

    /* On-2s flicker × 2, hold, fade */
    setTimeout(() => el.classList.add('sv-web-crack--on'),     0);
    setTimeout(() => el.classList.remove('sv-web-crack--on'),  65);
    setTimeout(() => el.classList.add('sv-web-crack--on'),    125);
    setTimeout(() => el.classList.remove('sv-web-crack--on'), 195);
    setTimeout(() => el.classList.add('sv-web-crack--on'),    235);
    setTimeout(() => el.classList.add('sv-web-crack--fade'),  450);
    setTimeout(() => el.remove(), 700);

    setTimeout(spawnWebCrack, 25000 + Math.random() * 20000);
  }

  if (!noMotion) {
    setTimeout(spawnWebCrack, 12000 + Math.random() * 8000);
  }


  /* ── 3. VISUAL THEME SWITCHER ─────────────────────────────────
     COLOR → SKETCH → NOIR → COLOR (cycles on button click).
     Persisted in localStorage as 'sv-visual-theme'.

     SKETCH: permanently activates sv-sketch-active (reuses all
             existing sketch CSS) + sets sv-theme-sketch guard so
             the periodic doSketch() flash is suppressed.
     NOIR:   applies sv-theme-noir dark palette CSS.              */

  const THEMES = ['color', 'sketch', 'noir'];

  const THEME_META = {
    color:  { label: 'COLOR',  icon: '◈', bodyClasses: [] },
    sketch: { label: 'SKETCH', icon: '✏', bodyClasses: ['sv-sketch-active', 'sv-theme-sketch'] },
    noir:   { label: 'NOIR',   icon: '◆', bodyClasses: ['sv-theme-noir'] },
  };

  /* All extra body classes this switcher may set */
  const ALL_EXTRA = ['sv-sketch-active', 'sv-theme-sketch', 'sv-theme-noir'];

  let currentTheme = localStorage.getItem('sv-visual-theme') || 'color';

  function applyTheme(name) {
    const meta = THEME_META[name] || THEME_META.color;

    /* Remove all theme classes, then add only what this theme needs */
    ALL_EXTRA.forEach(c => document.body.classList.remove(c));
    meta.bodyClasses.forEach(c => document.body.classList.add(c));

    /* Update button appearance */
    const btn = document.getElementById('sv-theme-switcher');
    if (btn) {
      btn.querySelector('.sv-theme-icon').textContent  = meta.icon;
      btn.querySelector('.sv-theme-label').textContent = meta.label;
    }

    localStorage.setItem('sv-visual-theme', name);
    currentTheme = name;
  }

  function injectThemeBtn() {
    if (document.getElementById('sv-theme-switcher')) return;

    const btn = document.createElement('button');
    btn.id        = 'sv-theme-switcher';
    btn.className = 'sv-theme-btn';
    btn.setAttribute('aria-label', 'Switch visual theme');
    btn.innerHTML =
      '<span class="sv-theme-icon" aria-hidden="true"></span>' +
      '<span class="sv-theme-label"></span>';

    btn.addEventListener('click', () => {
      const next = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];
      applyTheme(next);
    });

    document.body.appendChild(btn);
    applyTheme(currentTheme); /* apply saved or default theme */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectThemeBtn);
  } else {
    injectThemeBtn();
  }


  /* ── 4. SPIDER CHARACTER ───────────────────────────────────────
     Rappels down from the top on a silk thread.
     States: waiting → descending → hanging → retreating
     Retreats when cursor comes within PROX_THRESHOLD px.
     Re-descends after a random delay.                            */

  const SPIDER_SVG = [
    '<svg id="sv-spider-svg" viewBox="0 0 60 56" width="54" height="51"',
    ' xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">',
    /* Legs LEFT */
    '<line class="spider-leg" x1="22" y1="20" x2="3"  y2="8"  stroke="#0D0D0D" stroke-width="2.2" stroke-linecap="round"/>',
    '<line class="spider-leg" x1="21" y1="25" x2="0"  y2="19" stroke="#0D0D0D" stroke-width="2"   stroke-linecap="round"/>',
    '<line class="spider-leg" x1="21" y1="30" x2="1"  y2="33" stroke="#0D0D0D" stroke-width="2"   stroke-linecap="round"/>',
    '<line class="spider-leg" x1="22" y1="35" x2="5"  y2="46" stroke="#0D0D0D" stroke-width="2"   stroke-linecap="round"/>',
    /* Legs RIGHT */
    '<line class="spider-leg" x1="38" y1="20" x2="57" y2="8"  stroke="#0D0D0D" stroke-width="2.2" stroke-linecap="round"/>',
    '<line class="spider-leg" x1="39" y1="25" x2="60" y2="19" stroke="#0D0D0D" stroke-width="2"   stroke-linecap="round"/>',
    '<line class="spider-leg" x1="39" y1="30" x2="59" y2="33" stroke="#0D0D0D" stroke-width="2"   stroke-linecap="round"/>',
    '<line class="spider-leg" x1="38" y1="35" x2="55" y2="46" stroke="#0D0D0D" stroke-width="2"   stroke-linecap="round"/>',
    /* Abdomen */
    '<ellipse class="spider-body" cx="30" cy="42" rx="11" ry="13" fill="#111" stroke="#0D0D0D" stroke-width="1.5"/>',
    /* Spider-Man hourglass mark */
    '<path class="spider-mark" d="M30 31 L24.5 50 L30 46 L35.5 50 Z" fill="#E23636" opacity="0.82"/>',
    /* Cephalothorax */
    '<ellipse class="spider-head" cx="30" cy="24" rx="9" ry="10" fill="#111" stroke="#0D0D0D" stroke-width="1.5"/>',
    /* Eyes — large Spider-Verse style */
    '<ellipse class="spider-eye" cx="26" cy="20" rx="4" ry="3" fill="#E23636"/>',
    '<ellipse class="spider-eye" cx="34" cy="20" rx="4" ry="3" fill="#E23636"/>',
    /* Eye highlights */
    '<ellipse cx="24.8" cy="19" rx="1.4" ry="1" fill="rgba(255,255,255,0.5)"/>',
    '<ellipse cx="32.8" cy="19" rx="1.4" ry="1" fill="rgba(255,255,255,0.5)"/>',
    '</svg>'
  ].join('');

  function injectSpider() {
    if (document.getElementById('sv-spider') || noMotion) return;

    const wrap   = document.createElement('div');
    wrap.id       = 'sv-spider';

    const thread = document.createElement('div');
    thread.id     = 'sv-spider-thread';

    const sway   = document.createElement('div');
    sway.id       = 'sv-spider-sway';
    sway.innerHTML = SPIDER_SVG;

    wrap.appendChild(thread);
    wrap.appendChild(sway);
    document.body.appendChild(wrap);

    const MAX_DESCENT      = 240;   /* px thread grows to           */
    const DESCEND_SPEED    = 1.4;   /* px per rAF tick (~3.6s full) */
    const PROX_THRESHOLD   = 150;   /* px from spider centre        */
    const RE_APPEAR_MIN    = 5000;
    const RE_APPEAR_MAX    = 11000;

    let state    = 'waiting';
    let currentH = 0;
    let rafId    = null;

    function setH(h) {
      currentH         = h;
      thread.style.height = h + 'px';
    }

    function descend() {
      if (state !== 'descending') return;
      if (currentH >= MAX_DESCENT) { state = 'hanging'; return; }
      setH(currentH + DESCEND_SPEED);
      rafId = requestAnimationFrame(descend);
    }

    function startDescend() {
      if (state === 'descending' || state === 'hanging') return;
      thread.style.transition = 'none';
      state = 'descending';
      rafId = requestAnimationFrame(descend);
    }

    function retreat() {
      if (state === 'retreating') return;
      state = 'retreating';
      cancelAnimationFrame(rafId);
      thread.style.transition = 'height 0.36s cubic-bezier(0.55,0,1,0.45)';
      setH(0);
      setTimeout(function () {
        state = 'waiting';
        var delay = RE_APPEAR_MIN + Math.random() * (RE_APPEAR_MAX - RE_APPEAR_MIN);
        setTimeout(startDescend, delay);
      }, 420);
    }

    document.addEventListener('mousemove', function (e) {
      if (state !== 'hanging' && state !== 'descending') return;
      var r    = sway.getBoundingClientRect();
      var cx   = r.left + r.width  / 2;
      var cy   = r.top  + r.height / 2;
      var dx   = e.clientX - cx;
      var dy   = e.clientY - cy;
      if (Math.sqrt(dx * dx + dy * dy) < PROX_THRESHOLD) retreat();
    }, { passive: true });

    /* First descent after a short random delay */
    setTimeout(startDescend, 2500 + Math.random() * 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSpider);
  } else {
    injectSpider();
  }

})();

