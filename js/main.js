
/* ── Cursor Glow ─────────────────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  let glowRafPending = false;
  let glowX = 0, glowY = 0;
  document.addEventListener('mousemove', (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
    if (!glowRafPending) {
      glowRafPending = true;
      requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate3d(${glowX - 180}px, ${glowY - 180}px, 0)`;
        glowRafPending = false;
      });
    }
  });
}

/* ── Word click burst ────────────────────────────────────────── */
const BURST_COLORS = ['#FF006E','#FFBE0B','#00F5FF','#8AFF2A','#FB5607','#6A00FF'];
const BURST_DURATION = 600;

document.querySelectorAll('.word').forEach((word) => {
  word.addEventListener('click', () => {
    const color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
    word.style.color            = color;
    word.style.webkitTextStroke = 'none';
    word.style.transform        = 'scale(1.4) skewX(-8deg)';
    word.style.filter           = `brightness(2) drop-shadow(0 0 30px ${color})`;
    setTimeout(() => {
      word.style.color            = '';
      word.style.webkitTextStroke = '';
      word.style.transform        = '';
      word.style.filter           = '';
    }, BURST_DURATION);
  });
});

/* ── Auto-transition after 10 s — split-panel snapshot ──────── */
const TRANSITION_DELAY = 10_000;

setTimeout(() => {
  const SLIDE_DUR = 1400;
  const BALL_TIME = 2400;

  function makePanel(isTop) {
    const panel = document.createElement('div');
    panel.className = `split-panel ${isTop ? 'top' : 'bottom'}`;

    const clone = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const c = el.cloneNode(true);
      c.style.position = 'absolute';
      c.style.top      = isTop ? '0' : '-100vh';
      c.style.bottom   = 'auto';
      panel.appendChild(c);
    };
    ['.bg','.grid','.scanline','.diag-text.d1','.diag-text.d2',
     '.corner.tl','.corner.tr','.corner.bl','.corner.br',
     '.side-run.left','.side-run.right','.stage'].forEach(clone);
    return panel;
  }

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:998;pointer-events:none;';

  const topPanel    = makePanel(true);
  const bottomPanel = makePanel(false);

  document.body.append(overlay, topPanel, bottomPanel);

  /* Force reflow then kick off slide */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    topPanel.classList.add('open');
    bottomPanel.classList.add('open');
  }));

  setTimeout(() => window.location.replace('mainpage.html'), SLIDE_DUR + 80);

}, TRANSITION_DELAY);