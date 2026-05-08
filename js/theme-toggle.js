/* =============================================================
   theme-toggle.js
   Spider-Verse ↔ Cyberpunk theme switcher.
   - Reads / writes localStorage key "portfolio-theme"
   - Applies body.spiderverse class
   - Ink-blot transition from the button's position on switch
   - Comic POW burst on word clicks in Spider-Verse mode
   - Dimension-bleed sketch cycle in Spider-Verse mode
   ============================================================= */

(function () {
  const STORAGE_KEY  = 'portfolio-theme';
  const SV_CLASS     = 'spiderverse';
  const SKETCH_CLASS = 'sv-sketch-active';

  /* ── Apply saved theme immediately (before DOMContentLoaded)
        to prevent FOUC on page load ────────────────────────── */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === SV_CLASS) {
    document.documentElement.classList.add(SV_CLASS);
    document.body.classList.add(SV_CLASS);
  }

  /* ── Helper — is SV active right now? ──────────────────────── */
  function isSV() {
    return document.body.classList.contains(SV_CLASS);
  }

  /* ── Panel wipe on section scroll (SV mode only) ───────────────
     An IntersectionObserver fires a comic-panel wipe animation
     each time a new section first scrolls into view.
     The wipe only triggers after the user has started scrolling
     (skips the first paint) and only once per section per load. */
  function triggerPanelWipe() {
    const el = document.createElement('div');
    el.className = 'sv-panel-wipe';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  function initPanelWipes() {
    const sections = document.querySelectorAll('section');
    if (!sections.length) return;

    const seen = new WeakSet();
    let hasScrolled = false;
    window.addEventListener('scroll', () => { hasScrolled = true; },
                            { once: true, passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting
            && hasScrolled
            && isSV()
            && !seen.has(entry.target)) {
          seen.add(entry.target);
          observer.unobserve(entry.target);
          triggerPanelWipe();
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Sketch cycle ───────────────────────────────────────────
     Adds body.sv-sketch-active to trigger the CSS class-based
     sketch override (white paper + black ink + grayscale images).
     Timing: first flash after 10s, then every 14s.
     Each flash: 3× rapid stutter, then hold for 1.8s, then snap back. */
  let _sketchDelayTimer    = null;
  let _sketchRepeatTimer   = null;

  function doSketch() {
    if (!isSV()) return;
    const body = document.body;

    /* 3-pulse stutter before locking in */
    const stutterMs = [0, 110, 220, 330];
    stutterMs.forEach((t, i) => {
      setTimeout(() => {
        if (i % 2 === 0) body.classList.add(SKETCH_CLASS);
        else             body.classList.remove(SKETCH_CLASS);
      }, t);
    });

    /* Lock into sketch at 440ms, hold for 1.8s, then snap back */
    setTimeout(() => {
      body.classList.add(SKETCH_CLASS);
      setTimeout(() => body.classList.remove(SKETCH_CLASS), 1800);
    }, 440);
  }

  function startSketchCycle() {
    stopSketchCycle();
    /* First flash after 10s, then every 14s */
    _sketchDelayTimer = setTimeout(() => {
      doSketch();
      _sketchRepeatTimer = setInterval(doSketch, 14000);
    }, 10000);
  }

  function stopSketchCycle() {
    clearTimeout(_sketchDelayTimer);
    clearInterval(_sketchRepeatTimer);
    _sketchDelayTimer  = null;
    _sketchRepeatTimer = null;
    document.body.classList.remove(SKETCH_CLASS);
  }

  /* ── Ink-blot / circle-expand transition ────────────────────
     Grows a coloured circle out from the button, then contracts.
     Theme class is applied mid-flight so the new theme "grows in". */
  function inkBlotSwitch(btnEl, toSV, onMidpoint) {
    const rect = btnEl.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    const overlay = document.createElement('div');
    overlay.className = 'sv-ink-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:99999; pointer-events:none;
      background:${toSV ? '#E23636' : '#0D0D0D'};
      clip-path:circle(0% at ${cx}px ${cy}px);
      transition: clip-path 0.45s cubic-bezier(0.4,0,0.6,1);
    `;
    document.body.appendChild(overlay);

    /* Phase 1 — expand */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(160% at ${cx}px ${cy}px)`;
      });
    });

    /* Midpoint — apply theme while screen is covered */
    setTimeout(() => {
      onMidpoint();

      /* Phase 2 — contract */
      overlay.style.transition = 'clip-path 0.4s cubic-bezier(0.4,0,0.6,1)';
      overlay.style.clipPath   = `circle(0% at ${cx}px ${cy}px)`;

      setTimeout(() => overlay.remove(), 440);
    }, 460);
  }

  /* ── POW burst on word click (SV mode only) ─────────────────
     Spawns a random comic action word at the click position. */
  const BURST_WORDS  = ['POW!', 'ZAP!', 'BAM!', 'THWIP!', 'WHAM!', 'KAPOW!', 'SNAP!'];
  const BURST_COLORS = ['#F7C948', '#E23636', '#1A3A8F', '#FF6B35'];

  function spawnBurst(x, y) {
    const word = BURST_WORDS[Math.floor(Math.random() * BURST_WORDS.length)];
    const clr  = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
    const el   = document.createElement('span');
    el.className = 'sv-burst';
    el.textContent = word;
    el.style.left  = x + 'px';
    el.style.top   = y + 'px';
    el.style.color = clr;
    el.style.transform = `translate(-50%,-50%) scale(0) rotate(${Math.random() * 20 - 10}deg)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }

  /* ── Attach word-click POW bursts ───────────────────────────── */
  function attachWordBursts() {
    document.querySelectorAll('.word').forEach(word => {
      word.addEventListener('click', (e) => {
        if (!isSV()) return;
        spawnBurst(e.clientX, e.clientY);
      });
    });
  }

  /* ── Build the toggle button ────────────────────────────────── */
  function buildButton() {
    const btn = document.createElement('button');
    btn.className     = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle theme');
    updateLabel(btn);
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      const goSV = !isSV();

      inkBlotSwitch(btn, goSV, () => {
        /* apply / remove class at midpoint */
        document.body.classList.toggle(SV_CLASS, goSV);
        document.documentElement.classList.toggle(SV_CLASS, goSV);
        localStorage.setItem(STORAGE_KEY, goSV ? SV_CLASS : 'cyberpunk');
        updateLabel(btn);
        syncSubline();
        /* start or stop the sketch cycle */
        if (goSV) startSketchCycle();
        else      stopSketchCycle();
      });
    });

    return btn;
  }

  function updateLabel(btn) {
    btn.innerHTML = isSV()
      ? '⚡ SWITCH TO CYBERPUNK'
      : '🕷 SWITCH TO SPIDER-VERSE';
  }

  /* ── Init on DOM ready ──────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Inject blank comic panel placeholders ──────────────────── */
  function injectComicBlanks() {
    document.querySelectorAll('.billboard .bb-inner').forEach(inner => {
      if (inner.querySelector('.sv-comic-blank')) return;
      const blank = document.createElement('div');
      blank.className = 'sv-comic-blank';
      blank.innerHTML =
        '<span class="sv-blank-q">?</span>' +
        '<span class="sv-blank-label">NO ISSUES<br>ON FILE</span>';
      inner.appendChild(blank);
    });
  }

  /* ── Swap projects subline text for SV / cyberpunk ────────────── */
  const SUBLINE_SV  = 'Pick a dimension — panels reveal issues in that universe.';
  const SUBLINE_CYB = 'Select a filter — billboards tune in to matching projects.';
  function syncSubline() {
    const el = document.querySelector('.proj-subline');
    if (!el) return;
    el.textContent = isSV() ? SUBLINE_SV : SUBLINE_CYB;
  }

  function init() {
    const btn = buildButton();
    attachWordBursts();
    injectComicBlanks();
    syncSubline();

    /* Start sketch cycle if SV is already active (saved preference) */
    if (isSV()) startSketchCycle();

    /* Re-attach bursts after any dynamic content loads */
    const observer = new MutationObserver(() => attachWordBursts());
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
