
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top  = `${e.clientY}px`;
});

/* ── Word Click Burst ─────────────────────────────────────── */
const BURST_COLORS = [
  '#FF006E', 
  '#FFBE0B', 
  '#00F5FF', 
  '#8AFF2A', 
  '#FB5607', 
  '#6A00FF', 
];

const BURST_DURATION = 600; // ms

document.querySelectorAll('.word').forEach((word) => {
  word.addEventListener('click', () => {
    const color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];

    word.style.color             = color;
    word.style.webkitTextStroke  = 'none';
    word.style.transform         = 'scale(1.4) skewX(-8deg)';
    word.style.filter            = `brightness(2) drop-shadow(0 0 30px ${color})`;

    setTimeout(() => {
      word.style.color            = '';
      word.style.webkitTextStroke = '';
      word.style.transform        = '';
      word.style.filter           = '';
    }, BURST_DURATION);
  });
});

/* ── Page Transition (→ game after 10 s) ─────────────────── */
const TRANSITION_DELAY = 10_000;

setTimeout(() => {
  const SLIDE_DUR = 1400;
  const BALL_TIME = 2400;

  /* Snapshot the full page into a split panel showing top or bottom half */
  function makePanel(isTop) {
    const panel = document.createElement('div');
    panel.className = `split-panel ${isTop ? 'top' : 'bottom'}`;

    /* Container represents the full viewport, clipped to the panel's half */
    const snapshot = document.createElement('div');
    Object.assign(snapshot.style, {
      position:      'absolute',
      top:           isTop ? '0' : '-50vh',
      left:          '0',
      width:         '100vw',
      height:        '100vh',
      overflow:      'hidden',
      pointerEvents: 'none',
    });

    /* Clone every visual layer in z-order */
    ['.bg', '.grid', '.scanline', '.diag-text', '.corner', '.side-run', '.stage']
      .forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          const clone = el.cloneNode(true);
          const cs    = window.getComputedStyle(el);

          /* Fixed elements must become absolute so they position within
             the snapshot container rather than the real viewport */
          if (cs.position === 'fixed') {
            clone.style.position = 'absolute';
            clone.style.top      = cs.top;
            clone.style.left     = cs.left;
            clone.style.right    = cs.right;
            clone.style.bottom   = cs.bottom;
            clone.style.width    = cs.width;
            clone.style.height   = cs.height;
          }

          /* Freeze all animations — clean snapshot of the page */
          clone.style.animationPlayState = 'paused';
          clone.querySelectorAll('*').forEach(
            child => (child.style.animationPlayState = 'paused')
          );

          snapshot.appendChild(clone);
        });
      });

    panel.appendChild(snapshot);
    return panel;
  }

  /* Realistic SVG basketball */
  const ballSVG = `<svg class="ball-cart" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgrad" cx="34%" cy="28%" r="72%">
        <stop offset="0%"   stop-color="#FFCB80"/>
        <stop offset="25%"  stop-color="#F07828"/>
        <stop offset="60%"  stop-color="#C85010"/>
        <stop offset="100%" stop-color="#7A2000"/>
      </radialGradient>
      <radialGradient id="sheen" cx="30%" cy="22%" r="42%">
        <stop offset="0%"   stop-color="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <clipPath id="bc"><circle cx="50" cy="50" r="43"/></clipPath>
    </defs>
    <circle cx="50" cy="50" r="43" fill="url(#bgrad)"/>
    <path d="M7 50 Q29 20 50 50 Q71 80 93 50" fill="none" stroke="#3A1200" stroke-width="2.2" stroke-linecap="round" clip-path="url(#bc)"/>
    <path d="M7 50 Q29 80 50 50 Q71 20 93 50" fill="none" stroke="#3A1200" stroke-width="2.2" stroke-linecap="round" clip-path="url(#bc)"/>
    <line x1="50" y1="7" x2="50" y2="93" stroke="#3A1200" stroke-width="2.2" stroke-linecap="round" clip-path="url(#bc)"/>
    <circle cx="50" cy="50" r="43" fill="url(#sheen)"/>
    <circle cx="50" cy="50" r="43" fill="none" stroke="#2A0E00" stroke-width="1.5"/>
  </svg>`;

  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.innerHTML = ballSVG + '<div class="load-text">Loading...</div>';

  const topPanel    = makePanel(true);
  const bottomPanel = makePanel(false);

  document.body.append(loader, topPanel, bottomPanel);

  /* Trigger the split on next paint */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    topPanel.classList.add('open');
    bottomPanel.classList.add('open');
  }));

  /* Fade in the ball + text once the panels have finished sliding */
  setTimeout(() => loader.classList.add('visible'), SLIDE_DUR + 80);


  setTimeout(() => {
    window.location.replace('game.html');
  }, SLIDE_DUR + 80 + BALL_TIME);

}, TRANSITION_DELAY);
