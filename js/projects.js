'use strict';
/* ════════════════════════════════════════════════════════════════
   PROJECTS — TV Screen Wall (4 × 2 FBI Ops Room Redesign)
   · TVStaticShader  — Canvas 2D noise (analog static + artifacts)
   · TVScreen        — per-screen state machine (static ↔ live)
   · ProjectsSection — filter controller + FBI case-file overlay
   ════════════════════════════════════════════════════════════════ */

/* ── Project data ──────────────────────────────────────────────── */
const PROJECTS = [
  {
    title: 'Portfolio 2026',
    desc: 'A maximalist developer portfolio featuring WebGL post-FX shaders, Matter.js physics, immersive glitch animations, and a full custom rendering pipeline.',
    details: 'Built from scratch with zero frameworks — pure HTML, CSS, and vanilla JS. Features a custom WebGL fragment shader, SVG chromatic aberration filters, and physics-based UI elements.',
    image: 'images/portfolio.png',
    tags: ['javascript', 'css', 'design'],
    tech: ['JavaScript', 'Matter.js', 'WebGL', 'CSS Animations'],
    url: '#home',
    github: 'https://github.com/Kambo22',
  },
  {
    title: 'Athina Website',
    desc: 'Full design and development of a brand website for Athina Amsterdam — responsive layouts, custom animations, brand-consistent visual identity.',
    details: 'Complete web presence from concept to deployment. Custom scroll animations, mobile-first responsive grid, and interactive product showcases.',
    image: 'images/AthinaWebsite.png',
    tags: ['javascript', 'css'],
    tech: ['JavaScript', 'HTML5', 'CSS', 'Responsive Design'],
    url: '#',
    github: '#',
  },
  {
    title: 'Klooigeld App',
    desc: 'Interactive React web application with modern component architecture, React hooks state management, and a clean financial tracking interface.',
    details: 'React SPA with component-driven architecture, hooks for state management, and a responsive dashboard layout for personal finance tracking.',
    image: 'images/klooigeld.png',
    tags: ['react', 'javascript', 'css'],
    tech: ['React', 'JavaScript', 'CSS Modules', 'Vite'],
    url: '#',
    github: '#',
  },
  {
    title: 'NFC Card Game',
    desc: 'Android game leveraging NFC technology — tap physical cards to trigger in-game events. Built in Kotlin with Android Studio.',
    details: 'Kotlin Android app with NFC tag reading, custom card registration, game state management, and a real-time battle system triggered by NFC card taps.',
    image: 'images/nfcgame.png',
    tags: ['kotlin'],
    tech: ['Kotlin', 'Android SDK', 'NFC API', 'SQLite'],
    url: '#',
    github: '#',
  },
  {
    title: 'Figma UI Design',
    desc: 'High-fidelity interactive prototype — from research and wireframes to a complete click-through demo with full design system documentation.',
    details: 'Complete design process: user research, wireframes, component library, high-fidelity mockups, and interactive prototype. Includes design system with tokens and documentation.',
    image: 'images/Figma_website.png',
    tags: ['design', 'css'],
    tech: ['Figma', 'Design Systems', 'UX Research', 'Prototyping'],
    url: '#',
    github: '#',
  },
  {
    title: 'UI Prototype Sprint',
    desc: 'Rapid prototyping sprint — concept to interactive click-through in 48 hours, including user flow mapping and responsive wireframes.',
    details: 'Fast-paced prototype built for stakeholder presentation. Demonstrates navigation flows, key interactions, and visual hierarchy across mobile and desktop.',
    image: 'images/prototype1.png',
    tags: ['design'],
    tech: ['Figma', 'User Flows', 'Wireframing', 'Rapid Prototyping'],
    url: '#',
    github: '#',
  },
  {
    title: 'Responsive Website',
    desc: 'Mobile-first responsive website using semantic HTML5 and modern CSS Grid/Flexbox — no frameworks, pixel-perfect across all breakpoints.',
    details: 'Built with semantic HTML5, CSS custom properties, Grid and Flexbox layouts, fluid typography, and optimised assets for fast load times.',
    image: 'images/Website.png',
    tags: ['css', 'javascript'],
    tech: ['HTML5', 'CSS Grid', 'Flexbox', 'Vanilla JS'],
    url: '#',
    github: '#',
  },
  {
    title: 'Git Workflow Project',
    desc: 'Collaborative development project showcasing advanced branching strategies, CI pipeline configuration, and structured code review workflows.',
    details: 'Team project with feature branch workflow, pull request reviews, automated testing on CI, semantic versioning, and comprehensive commit history.',
    image: 'images/git.jpg',
    tags: ['javascript'],
    tech: ['Git', 'GitHub Actions', 'CI/CD', 'JavaScript'],
    url: '#',
    github: '#',
  },
];

/* ════════════════════════════════════════════════════════════════
   TV STATIC SHADER — Canvas 2D
   Draws authentic analog TV noise:
     • biased-dark random pixel noise (snow)
     • occasional bright horizontal sync bars
     • per-row luminance roll artifact
     • subtle warm colour noise (slight R/B channel bias)
     • vignette darkening toward edges
   All screens share ONE rAF loop; each shader draws at ~20 fps.
   ════════════════════════════════════════════════════════════════ */
class TVStaticShader {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.W       = canvas.width;   // 160
    this.H       = canvas.height;  // 100
    this.running = false;
    this.rollY   = 0;              // vertical roll offset
    this._tickTs = 0;
    this._raf    = null;

    /* Pre-build vignette LUT (one float per pixel) */
    this._vig = new Float32Array(this.W * this.H);
    this._buildVignette();
  }

  _buildVignette() {
    const { W, H, _vig } = this;
    for (let y = 0; y < H; y++) {
      const ny = (y / (H - 1)) * 2 - 1;
      for (let x = 0; x < W; x++) {
        const nx = (x / (W - 1)) * 2 - 1;
        /* Egg-shaped vignette — stronger at corners */
        _vig[y * W + x] = 1 - Math.min(1, (nx * nx * 0.6 + ny * ny * 0.55) * 0.7);
      }
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    TVStaticShader._pool.add(this);
    TVStaticShader._ensureLoop();
  }

  stop() {
    this.running = false;
    TVStaticShader._pool.delete(this);
  }

  draw(ts) {
    /* Throttle to ~22 fps */
    if (ts - this._tickTs < 44) return;
    this._tickTs = ts;

    const { ctx, W, H, _vig } = this;
    const img = ctx.createImageData(W, H);
    const d   = img.data;

    /* Occasional sync roll */
    if (Math.random() < 0.025) this.rollY = (Math.random() * H * 0.5) | 0;
    else if (this.rollY > 0)   this.rollY = (this.rollY - 1.8) | 0;

    /* Occasional bright bar (horizontal sync artifact) */
    const barY = Math.random() < 0.07 ? (Math.random() * H) | 0 : -1;
    const barH = 1 + (Math.random() * 4) | 0;

    for (let y = 0; y < H; y++) {
      /* Vertical roll: source row is offset */
      const srcY = (y + this.rollY) % H;

      /* Scanline darkness (alternating rows slightly dimmer) */
      const scan = (y & 1) ? 0.80 : 1.0;

      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) << 2;

        let v;
        if (y >= barY && y < barY + barH) {
          /* Sync bar: near-white burst */
          v = 190 + (Math.random() * 65);
        } else {
          /*
           * Biased-dark noise:
           *   ~65% of pixels fall in the 0-55 range (dark snow)
           *   ~35% spread toward full white
           * This matches the look of an untuned analogue channel.
           */
          const r = Math.random();
          v = r < 0.65 ? r * 85 : r * 255;
        }

        /* Apply vignette and scanline */
        v = v * _vig[srcY * W + x] * scan;

        /*
         * Warm colour split — red channel biased slightly warm,
         * blue slightly cool.  Creates the "aging phosphor" look.
         * mix-blend-mode:screen on the canvas reverses dark pixels
         * to transparency (reverse rendering technique).
         */
        d[idx]     = Math.min(255, v + (Math.random() - 0.5) * 14) | 0; // R
        d[idx + 1] = Math.min(255, v + (Math.random() - 0.5) *  9) | 0; // G
        d[idx + 2] = Math.min(255, v + (Math.random() - 0.5) * 18) | 0; // B
        d[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    /* Glitch tear line (sharp bright horizontal scratch) */
    if (Math.random() < 0.11) {
      const gy = (Math.random() * H) | 0;
      const r  = (155 + Math.random() * 100) | 0;
      const g  = (155 + Math.random() * 100) | 0;
      const b  = (155 + Math.random() * 100) | 0;
      ctx.fillStyle = `rgba(${r},${g},${b},0.45)`;
      ctx.fillRect(0, gy, W, 1 + (Math.random() * 2) | 0);
    }
  }
}

/* Shared rAF pool — one loop drives every active shader */
TVStaticShader._pool = new Set();
TVStaticShader._loopRunning = false;

TVStaticShader._ensureLoop = function () {
  if (TVStaticShader._loopRunning) return;
  TVStaticShader._loopRunning = true;
  function loop(ts) {
    TVStaticShader._pool.forEach(s => s.draw(ts));
    if (TVStaticShader._pool.size > 0) requestAnimationFrame(loop);
    else TVStaticShader._loopRunning = false;
  }
  requestAnimationFrame(loop);
};

/* ════════════════════════════════════════════════════════════════
   TV SCREEN STATE MACHINE
   States: 'static' → 'tuning-in' → 'live' → 'tuning-out' → 'static'
   ════════════════════════════════════════════════════════════════ */
class TVScreen {
  constructor(el, project, index) {
    this.el      = el;
    this.project = project;
    this.index   = index;
    this.state   = 'static';

    /* Cache child elements */
    this._display = el.querySelector('.tv-display');
    this._canvas  = el.querySelector('.tv-static-canvas');
    this._img     = el.querySelector('.tv-project-img');
    this._info    = el.querySelector('.tv-info');

    /* Populate project data into the small screen overlay */
    this._img.src = project.image;
    this._img.alt = project.title;
    el.querySelector('.tv-project-title').textContent = project.title;
    el.querySelector('.tv-project-desc').textContent  = project.desc;
    el.querySelector('.tv-project-tags').innerHTML    =
      project.tags.map(t => `<span>${t.toUpperCase()}</span>`).join('');
    /* .tv-project-link is now a <button> — no href to set */

    /* Static shader */
    this._shader = new TVStaticShader(this._canvas);
    this._shader.start();
  }

  /* ── Tune in: static → live ─────────────────────────────────── */
  tuneIn(delay = 0) {
    if (this.state === 'live' || this.state === 'tuning-in') return;
    this.state = 'tuning-in';

    setTimeout(() => {
      const d = this._display;

      d.style.transition = 'transform 110ms ease-in, filter 110ms ease-in';
      d.style.transform  = 'scaleY(0.025)';
      d.style.filter     = 'brightness(5) saturate(0)';

      setTimeout(() => {
        this._shader.stop();
        this._canvas.style.opacity = '0';
        this._img.style.opacity    = '1';

        d.style.transition = 'none';
        d.style.transform  = 'scaleY(0.025)';

        requestAnimationFrame(() => {
          this.el.classList.add('tv-tuning-in');
          d.style.transition = '';
          d.style.transform  = '';
          d.style.filter     = '';

          setTimeout(() => {
            this.el.classList.remove('tv-tuning-in');
            this.el.classList.add('tv-live');
            this.state = 'live';
          }, 580);
        });
      }, 120);
    }, delay);
  }

  /* ── Tune out: live → static ────────────────────────────────── */
  tuneOut(delay = 0) {
    if (this.state === 'static' || this.state === 'tuning-out') return;
    this.state = 'tuning-out';

    setTimeout(() => {
      const d = this._display;

      this.el.classList.remove('tv-live');
      this.el.classList.add('tv-tuning-out');

      setTimeout(() => {
        this.el.classList.remove('tv-tuning-out');
        d.style.transition = 'none';
        d.style.transform  = 'scaleY(0.025)';
        d.style.filter     = 'brightness(5) saturate(0)';

        this._img.style.opacity    = '0';
        this._canvas.style.opacity = '1';
        this._shader.start();

        requestAnimationFrame(() => {
          d.style.transition = 'transform 300ms cubic-bezier(0.16,1,0.3,1), filter 350ms ease-out';
          d.style.transform  = 'scaleY(1)';
          d.style.filter     = 'brightness(1)';

          setTimeout(() => {
            d.style.transition = '';
            d.style.transform  = '';
            d.style.filter     = '';
            this.state = 'static';
          }, 380);
        });
      }, 400);

      this.el.classList.add('tv-static-burst');
      setTimeout(() => this.el.classList.remove('tv-static-burst'), 650);
    }, delay);
  }

  /* ── Power-on reveal ────────────────────────────────────────── */
  powerOn(delay = 0) {
    const d = this._display;
    d.style.transition = 'none';
    d.style.transform  = 'scaleY(0.02)';
    d.style.filter     = 'brightness(0)';
    setTimeout(() => {
      d.style.transition = 'transform 350ms cubic-bezier(0.16,1,0.3,1), filter 400ms ease-out';
      d.style.transform  = 'scaleY(1)';
      d.style.filter     = 'brightness(1)';
      setTimeout(() => {
        d.style.transition = '';
        d.style.transform  = '';
        d.style.filter     = '';
      }, 420);
    }, delay);
  }
}

/* ════════════════════════════════════════════════════════════════
   PROJECTS SECTION CONTROLLER
   ════════════════════════════════════════════════════════════════ */
class ProjectsSection {
  constructor() {
    this.screens        = [];
    this.activeFilter   = 'all';
    this._booted        = false;
    this._tsInterval    = null;
    this._activeProject = null;

    this._build();
    this._bindFilters();
    this._bindExpand();
    this._observeSection();
  }

  _build() {
    document.querySelectorAll('.tv-screen-sm[data-index]').forEach(el => {
      const i = parseInt(el.dataset.index, 10);
      const p = PROJECTS[i];
      if (!p) return;
      this.screens.push(new TVScreen(el, p, i));
    });
  }

  _bindFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        this._setStatus(filter);
        this._applyFilter(filter);
      });
    });
  }

  /* ── FBI Case File Overlay ────────────────────────────────────── */
  _bindExpand() {
    /* Click anywhere on a live screen to open the case file */
    document.querySelectorAll('.tv-screen-sm').forEach(el => {
      el.addEventListener('click', () => {
        if (!el.classList.contains('tv-live')) return;
        const i = parseInt(el.dataset.index, 10);
        const p = PROJECTS[i];
        if (p) this._openCase(p, i);
      });
    });

    /* Close via button or backdrop click */
    const closeBtn  = document.getElementById('fbiCloseBtn');
    const overlayBg = document.getElementById('fbiOverlayBg');
    if (closeBtn)  closeBtn.addEventListener('click',  () => this._closeCase());
    if (overlayBg) overlayBg.addEventListener('click', () => this._closeCase());

    /* Esc key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this._closeCase();
    });
  }

  _openCase(project, index) {
    const overlay = document.getElementById('fbiOverlay');
    if (!overlay) return;

    /* Populate header */
    const caseNum = document.getElementById('fbiCaseNum');
    if (caseNum) caseNum.textContent = `#${String(index + 1).padStart(3, '0')}`;

    /* Populate image */
    const img = document.getElementById('fbiCaseImg');
    if (img) { img.src = project.image; img.alt = project.title; }

    /* Populate info */
    const title   = document.getElementById('fbiCaseTitle');
    const desc    = document.getElementById('fbiCaseDesc');
    const details = document.getElementById('fbiCaseDetails');
    const tags    = document.getElementById('fbiCaseTags');
    const tech    = document.getElementById('fbiCaseTech');
    const link    = document.getElementById('fbiCaseLink');
    const gh      = document.getElementById('fbiCaseGh');
    if (title)   title.textContent = project.title;
    if (desc)    desc.textContent  = project.desc;
    if (details) details.textContent = project.details || '';
    if (tags)    tags.innerHTML    = project.tags.map(t => `<span>${t.toUpperCase()}</span>`).join('');
    if (tech)    tech.innerHTML    = (project.tech || []).map(t => `<span>${t}</span>`).join('');
    if (link)    link.href         = project.url;

    /* GitHub link — hide if not set */
    if (gh) {
      if (project.github && project.github !== '#') {
        gh.href = project.github;
        gh.classList.remove('hidden');
      } else {
        gh.href = '#';
        gh.classList.add('hidden');
      }
    }

    /* HUD details */
    const ch = document.getElementById('fbiCaseChannel');
    if (ch) ch.textContent = `CH.${String(index + 1).padStart(2, '0')}`;

    const coords = document.getElementById('fbiCoords');
    if (coords) {
      const rx = (Math.random() * 9999 | 0).toString().padStart(4, '0');
      const ry = (Math.random() * 9999 | 0).toString().padStart(4, '0');
      coords.textContent = `X: ${rx} / Y: ${ry}`;
    }

    this._startTimestamp();
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('fbi-open');
    document.body.style.overflow = 'hidden';
    this._activeProject = project;
  }

  _closeCase() {
    const overlay = document.getElementById('fbiOverlay');
    if (!overlay || !overlay.classList.contains('fbi-open')) return;
    overlay.classList.remove('fbi-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this._stopTimestamp();
    this._activeProject = null;
  }

  _startTimestamp() {
    const el = document.getElementById('fbiTimestamp');
    if (!el) return;
    this._stopTimestamp();
    const tick = () => {
      const n = new Date();
      el.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2, '0')).join(':');
    };
    tick();
    this._tsInterval = setInterval(tick, 1000);
  }

  _stopTimestamp() {
    if (this._tsInterval) { clearInterval(this._tsInterval); this._tsInterval = null; }
  }

  /* ── Filter status scramble ──────────────────────────────────── */
  _setStatus(filter) {
    const el = document.querySelector('.filter-status-text');
    if (!el) return;
    const label  = filter === 'all' ? 'ALL CHANNELS' : filter.toUpperCase();
    const target = `SIGNAL: ${label}`;
    const CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ:./_ ';
    let frame = 0;
    const total = 10;
    const id = setInterval(() => {
      el.textContent = target.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        return frame >= total * (i / target.length + 0.5)
          ? ch
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      frame++;
      if (frame > total * 1.6) { el.textContent = target; clearInterval(id); }
    }, 30);
  }

  _applyFilter(filter) {
    this.activeFilter = filter;
    let matchIdx = 0;
    this.screens.forEach(screen => {
      const matches = filter === 'all' || screen.project.tags.includes(filter);
      if (matches) {
        screen.tuneIn(matchIdx * 130);
        matchIdx++;
      } else {
        screen.tuneOut(Math.random() * 100);
      }
    });
  }

  _observeSection() {
    const section = document.getElementById('projects');
    if (!section) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this._booted) {
          this._booted = true;
          obs.disconnect();

          /* Stagger scroll-reveal (CSS translateY → 0) */
          this.screens.forEach((s, i) => {
            setTimeout(() => s.el.classList.add('tv-revealed'), i * 75 + 80);
          });

          /* Stagger tune-in after reveal begins */
          this.screens.forEach((s, i) => s.tuneIn(i * 100 + 280));
        }
      });
    }, { threshold: 0.1 });

    obs.observe(section);
  }
}

/* ── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.tv-screen-sm')) {
    new ProjectsSection();
  }
});
