'use strict';

/* ── Cursor Glow (ambient) ───────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  let glowRafPending = false;
  let glowX = 0, glowY = 0;
  document.addEventListener('mousemove', e => {
    glowX = e.clientX; glowY = e.clientY;
    if (!glowRafPending) {
      glowRafPending = true;
      requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate3d(${glowX - 160}px, ${glowY - 160}px, 0)`;
        glowRafPending = false;
      });
    }
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
  let parallaxRafPending = false;
  const applyParallax = () => {
    if (parallaxRafPending) return;
    parallaxRafPending = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${y * speed}px)`;
      });
      parallaxRafPending = false;
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
    Events, Composite, Mouse, MouseConstraint,
  } = Matter;

  /* Measure the left-column boundary FIRST so the canvas is sized to the
     physics zone only — this keeps the right column fully interactive. */
  const aboutImg = section.querySelector('.about-img');
  let zoneRight;
  const calcZoneRight = () => {
    const secRect = section.getBoundingClientRect();
    if (aboutImg) {
      const imgRect = aboutImg.getBoundingClientRect();
      return Math.round(imgRect.right - secRect.left) + 16;
    }
    return Math.round(section.offsetWidth * 0.42);
  };
  zoneRight = calcZoneRight();

  const H = section.offsetHeight;

  /* Limit canvas to physics zone so the text/skill-tags on the right stay interactive */
  canvas.width         = zoneRight;
  canvas.height        = H;
  canvas.style.width   = zoneRight + 'px';
  canvas.style.touchAction = 'pan-y';  // let vertical touch-scroll pass through on mobile

  const engine = Engine.create({ gravity: { x: 0, y: 0.6 } });

  const render = Render.create({
    canvas,
    engine,
    options: {
      width:      zoneRight,
      height:     H,
      background: 'transparent',
      wireframes: false,
    },
  });

  /* Helper: build the three static boundary walls */
  const wallOpts = { isStatic: true, render: { fillStyle: 'transparent', strokeStyle: 'transparent' } };
  const buildWalls = (zR, h) => [
    Bodies.rectangle(zR / 2,  h + 26, zR, 52,      wallOpts),  // floor
    Bodies.rectangle(-26,     h / 2,  52, h + 100,  wallOpts),  // left wall
    Bodies.rectangle(zR + 26, h / 2,  52, h + 100,  wallOpts),  // right divider
  ];
  let walls = buildWalls(zoneRight, H);
  World.add(engine.world, walls);

  /* Skill pill definitions */
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
  ];

  /* Measure pill text widths */
  const tmpCv  = document.createElement('canvas');
  const tmpCtx = tmpCv.getContext('2d');
  tmpCtx.font  = 'bold 11px "Space Mono", monospace';

  SKILLS.forEach((skill, i) => {
    const tw = tmpCtx.measureText(skill.label).width;
    const bW = tw + 32;
    const bH = 34;

    /* Drop only within the left zone */
    const maxX = Math.max(zoneRight - bW / 2 - 10, bW / 2 + 10);
    const x    = bW / 2 + 10 + Math.random() * Math.max(maxX - bW / 2 - 10, 1);
    const y    = -60 - i * 48;

    const body = Bodies.rectangle(x, y, bW, bH, {
      restitution: 0.28,
      friction:    0.65,
      frictionAir: 0.009,
      render: {
        fillStyle:   'rgba(0,0,0,0.85)',
        strokeStyle: skill.color,
        lineWidth:   1.5,
      },
    });
    body.skillLabel = skill.label;
    body.skillColor = skill.color;

    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 3,
      y: 1.5 + Math.random() * 2,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.07);

    World.add(engine.world, body);
  });

  /* Draw skill labels after each render frame */
  Events.on(render, 'afterRender', () => {
    const ctx    = render.context;
    const bodies = Composite.allBodies(engine.world);

    ctx.save();
    ctx.font         = 'bold 10px "Space Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    bodies.forEach(body => {
      if (!body.skillLabel) return;
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.fillStyle   = body.skillColor;
      ctx.shadowColor = body.skillColor;
      ctx.shadowBlur  = 9;
      ctx.fillText(body.skillLabel, 0, 0);
      ctx.restore();
    });

    ctx.restore();
  });

  /* Fade canvas in */
  setTimeout(() => canvas.classList.add('visible'), 150);

  Render.run(render);
  Runner.run(Runner.create(), engine);

  /* ── Drag interaction ────────────────────────── */
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.15, angularStiffness: 0.1, render: { visible: false } },
  });
  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  /* Canvas covers only the physics zone — pointer events are safe to enable */
  canvas.style.pointerEvents = 'auto';
  canvas.style.cursor = 'grab';

  /* Forward wheel events so page still scrolls */
  render.canvas.addEventListener('wheel', e => {
    window.scrollBy({ top: e.deltaY, behavior: 'auto' });
  }, { passive: true });

  /* Drag cursor feedback */
  Events.on(mouseConstraint, 'startdrag', () => { canvas.style.cursor = 'grabbing'; });
  Events.on(mouseConstraint, 'enddrag',   () => { canvas.style.cursor = 'grab'; });

  /* Resize: recalculate zone, resize canvas/render, and rebuild walls */
  window.addEventListener('resize', () => {
    const nH = section.offsetHeight;
    zoneRight = calcZoneRight();

    canvas.width         = zoneRight;
    canvas.height        = nH;
    canvas.style.width   = zoneRight + 'px';
    render.canvas.width  = zoneRight;
    render.canvas.height = nH;
    render.options.width  = zoneRight;
    render.options.height = nH;

    World.remove(engine.world, walls);
    walls = buildWalls(zoneRight, nH);
    World.add(engine.world, walls);
  }, { passive: true });
}

/* ── Skills fast-track: icon activation on scroll ──────────── */
(function () {
  const items = document.querySelectorAll('.ft-item');
  const icons = document.querySelectorAll('.ft-icon-wrap');
  if (!items.length || !icons.length) return;

  function setActive(activeItem) {
    items.forEach(el => el.classList.remove('active'));
    icons.forEach(el => el.classList.remove('active'));
    if (!activeItem) return;
    activeItem.classList.add('active');
    const icon = document.querySelector(`.ft-icon-wrap[data-icon="${activeItem.dataset.skill}"]`);
    if (icon) icon.classList.add('active');
  }

  /* Trigger zone: item top must cross 30% from viewport top */
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target);
    });
  }, { rootMargin: '-28% 0px -55% 0px', threshold: 0 });

  items.forEach(item => obs.observe(item));
})();

/* ── Reorder sections: Projects before About ────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const projects  = document.getElementById('projects');
  const about     = document.getElementById('about');
  if (projects && about && about.parentNode) {
    about.parentNode.insertBefore(projects, about);
  }
});
