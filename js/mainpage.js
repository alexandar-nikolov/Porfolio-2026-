'use strict';

/* ── Cursor Glow (ambient) ───────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  });
}

/* ── Nothing Phone ring cursor ───────────────────────────────── */
const cursorOuter = document.getElementById('cursorOuter');
const cursorDot   = document.getElementById('cursorDot');
if (cursorOuter && cursorDot) {
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let ox = mx, oy = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  document.addEventListener('mousedown', () => cursorOuter.classList.add('click'));
  document.addEventListener('mouseup',   () => cursorOuter.classList.remove('click'));

  /* Hover state on interactive elements */
  document.querySelectorAll('a, button, .cta-btn, .word, .img-tag, .skill-tags span').forEach(el => {
    el.addEventListener('mouseenter', () => cursorOuter.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorOuter.classList.remove('hover'));
  });

  (function animCursor() {
    ox += (mx - ox) * 0.1;
    oy += (my - oy) * 0.1;
    cursorOuter.style.left = ox + 'px';
    cursorOuter.style.top  = oy + 'px';
    requestAnimationFrame(animCursor);
  })();
}

/* ── Entry Loader ────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('entry-loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 2200);
});

/* ══ Everything else after DOM ready ════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Typed.js ────────────────────────────────────────────── */
  if (window.Typed && document.querySelector('.typing')) {
    new Typed('.typing', {
      strings: ['Frontend Developer', 'ICT Student', 'Web Designer'],
      typeSpeed: 80, backSpeed: 55, backDelay: 1600, loop: true,
    });
  }

  /* ── Name scramble ───────────────────────────────────────── */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@!?';
  document.querySelectorAll('.name-line').forEach((el, lineIndex) => {
    const original = el.dataset.text || el.textContent;
    el.textContent = '';
    let frame = 0;
    const totalFrames = 22;
    setTimeout(() => {
      const id = setInterval(() => {
        el.textContent = original.split('').map((char, i) => {
          if (char === ' ') return ' ';
          return frame >= totalFrames * (i / original.length + 0.4)
            ? char
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        frame++;
        if (frame > totalFrames * 1.6) { el.textContent = original; clearInterval(id); }
      }, 38);
    }, lineIndex * 180 + 500);
  });

  /* ── Split-title: wrap each char in a span ───────────────── */
  document.querySelectorAll('.split-title[data-split]').forEach(el => {
    // Clone the BR element structure — process text nodes only
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split('').forEach((ch, i) => {
          if (ch === '\n') return;
          const span = document.createElement('span');
          span.className = 'char';
          span.style.transitionDelay = (i * 45) + 'ms';
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          frag.appendChild(span);
        });
        return frag;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        node.childNodes.forEach(child => {
          const processed = processNode(child);
          if (processed) clone.appendChild(processed);
        });
        return clone;
      }
    };
    const frag = document.createDocumentFragment();
    el.childNodes.forEach(child => {
      const processed = processNode(child);
      if (processed) frag.appendChild(processed);
    });
    el.innerHTML = '';
    el.appendChild(frag);
    el.removeAttribute('data-split');
  });

  /* ── Nav: scroll state + active link ─────────────────────── */
  const topnav   = document.getElementById('topnav');
  const navLinks = document.querySelectorAll('.tnav-link');
  const sections  = Array.from(document.querySelectorAll('section[id]'));

  const syncNav = () => {
    const y = window.scrollY;
    topnav && topnav.classList.toggle('scrolled', y > 60);
    let current = sections[0]?.id || '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    // fade scroll indicator on scroll
    const si = document.querySelector('.scroll-indicator');
    if (si) si.style.opacity = Math.max(0, 1 - y / 300);
  };
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ── Smooth anchor scroll ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('topnavLinks')?.classList.remove('open');
      document.getElementById('mobileMenuBtn')?.classList.remove('open');
    });
  });

  /* ── Mobile menu ─────────────────────────────────────────── */
  const mobileBtn  = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('topnavLinks');
  mobileBtn?.addEventListener('click', () => {
    mobileBtn.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  /* ── Parallax on scroll (hero bg word + image) ───────────── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const applyParallax = () => {
    const y = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${y * speed}px)`;
    });
  };
  window.addEventListener('scroll', applyParallax, { passive: true });

  /* ── IntersectionObserver: all reveal classes + split-title  */
  const REVEAL_CLASSES = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale', '.split-title'];
  const allRevealEls = document.querySelectorAll(REVEAL_CLASSES.join(','));

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  allRevealEls.forEach(el => revealObs.observe(el));

  /* ── Coloured skill tags ─────────────────────────────────── */
  const TAG_COLORS = ['#FF006E','#FFBE0B','#00F5FF','#8AFF2A','#FB5607','#6A00FF'];
  document.querySelectorAll('.skill-tags span').forEach((span, i) => {
    const c = TAG_COLORS[i % TAG_COLORS.length];
    span.style.color       = c;
    span.style.borderColor = c + '55';
    span.addEventListener('mouseenter', () => {
      span.style.background  = c;
      span.style.color       = '#000';
      span.style.borderColor = c;
      span.style.boxShadow   = `0 0 20px ${c}88`;
    });
    span.addEventListener('mouseleave', () => {
      span.style.background  = '';
      span.style.color       = c;
      span.style.borderColor = c + '55';
      span.style.boxShadow   = '';
    });
  });

  /* ── Matter.js in About section ──────────────────────────── */
  const aboutSection = document.getElementById('about');
  if (aboutSection && window.Matter) {
    // Lazy-init physics when about section enters viewport
    const physicsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        physicsObs.disconnect();
        initAboutPhysics(aboutSection);
      }
    }, { threshold: 0.05 });
    physicsObs.observe(aboutSection);
  }
});

/* ═══════════════════════════════════════════════════════════════
   Matter.js — About section background physics
   ═══════════════════════════════════════════════════════════════ */
function initAboutPhysics(section) {
  const canvas = document.getElementById('matter-canvas');
  if (!canvas) return;

  const {
    Engine, Render, Runner, World, Bodies, Body,
    Events, Mouse, MouseConstraint, Composite,
  } = Matter;

  const W = section.offsetWidth;
  const H = section.offsetHeight;

  // Size canvas to match the section exactly
  canvas.width  = W;
  canvas.height = H;

  const engine = Engine.create({ gravity: { x: 0, y: 0.55 } });

  const render = Render.create({
    canvas,
    engine,
    options: {
      width:      W,
      height:     H,
      background: 'transparent',
      wireframes: false,
    },
  });

  // Static boundary walls
  const wall = { isStatic: true, render: { fillStyle: 'transparent', strokeStyle: 'transparent' } };
  World.add(engine.world, [
    Bodies.rectangle(W / 2, H + 26,  W + 100, 52,  wall),  // floor
    Bodies.rectangle(-26,   H / 2,   52, H + 100,   wall),  // left
    Bodies.rectangle(W + 26, H / 2,  52, H + 100,   wall),  // right
  ]);

  // Skill pill definitions
  const SKILLS = [
    { label: 'JAVASCRIPT', color: '#FFBE0B' },
    { label: 'PYTHON',     color: '#00F5FF' },
    { label: 'SQL',        color: '#8AFF2A' },
    { label: 'HTML5',      color: '#FB5607' },
    { label: 'CSS3',       color: '#6A00FF' },
    { label: 'REACT',      color: '#00F5FF' },
    { label: 'NODE.JS',    color: '#8AFF2A' },
    { label: 'GIT',        color: '#FF006E' },
    { label: 'C#',         color: '#6A00FF' },
    { label: 'THREE.JS',   color: '#FF006E' },
    { label: 'MATTER.JS',  color: '#FFBE0B' },
    { label: 'FIGMA',      color: '#FB5607' },
    { label: 'ITALIAN',    color: '#FF006E' },
    { label: 'ENGLISH',    color: '#00F5FF' },
    { label: 'BULGARIAN',  color: '#8AFF2A' },
    { label: 'DOCKER',     color: '#00F5FF' },
    { label: 'PYTHON',     color: '#FFBE0B' },
    { label: 'REACT',      color: '#FF006E' },
  ];

  // Measure pill text widths
  const tmpCv  = document.createElement('canvas');
  const tmpCtx = tmpCv.getContext('2d');
  tmpCtx.font  = 'bold 11px "Space Mono", monospace';

  SKILLS.forEach((skill, i) => {
    const tw  = tmpCtx.measureText(skill.label).width;
    const bW  = tw + 32;
    const bH  = 34;
    // Spread across the top of the section, staggered heights
    const x = 80 + Math.random() * (W - 160);
    const y = -80 - i * 50;

    const body = Bodies.rectangle(x, y, bW, bH, {
      restitution: 0.48,
      friction:    0.38,
      frictionAir: 0.007,
      render: {
        fillStyle:   'rgba(0,0,0,0.82)',
        strokeStyle: skill.color,
        lineWidth:   1.8,
      },
    });
    body.skillLabel = skill.label;
    body.skillColor = skill.color;

    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 6,
      y: 2 + Math.random() * 4,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

    World.add(engine.world, body);
  });

  // Draw skill labels after each render frame
  Events.on(render, 'afterRender', () => {
    const ctx    = render.context;
    const bodies = Composite.allBodies(engine.world);

    ctx.save();
    ctx.font         = 'bold 10.5px "Space Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    bodies.forEach(body => {
      if (!body.skillLabel) return;
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.fillStyle   = body.skillColor;
      ctx.shadowColor = body.skillColor;
      ctx.shadowBlur  = 10;
      ctx.fillText(body.skillLabel, 0, 0);
      ctx.restore();
    });

    ctx.restore();
  });

  // Fade canvas in after a brief moment
  setTimeout(() => canvas.classList.add('visible'), 200);

  Render.run(render);
  Runner.run(Runner.create(), engine);

  // Resize handler
  window.addEventListener('resize', () => {
    const nW = section.offsetWidth;
    const nH = section.offsetHeight;
    canvas.width  = nW;
    canvas.height = nH;
    render.canvas.width   = nW;
    render.canvas.height  = nH;
    render.options.width  = nW;
    render.options.height = nH;
  }, { passive: true });
}
