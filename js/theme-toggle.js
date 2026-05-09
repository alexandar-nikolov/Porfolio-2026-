/* =============================================================
   theme-toggle.js
   Comic-book (Spider-Verse) theme — always active.
   - Ensures body.spiderverse is always set
   - Comic POW burst on word clicks
   - Dimension-bleed sketch cycle
   - Panel wipe on section scroll
   ============================================================= */

(function () {
  const STORAGE_KEY  = 'portfolio-theme';
  const SV_CLASS     = 'spiderverse';
  const SKETCH_CLASS = 'sv-sketch-active';

  /* ── Ensure spiderverse is always active ────────────────────── */
  document.documentElement.classList.add(SV_CLASS);
  document.body.classList.add(SV_CLASS);
  localStorage.setItem(STORAGE_KEY, SV_CLASS);

  /* ── Sketch cycle───────────────────────────────────────────── */
  let _sketchDelayTimer  = null;
  let _sketchRepeatTimer = null;

  function doSketch() {
    if (document.getElementById('comic-portal')?.classList.contains('cb-active')) return;
    const body = document.body;
    body.classList.add(SKETCH_CLASS);
    setTimeout(() => body.classList.remove(SKETCH_CLASS), 80);
    setTimeout(() => body.classList.add(SKETCH_CLASS), 160);
    setTimeout(() => body.classList.remove(SKETCH_CLASS), 160 + 1400);
  }

  function startSketchCycle() {
    clearTimeout(_sketchDelayTimer);
    clearInterval(_sketchRepeatTimer);
    _sketchDelayTimer = setTimeout(() => {
      doSketch();
      _sketchRepeatTimer = setInterval(doSketch, 14000);
    }, 10000);
  }

  /* ── POW burst on word click ────────────────────────────────── */
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

  function attachWordBursts() {
    document.querySelectorAll('.word').forEach(word => {
      word.addEventListener('click', (e) => spawnBurst(e.clientX, e.clientY));
    });
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

  /* ── Projects subline text ──────────────────────────────────── */
  function syncSubline() {
    const el = document.querySelector('.proj-subline');
    if (el) el.textContent = 'Pick a dimension — panels reveal issues in that universe.';
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    attachWordBursts();
    injectComicBlanks();
    syncSubline();
    startSketchCycle();

    const observer = new MutationObserver(() => {
      attachWordBursts();
      injectComicBlanks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
