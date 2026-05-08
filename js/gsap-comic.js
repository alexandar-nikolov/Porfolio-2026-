/**
 * gsap-comic.js  —  GSAP Comic Book Animation System
 *
 * Inspired by Spider-Into the Spider-Verse + Sin City cinematic aesthetics.
 * All animations follow the two-step SLAM → SETTLE rhythm:
 *   Step 1 · Hard overshoot / impact  (power4.out, ~0.1–0.2s)
 *   Step 2 · Elastic settle / ink dry (elastic.out,  ~0.2–0.3s)
 *
 * Animations:
 *   1.  Panel Stamp        — section headers slam in with inked overshoot
 *   2.  Billboard Slam     — project cards thrown into position
 *   3.  Name on Twos       — choppy 12fps Spider-Verse hero jitter
 *   4.  Impact Starburst   — GSAP POW! with 16-pt starburst shape
 *   5.  Speed Scroll Lines — radial lines burst on fast scroll velocity
 *   6.  Skill Card Throw   — ft-items arc in like thrown panels
 *   7.  Meanwhile Panel    — "MEANWHILE…" comic transition strips
 *   8.  Speech Bubble Nav  — elastic nav tooltips on hover
 *   9.  Dimension Glitch   — RGB channel split on section change
 *  10.  Loading Letterpress — stamps loader letters one by one
 */
(function () {
  'use strict';

  /* ── Guard: GSAP required ─────────────────────────────────── */
  if (typeof gsap === 'undefined') {
    console.warn('[gsap-comic] GSAP not loaded — animations skipped.');
    return;
  }

  const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
  const hasCustomEase    = typeof CustomEase    !== 'undefined';

  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (hasCustomEase)    gsap.registerPlugin(CustomEase);

  /* ── Custom Eases ─────────────────────────────────────────── */
  if (hasCustomEase) {
    /* Hard overshoot like an ink stamp slamming down */
    CustomEase.create('comicSlam',   'M0,0 C0.16,0 0.04,1.42 1,1');
    /* Fast ink wipe sweep — aggressive then settle */
    CustomEase.create('inkWipe',     'M0,0 C0.88,0 0.06,1 1,1');
    /* Elastic snap-back like a rubber panel */
    CustomEase.create('comicSnap',   'M0,0 C0.5,1.6 0.7,1 1,1');
  }

  const EASE_SLAM   = hasCustomEase ? 'comicSlam'   : 'power4.out';
  const EASE_WIPE   = hasCustomEase ? 'inkWipe'     : 'power3.inOut';

  /* ═══════════════════════════════════════════════════════════
     1. PANEL STAMP — section headers enter like panels slapped
        onto a light table. Bold overshoot → elastic settle.
     ═══════════════════════════════════════════════════════════ */
  function initPanelStamp() {
    if (!hasScrollTrigger) return;

    /* Section numbers + headers */
    document.querySelectorAll('.section-header').forEach((hdr) => {
      if (hdr.dataset.gsapDone) return;
      hdr.dataset.gsapDone = '1';

      gsap.timeline({
        scrollTrigger: {
          trigger: hdr,
          start: 'top 82%',
          once: true,
        },
      })
      /* Step 1 — SLAM: crash down fast with skew */
      .from(hdr, {
        y: 70, skewY: 5, scaleY: 1.12,
        duration: 0.18, ease: EASE_SLAM,
        transformOrigin: 'center bottom',
        clearProps: 'all',
      })
      /* Step 2a — rebound compression */
      .to(hdr, {
        scaleY: 0.96, skewY: -1.5,
        duration: 0.08, ease: 'power2.in',
      })
      /* Step 2b — elastic settle */
      .to(hdr, {
        scaleY: 1, skewY: 0,
        duration: 0.25, ease: 'elastic.out(1.1, 0.4)',
      });
    });

    /* Ghost background section words — wiped in from left */
    document.querySelectorAll('.section-bg-word').forEach((el) => {
      if (el.dataset.gsapDone) return;
      el.dataset.gsapDone = '1';

      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
        x: -120, skewX: -6,
        duration: 0.65, ease: EASE_SLAM,
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. BILLBOARD SLAM — project cards thrown like comic panels
     ═══════════════════════════════════════════════════════════ */
  function initBillboardSlam() {
    if (!hasScrollTrigger) return;

    /* ScrollTrigger.batch groups multiple triggers into one RAF calculation */
    ScrollTrigger.batch('.billboard:not([data-gsap-done])', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        const allCards = Array.from(document.querySelectorAll('.billboard'));
        batch.forEach((card) => {
          if (card.dataset.gsapDone) return;
          card.dataset.gsapDone = '1';
          const i = allCards.indexOf(card);
          const fromLeft = i % 2 === 0;
          const xFrom    = fromLeft ? -80 : 80;
          const rotFrom  = fromLeft ? -6  : 6;
          const delay    = (i % 3) * 0.05;

          gsap.timeline()
            .from(card, {
              x: xFrom, y: 45, rotation: rotFrom,
              scale: 0.88,
              duration: 0.2, ease: EASE_SLAM, delay,
            })
            .to(card, {
              x: fromLeft ? 8 : -8, rotation: fromLeft ? 1.5 : -1.5,
              scale: 1.03,
              duration: 0.09, ease: 'power2.out',
            })
            .to(card, {
              x: 0, rotation: 0, scale: 1,
              duration: 0.2, ease: 'elastic.out(1.1, 0.35)',
            });
        });
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════
     3. NAME ON TWOS — choppy Spider-Verse 12fps jitter on hero
        Fires once, after the entry loader disappears.
     ═══════════════════════════════════════════════════════════ */
  function initNameOnTwos() {
    const nameEl = document.querySelector('.hero-name');
    if (!nameEl) return;

    function runJitter() {
      /* Choppy "on-twos" stutter: snapping frames at ~12fps cadence */
      gsap.timeline()
        /* Frame 1 */
        .to(nameEl, { x: -4, skewX:  4, filter: 'blur(1px)', duration: 0.05, ease: 'none' })
        /* Hold (simulates missing frame) */
        .to(nameEl, { duration: 0.04 })
        /* Frame 2 */
        .to(nameEl, { x:  6, skewX: -3, filter: 'blur(2px)', duration: 0.05, ease: 'none' })
        .to(nameEl, { duration: 0.04 })
        /* Frame 3 */
        .to(nameEl, { x: -3, skewX:  2, filter: 'blur(1px)', duration: 0.05, ease: 'none' })
        .to(nameEl, { duration: 0.04 })
        /* SLAM to final position */
        .to(nameEl, {
          x: 0, skewX: 0, filter: 'blur(0px)',
          duration: 0.2, ease: 'elastic.out(1.3, 0.4)',
        })
        /* Subtle name-scale pop */
        .to(nameEl, { scale: 1.015, duration: 0.06, ease: 'power2.in' }, '<0.22')
        .to(nameEl, { scale: 1,     duration: 0.14, ease: 'elastic.out(1.2, 0.4)' });
    }

    const loader = document.getElementById('entry-loader');
    if (loader) {
      const obs = new MutationObserver(() => {
        if (loader.classList.contains('hidden')) {
          obs.disconnect();
          setTimeout(runJitter, 350);
        }
      });
      obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
    } else {
      setTimeout(runJitter, 500);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     4. IMPACT STARBURST — GSAP POW! with 16-pt star shape
        Fires on click when in Spider-Verse mode.
        Adds GSAP-driven starburst behind the existing impact word.
     ═══════════════════════════════════════════════════════════ */
  function initImpactStarburst() {
    const WORDS  = ['POW!', 'ZAP!', 'BOOM!', 'BUILT!', 'YES!', 'SHIPPED!', 'DEPLOY!', '🕷'];
    const COLORS = ['#FF006E', '#FFBE0B', '#00F5FF', '#8AFF2A', '#E23636', '#F7C948'];

    /* 16-point star polygon */
    const STAR_PATH = [
      '50% 0%',   '55% 35%', '79% 9%',  '65% 40%', '97% 34%',
      '72% 52%', '100% 65%', '70% 65%', '85% 95%', '58% 72%',
      '50% 100%', '42% 72%', '15% 95%', '30% 65%',  '0% 65%',
      '28% 52%',   '3% 34%', '35% 40%',  '21% 9%',  '45% 35%',
    ].join(',');

    function spawn(x, y) {
      const word  = WORDS[Math.floor(Math.random() * WORDS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const rot   = (Math.random() - 0.5) * 36;

      /* Starburst shape */
      const burst = document.createElement('div');
      burst.className = 'gsap-starburst';
      burst.style.cssText = [
        `position:fixed`,
        `left:${x}px`, `top:${y}px`,
        `width:150px`, `height:150px`,
        `transform:translate(-50%,-50%) scale(0) rotate(${rot - 25}deg)`,
        `background:${color}`,
        `clip-path:polygon(${STAR_PATH})`,
        `z-index:9958`, `pointer-events:none`,
        `mix-blend-mode:screen`,
      ].join(';');

      /* Word label */
      const label = document.createElement('div');
      label.className = 'gsap-impact-label';
      label.textContent = word;
      label.style.cssText = [
        `position:fixed`,
        `left:${x}px`, `top:${y}px`,
        `transform:translate(-50%,-50%) scale(0) rotate(${rot}deg)`,
        `font-size:${(2 + Math.random() * 1.4).toFixed(1)}rem`,
        `color:${color}`,
        `z-index:9959`, `pointer-events:none`,
      ].join(';');

      document.body.append(burst, label);

      gsap.timeline({ onComplete: () => { burst.remove(); label.remove(); } })
        /* Step 1 — SLAM */
        .to(burst,  { scale: 1.25, rotation: `+=${rot + 18}deg`, duration: 0.1, ease: 'power4.out' }, 0)
        .to(label,  { scale: 1.3,  rotation: rot * 0.5,           duration: 0.1, ease: 'power4.out' }, 0)
        /* Step 2 — elastic settle */
        .to(burst,  { scale: 1,    rotation: `+=5deg`,             duration: 0.15, ease: 'elastic.out(1.1, 0.4)' })
        .to(label,  { scale: 1,    rotation: rot * 0.25,           duration: 0.15, ease: 'elastic.out(1.2, 0.4)' }, '<')
        /* Hold then exit */
        .to({}, { duration: 0.4 })
        .to([burst, label], { scale: 0, y: -50, opacity: 0, duration: 0.2, ease: 'power3.in', stagger: 0.03 });
    }

    /* Only fire when clicking interactive buttons */
    function attachStarburst() {
      document.querySelectorAll(
        '.cta-btn, .bb-open-btn, .filter-btn, .tnav-link, .rec-view-btn, .bb-outer-frame, .rec-card, .tcard'
      ).forEach((btn) => {
        if (btn.dataset.burstDone) return;
        btn.dataset.burstDone = '1';
        btn.addEventListener('click', (e) => {
          spawn(e.clientX, e.clientY);
        });
      });
    }
    attachStarburst();
    /* Re-attach after projects.js injects .bb-open-btn buttons */
    setTimeout(attachStarburst, 2500);
  }

  /* ═══════════════════════════════════════════════════════════
     5. SPEED SCROLL LINES — radial lines appear on fast scroll
     ═══════════════════════════════════════════════════════════ */
  function initSpeedScrollLines() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gsap-speed-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const COLS = ['#FF006E', '#00F5FF', '#FFBE0B', '#8AFF2A', '#E23636', '#F7C948'];
    let lastY    = window.scrollY;
    let alpha    = 0;
    let rafId    = null;
    let lastDraw = 0;

    function draw(ts) {
      /* Cap to ~24fps to reduce GPU load */
      if (ts - lastDraw < 40) { rafId = requestAnimationFrame(draw); return; }
      lastDraw = ts;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (alpha < 0.01) { rafId = null; return; }

      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;
      const maxR = Math.hypot(cx, cy) * 1.25;

      /* 18 lines instead of 36 — halves the draw cost */
      for (let i = 0; i < 18; i++) {
        if (Math.random() < 0.18) continue;
        const angle = (i / 18) * Math.PI * 2;
        const inner = 55 + Math.random() * 90;
        const outer = maxR * (0.45 + Math.random() * 0.55);
        const col   = COLS[Math.floor(Math.random() * COLS.length)];

        ctx.save();
        ctx.globalAlpha  = alpha * (0.25 + Math.random() * 0.35);
        ctx.strokeStyle  = col;
        ctx.lineWidth    = 0.8 + Math.random() * 2.2;
        ctx.lineCap      = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.stroke();
        ctx.restore();
      }

      alpha *= 0.85;
      rafId = requestAnimationFrame(draw);
    }

    window.addEventListener('scroll', () => {
      const y    = window.scrollY;
      const vel  = Math.abs(y - lastY);
      lastY = y;

      /* Higher threshold so casual scrolling doesn't trigger lines */
      if (vel > 55) {
        alpha = Math.min(0.9, alpha + vel / 300);
        if (!rafId) rafId = requestAnimationFrame(draw);
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     6. SKILL CARD THROW — ft-items arc in like thrown panels
     ═══════════════════════════════════════════════════════════ */
  function initSkillCardThrow() {
    if (!hasScrollTrigger) return;

    document.querySelectorAll('.ft-item').forEach((item, i) => {
      if (item.dataset.gsapDone) return;
      item.dataset.gsapDone = '1';

      const fromLeft = i % 2 === 0;
      const xFrom    = fromLeft ? -150 : 150;
      const rotFrom  = fromLeft ? -16  : 16;

      gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true,
        },
      })
      /* Step 1 — THROW: fast angular entry */
      .from(item, {
        x: xFrom, y: -55, rotation: rotFrom,
        scale: 0.85,
        duration: 0.22, ease: 'power4.out',
        delay: i * 0.07,
      })
      /* Step 2a — bounce in opposite direction */
      .to(item, {
        x: fromLeft ? 14 : -14, rotation: fromLeft ? 3 : -3,
        scale: 1.04,
        duration: 0.1, ease: 'power2.out',
      })
      /* Step 2b — elastic settle */
      .to(item, {
        x: 0, rotation: 0, scale: 1,
        duration: 0.25, ease: 'elastic.out(1.2, 0.4)',
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     7. MEANWHILE PANEL — comic chapter transition strips
        Injected before each section (except hero).
     ═══════════════════════════════════════════════════════════ */
  function initMeanwhilePanels() {
    const LABELS = {
      projects:     '[ MEANWHILE… IN THE CODE LAB ]',
      skills:       '[ CUT TO: SKILLS ARCHIVE ]',
      about:        '[ ORIGIN STORY ]',
      testimonials: '[ CASE FILES: REVIEWED ]',
    };

    Object.entries(LABELS).forEach(([id, labelText]) => {
      const section = document.getElementById(id);
      if (!section) return;

      /* Avoid duplicates on hot-reload */
      if (section.previousElementSibling?.classList.contains('gsap-meanwhile-panel')) return;

      const panel = document.createElement('div');
      panel.className = 'gsap-meanwhile-panel';
      panel.setAttribute('aria-hidden', 'true');
      panel.innerHTML = `
        <div class="gsap-meanwhile-inner">
          <span class="gsap-meanwhile-text">${labelText}</span>
          <span class="gsap-meanwhile-dash"></span>
        </div>
      `;
      section.insertAdjacentElement('beforebegin', panel);

      if (!hasScrollTrigger) return;

      const textEl = panel.querySelector('.gsap-meanwhile-text');

      ScrollTrigger.create({
        trigger: panel,
        start: 'top 65%',
        once: true,
        onEnter() {
          gsap.timeline()
            /* Step 1 — SLAM panel in from left edge */
            .from(panel, { x: '-102%', skewX: -10, duration: 0.25, ease: EASE_SLAM })
            .to(panel,   { skewX: 4,               duration: 0.08, ease: 'power2.in' })
            .to(panel,   { skewX: 0,               duration: 0.2,  ease: 'elastic.out(1, 0.35)' })
            /* Step 2 — text stamps in with letter-spacing collapse */
            .from(textEl, {
              opacity: 0,
              letterSpacing: '0.55em',
              scale: 1.08,
              duration: 0.35, ease: 'power3.out',
            }, '-=0.15');
        },
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     8. SPEECH BUBBLE NAV — elastic pop bubbles on hover
     ═══════════════════════════════════════════════════════════ */
  function initSpeechBubbleNav() {
    document.querySelectorAll('.tnav-link').forEach((link) => {
      if (link.dataset.bubbleDone) return;
      link.dataset.bubbleDone = '1';

      const li = link.parentElement;

      const bubble = document.createElement('div');
      bubble.className = 'gsap-speech-bubble';
      bubble.textContent = link.textContent.trim();

      /* Downward tail */
      const tailOuter = document.createElement('div');
      tailOuter.className = 'gsap-bubble-tail';
      const tailFill = document.createElement('div');
      tailFill.className = 'gsap-bubble-tail-fill';
      bubble.append(tailOuter, tailFill);

      li.appendChild(bubble);

      /* Set initial scale-0 */
      gsap.set(bubble, { scale: 0, transformOrigin: 'top center' });

      link.addEventListener('mouseenter', () => {
        gsap.killTweensOf(bubble);
        gsap.timeline()
          /* Step 1 — slam up */
          .to(bubble, { scale: 1.18, rotation: -5, duration: 0.1, ease: 'power3.out' })
          /* Step 2a — wobble */
          .to(bubble, { scale: 0.95, rotation: 3,  duration: 0.1, ease: 'power2.in' })
          /* Step 2b — elastic settle */
          .to(bubble, { scale: 1,    rotation: 0,  duration: 0.2, ease: 'elastic.out(1.4, 0.4)' });
      });

      link.addEventListener('mouseleave', () => {
        gsap.killTweensOf(bubble);
        gsap.to(bubble, {
          scale: 0, rotation: 10,
          duration: 0.14, ease: 'power3.in',
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     9. DIMENSION GLITCH — GSAP RGB channel split on section change
        Enhanced replacement for the CSS flash in spiderverse.js.
        Fires on all themes (the RGB layers use screen blend).
     ═══════════════════════════════════════════════════════════ */
  function initDimensionGlitch() {
    /* RGB channel overlay layers */
    function makeLayer(color, cls) {
      const el = document.createElement('div');
      el.className = cls;
      el.style.background = color;
      document.body.appendChild(el);
      gsap.set(el, { opacity: 0 });
      return el;
    }

    const rLayer = makeLayer('rgba(255,0,80,0.32)',   'gsap-glitch-r');
    const gLayer = makeLayer('rgba(0,255,100,0.18)',  'gsap-glitch-g');
    const bLayer = makeLayer('rgba(0,100,255,0.32)',  'gsap-glitch-b');

    let lastId = null;

    function fireGlitch() {
      const tl = gsap.timeline();
      tl
        /* Channels split apart */
        .to(rLayer, { opacity: 1, x: -7, duration: 0.05, ease: 'none' }, 0)
        .to(bLayer, { opacity: 1, x:  7, duration: 0.05, ease: 'none' }, 0)
        .to(gLayer, { opacity: 1, y: -4, duration: 0.05, ease: 'none' }, 0)
        /* Hold 2 frames */
        .to({}, { duration: 0.07 })
        /* Secondary flicker */
        .to([rLayer, bLayer, gLayer], { opacity: 0.4, x: 0, y: 0, duration: 0.04, ease: 'none' })
        /* Snap off */
        .to([rLayer, bLayer, gLayer], { opacity: 0, duration: 0.09, ease: 'none' });
    }

    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      let current = null;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.45 && r.bottom >= window.innerHeight * 0.45) {
          current = s.id; break;
        }
      }
      if (current && current !== lastId) {
        lastId = current;
        fireGlitch();
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
    10. LOADING LETTERPRESS — stamps loader letters one by one
        Each character slams down with an ink-ring burst.
     ═══════════════════════════════════════════════════════════ */
  function initLoadingLetterpress() {
    const loaderName = document.querySelector('.loader-name');
    if (!loaderName) return;
    if (loaderName.dataset.lpDone) return;
    loaderName.dataset.lpDone = '1';

    /* Pause the CSS loaderFloat animation; we'll re-enable after stamp */
    loaderName.style.animationName = 'loaderGlitch'; /* keep glitch, pause float */

    const original = loaderName.dataset.text || loaderName.textContent.trim();

    /* Wrap each character */
    loaderName.innerHTML = original.split('').map((ch) =>
      `<span class="lp-char">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');

    const chars = Array.from(loaderName.querySelectorAll('.lp-char'));

    /* Add ink ring to each char */
    chars.forEach((ch) => {
      const ring = document.createElement('div');
      ring.className = 'lp-ink-ring';
      ch.style.position = 'relative';
      ch.appendChild(ring);
    });

    /* Set initial hidden state */
    gsap.set(chars, { opacity: 0, y: -55, scale: 2.5 });

    const tl = gsap.timeline({
      delay: 0.25,
      onComplete() {
        /* Restore loaderFloat after letterpress */
        loaderName.style.animationName = 'loaderGlitch, loaderFloat';
      },
    });

    chars.forEach((ch, i) => {
      const ring = ch.querySelector('.lp-ink-ring');
      const t    = i * 0.075;

      tl
        /* Step 1 — SLAM down */
        .to(ch, {
          opacity: 1, y: 4, scale: 1.2,
          duration: 0.07, ease: 'power5.out',
        }, t)
        /* Ink ring burst */
        .fromTo(ring,
          { opacity: 0.8, scale: 0.4 },
          { opacity: 0,   scale: 2.4, duration: 0.35, ease: 'power2.out' },
          t
        )
        /* Step 2 — elastic settle */
        .to(ch, {
          y: 0, scale: 1,
          duration: 0.18, ease: 'elastic.out(1.4, 0.4)',
        }, t + 0.07);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INK UNDERLINE — animated sweep under section titles
     Hooks into the existing .visible class added by
     the IntersectionObserver in mainpage.js
     ═══════════════════════════════════════════════════════════ */
  function initInkUnderlines() {
    document.querySelectorAll('.section-title, .split-title').forEach((el) => {
      if (el.querySelector('.ink-underline')) return;
      const bar = document.createElement('span');
      bar.className = 'ink-underline';
      el.appendChild(bar);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT — ordered so expensive animations don't block paint
     ═══════════════════════════════════════════════════════════ */
  /* Run immediately on script parse (loader visible) */
  initLoadingLetterpress(); /* 10 */

  document.addEventListener('DOMContentLoaded', () => {
    /* UI setup — no scroll dependency */
    initNameOnTwos();        /* 3  */
    initSpeechBubbleNav();   /* 8  */
    initInkUnderlines();     /* bonus */
    initDimensionGlitch();   /* 9  */
    initImpactStarburst();   /* 4  */
    initSpeedScrollLines();  /* 5  */

    /* ScrollTrigger — deferred one frame for layout to settle */
    requestAnimationFrame(() => {
      initPanelStamp();      /* 1  */
      initBillboardSlam();   /* 2  */
      initSkillCardThrow();  /* 6  */
      initMeanwhilePanels(); /* 7  */
    });
  });

})();
