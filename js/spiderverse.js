
 * spiderverse.js — Interactive Spider-Verse visual effects
 *
 * Effects:
 *   1. Speed-lines burst canvas — radial ink lines on every click
 *   2. Impact word pop-up       — POW / ZAP / BOOM / etc. on CTA interactions
 *   3. Dimension-shift flash    — hard colour cut when entering a new section
 *   4. Ben-Day dot cursor trail — halftone dots follow the mouse
 *   5. "On Twos" panel crack    — brief black frame flash for comic-book pacing
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. SPEED LINES BURST — canvas drawn on every click
     ═══════════════════════════════════════════════════════════ */
  const burstCanvas = document.createElement('canvas');
  burstCanvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:9950;pointer-events:none;';
  document.body.appendChild(burstCanvas);
  const bCtx = burstCanvas.getContext('2d');

  function resizeBurst() {
    burstCanvas.width  = window.innerWidth;
    burstCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeBurst, { passive: true });
  resizeBurst();

  const BURST_COLS = ['#FF006E', '#00F5FF', '#FFBE0B', '#8AFF2A', '#6A00FF', '#FB5607'];

  let activeBursts = [];

  function spawnBurst(x, y, scale) {
    scale = scale || 1;
    const numLines = 16 + Math.floor(Math.random() * 12);
    const maxLen   = Math.max(window.innerWidth, window.innerHeight) * 0.32 * scale;
    const color    = BURST_COLS[Math.floor(Math.random() * BURST_COLS.length)];
    activeBursts.push({
      x, y, numLines, maxLen, color,
      startTime: performance.now(),
      duration:  420 + Math.random() * 80,
    });
  }

  let burstRafRunning = false;
  function drawBursts(now) {
    bCtx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
    activeBursts = activeBursts.filter(b => now - b.startTime < b.duration);

    for (const b of activeBursts) {
      const prog  = (now - b.startTime) / b.duration;
      const eased = 1 - Math.pow(1 - prog, 3);       /* ease-out cubic */
      const lineLen = b.maxLen * eased;
      const alpha   = (1 - prog) * 0.72;

      bCtx.save();
      bCtx.translate(b.x, b.y);
      bCtx.globalAlpha = alpha * 0.55;   /* softer overall opacity */
      bCtx.strokeStyle = b.color;
      bCtx.lineWidth   = 1.2 + (1 - prog) * 1.5;
      bCtx.lineCap     = 'round';

      for (let i = 0; i < b.numLines; i++) {
        /* Skip ~15 % of lines for the irregular, hand-drawn comic feel */
        if (Math.random() < 0.15) continue;
        const angle  = (i / b.numLines) * Math.PI * 2;
        const innerR = 18 + Math.random() * 28;
        const outerR = lineLen * (0.55 + Math.random() * 0.45);

        bCtx.beginPath();
        bCtx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        bCtx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        bCtx.stroke();
      }
      bCtx.restore();
    }

    if (activeBursts.length > 0) {
      requestAnimationFrame(drawBursts);
    } else {
      burstRafRunning = false;
    }
  }

  document.addEventListener('click', (e) => {
    spawnBurst(e.clientX, e.clientY);
    if (!burstRafRunning) {
      burstRafRunning = true;
      requestAnimationFrame(drawBursts);
    }
  });

  /* ═══════════════════════════════════════════════════════════
     2. IMPACT WORD POP-UP — POW / ZAP / BOOM on interactions
     ═══════════════════════════════════════════════════════════ */
  const IMPACT_WORDS  = ['POW!', 'ZAP!', 'BOOM!', 'BUILT!', 'YES!', 'SHIPPED!', 'DEPLOY!', 'CODE!', '🕷'];
  const IMPACT_COLORS = ['#FF006E', '#FFBE0B', '#00F5FF', '#8AFF2A'];

  function spawnImpact(x, y) {
    const text  = IMPACT_WORDS[Math.floor(Math.random() * IMPACT_WORDS.length)];
    const color = IMPACT_COLORS[Math.floor(Math.random() * IMPACT_COLORS.length)];
    const rot   = (Math.random() - 0.5) * 28;
    const size  = 1.4 + Math.random() * 1.6;

    const el = document.createElement('div');
    el.textContent = text;
    el.className   = 'sv-impact';
    el.style.cssText = `
      position:fixed;
      left:${x}px;top:${y}px;
      transform:translate(-50%,-50%) scale(0) rotate(${rot}deg);
      font-family:'Black Ops One','Anton',sans-serif;
      font-size:${size}rem;
      color:${color};
      -webkit-text-stroke:2px #000;
      paint-order:stroke fill;
      text-shadow:3px 3px 0 #000,-1px -1px 0 #000;
      z-index:9960;pointer-events:none;white-space:nowrap;
      transition:transform 0.14s cubic-bezier(0.34,1.56,0.64,1),opacity 0.38s ease;
    `;
    document.body.appendChild(el);

    /* Pop in */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translate(-50%,-60%) scale(1) rotate(${rot * 0.6}deg)`;
      el.style.opacity   = '1';
      /* Fade out and float up */
      setTimeout(() => {
        el.style.opacity   = '0';
        el.style.transform = `translate(-50%,-120%) scale(0.75) rotate(${rot * 0.4}deg)`;
        setTimeout(() => el.remove(), 420);
      }, 500);
    }));
  }

  /* Attach to CTA buttons and nav links */
  function attachImpact() {
    document.querySelectorAll('.cta-btn, .bb-open-btn, .tnav-link').forEach(el => {
      if (el.dataset.svImpact) return;
      el.dataset.svImpact = '1';
      el.addEventListener('click', (e) => {
        const r = el.getBoundingClientRect();
        spawnImpact(r.left + r.width / 2, r.top + r.height / 2);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachImpact);
  } else {
    attachImpact();
  }

  /* Re-run after project cards may have been injected */
  setTimeout(attachImpact, 2000);

  /* ═══════════════════════════════════════════════════════════
     3. DIMENSION-SHIFT FLASH — hard colour cut on section enter
        Mimics the multiverse portal transitions in the film.
     ═══════════════════════════════════════════════════════════ */
  const flashEl = document.createElement('div');
  flashEl.style.cssText =
    'position:fixed;inset:0;z-index:9940;pointer-events:none;opacity:0;mix-blend-mode:screen;';
  document.body.appendChild(flashEl);

  const FLASH_COLS = [
    'rgba(255,0,110,0.20)',
    'rgba(0,245,255,0.20)',
    'rgba(255,190,11,0.18)',
    'rgba(138,255,42,0.16)',
  ];

  let lastSectionId = null;

  function checkFlash() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;
    let current = null;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= window.innerHeight * 0.45 && r.bottom >= window.innerHeight * 0.45) {
        current = s.id; break;
      }
    }
    if (current && current !== lastSectionId) {
      lastSectionId = current;
      const col = FLASH_COLS[Math.floor(Math.random() * FLASH_COLS.length)];
      flashEl.style.transition = 'opacity 0s';
      flashEl.style.background = col;
      flashEl.style.opacity    = '0.5';   /* was 1 */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        flashEl.style.transition = 'opacity 0.8s ease';   /* longer fade */
        flashEl.style.opacity    = '0';
      }));
    }
  }

  window.addEventListener('scroll', checkFlash, { passive: true });

  /* ═══════════════════════════════════════════════════════════
     4. BEN-DAY DOT CURSOR TRAIL
        Halftone dots spawned behind the cursor as it moves.
     ═══════════════════════════════════════════════════════════ */
  const DOT_COLS = ['#FF006E', '#00F5FF', '#FFBE0B', '#8AFF2A'];
  let lastDotX = -999, lastDotY = -999, dotThrottle = false;

  document.addEventListener('mousemove', (e) => {
    if (dotThrottle) return;
    const dx = e.clientX - lastDotX;
    const dy = e.clientY - lastDotY;
    if (dx * dx + dy * dy < 2500) return; /* min 50 px gap (was 22px) */

    dotThrottle = true;
    setTimeout(() => { dotThrottle = false; }, 80);   /* was 40ms */

    lastDotX = e.clientX;
    lastDotY = e.clientY;

    const size  = 3 + Math.random() * 5;   /* smaller dots */
    const color = DOT_COLS[Math.floor(Math.random() * DOT_COLS.length)];

    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;
      left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      z-index:9930;pointer-events:none;
      opacity:0.45;
      transition:opacity 0.45s ease,transform 0.45s ease;
    `;
    document.body.appendChild(dot);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      dot.style.opacity   = '0';
      dot.style.transform = `scale(0.2)`;
      setTimeout(() => dot.remove(), 500);
    }));
  });

  /* ═══════════════════════════════════════════════════════════
     5. "ON TWOS" PANEL CRACK — brief black-frame stutter
        Fires occasionally on the hero name / title elements,
        mimicking the 12 fps choppy movement of the film.
     ═══════════════════════════════════════════════════════════ */
  const crackEl = document.createElement('div');
  crackEl.style.cssText =
    'position:fixed;inset:0;z-index:9920;pointer-events:none;opacity:0;background:#000;';
  document.body.appendChild(crackEl);

  function onTwosCrack() {
    crackEl.style.transition = 'opacity 0s';
    crackEl.style.opacity    = '0.08';   /* was 0.18 — much subtler */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      crackEl.style.transition = 'opacity 0.08s step-start';
      crackEl.style.opacity    = '0';
    }));
    /* Next crack every 8 – 18 s (was 4–9 s) */
    setTimeout(onTwosCrack, 8000 + Math.random() * 10000);
  }

  /* Start after a short delay so the page loads cleanly */
  setTimeout(onTwosCrack, 6000 + Math.random() * 4000);

})();
