/**
 * postfx.js — WebGL post-processing overlay for mainpage.html
 *
 * mix-blend-mode: screen  (additive — black = no effect; colour = brightens)
 *
 * Effects:
 *   • Strong chromatic aberration halos  (3× previous values)
 *   • Random horizontal GLITCH BANDS that flash across the screen
 *   • Scanning cyan/pink bloom line (sweeps down every ~7 s)
 *   • Cursor-reactive hot-pink radial glow (large + smooth lerp)
 *   • Four out-of-phase pulsing corner orbs in the neon palette
 */
(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'postfx-canvas';
  document.body.appendChild(canvas);

  const gl =
    canvas.getContext('webgl',             { antialias: false, alpha: false }) ||
    canvas.getContext('experimental-webgl',{ antialias: false, alpha: false });

  if (!gl) { canvas.remove(); return; }

  /* ── GLSL ─────────────────────────────────────────────────── */
  const VERT = `
    attribute vec2 a_pos;
    varying   vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const FRAG = `
    precision highp float;

    varying vec2  v_uv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_mouse;      /* 0..1 */
    uniform float u_glitch;     /* 0/1 — glitch active */
    uniform float u_gseed;      /* random seed */

    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.55); }

    void main() {
      vec2  uv     = v_uv;
      float t      = u_time;
      vec2  center = vec2(0.5);
      vec2  toC    = uv - center;
      float dist   = length(toC);

      float r = 0.0, g = 0.0, b = 0.0;

      /* ══ 1. CHROMATIC ABERRATION HALOS ══════════════════════ */
      float aberr = 0.10 * (0.7 + 0.3 * sin(t * 0.38));

      /* Outer hot-pink ring — halved */
      float rRing = smoothstep(0.90, 0.48, dist) * smoothstep(0.0, 0.18, dist);
      r += rRing * 0.07 * (0.5 + 0.5 * sin(t * 0.33));

      /* Inner cyan ring */
      float bRing = smoothstep(0.72, 0.32, dist) * smoothstep(0.0, 0.14, dist);
      b += bRing * 0.07 * (0.5 + 0.5 * sin(t * 0.27 + 1.4));
      g += bRing * 0.02;

      /* Lime accent ring */
      float gRing = smoothstep(0.55, 0.22, dist) * smoothstep(0.0, 0.10, dist);
      g += gRing * 0.04 * (0.5 + 0.5 * sin(t * 0.41 + 2.8));

      /* ══ 2. GLITCH BANDS ════════════════════════════════════ */
      if (u_glitch > 0.5) {
        /* Divide screen into ~30 horizontal bands */
        float band     = floor(uv.y * 30.0);
        float bandHash = hash2(vec2(band, u_gseed));
        if (bandHash > 0.65) {
          /* Band is "active" during glitch — draw a coloured flash */
          float intensity = smoothstep(0.65, 1.0, bandHash);
          /* Alternate cyan / pink / white bands */
          float bandType = fract(bandHash * 7.3);
          if (bandType < 0.35) {
            /* Cyan band */
            b += intensity * 0.22;
            g += intensity * 0.08;
          } else if (bandType < 0.70) {
            /* Teal-white band (not pink) */
            b += intensity * 0.20;
            g += intensity * 0.12;
          } else {
            /* White flash */
            r += intensity * 0.18;
            g += intensity * 0.18;
            b += intensity * 0.18;
          }
        }
      }

      /* ══ 3. SCANNING BLOOM LINE — dimmed significantly ══════ */
      float scanPos = fract(t * 0.154);
      float beam    = exp(-abs(uv.y - scanPos) * 70.0);
      r += beam * 0.08;
      b += beam * 0.16;
      g += beam * 0.06;

      /* ══ 4. CURSOR GLOW — neutral white-blue, not pink ══════ */
      float md = length(uv - u_mouse);
      float mg = exp(-md * 3.8) * 0.10;
      r += mg * 0.45;
      g += mg * 0.30;
      b += mg * 0.80;

      /* ══ 5. PULSING CORNER ORBS — reduced ~60 % ════════════ */
      float p1 = sin(t * 0.44)         * 0.5 + 0.5;
      float p2 = sin(t * 0.36 + 1.57)  * 0.5 + 0.5;
      float p3 = sin(t * 0.50 + 3.14)  * 0.5 + 0.5;
      float p4 = sin(t * 0.40 + 4.71)  * 0.5 + 0.5;

      /* TL — soft pink */
      float c1 = exp(-length(uv - vec2(0.06, 0.94)) * 4.2);
      r += c1 * 0.08 * p1;  b += c1 * 0.04 * p1;

      /* TR — cyan */
      float c2 = exp(-length(uv - vec2(0.94, 0.94)) * 4.2);
      b += c2 * 0.09 * p2;  g += c2 * 0.04 * p2;

      /* BL — lime */
      float c3 = exp(-length(uv - vec2(0.06, 0.06)) * 4.2);
      g += c3 * 0.07 * p3;  b += c3 * 0.02 * p3;

      /* BR — muted yellow */
      float c4 = exp(-length(uv - vec2(0.94, 0.06)) * 4.2);
      r += c4 * 0.07 * p4;  g += c4 * 0.06 * p4;

      /* ══ 6. SLOW DRIFTING CENTRE ORB ════════════════════════ */
      float dx = 0.5 + 0.22 * sin(t * 0.18);
      float dy = 0.5 + 0.18 * cos(t * 0.13 + 0.9);
      float do_ = exp(-length(uv - vec2(dx, dy)) * 6.0);
      b += do_ * 0.05 * (0.5 + 0.5 * sin(t * 0.55));
      g += do_ * 0.02;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `;

  /* ── Compile helper ────────────────────────────────────────── */
  function makeShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[postfx]', gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }
  const vs = makeShader(gl.VERTEX_SHADER,   VERT);
  const fs = makeShader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[postfx] link:', gl.getProgramInfoLog(prog));
    canvas.remove(); return;
  }
  gl.useProgram(prog);

  /* ── Quad ──────────────────────────────────────────────────── */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uRes    = gl.getUniformLocation(prog, 'u_res');
  const uMouse  = gl.getUniformLocation(prog, 'u_mouse');
  const uGlitch = gl.getUniformLocation(prog, 'u_glitch');
  const uGseed  = gl.getUniformLocation(prog, 'u_gseed');

  /* ── Glitch scheduler — drives WebGL bands AND SVG filter warp ── */
  let glitchActive = 0, glitchSeed = 0;

  /* SVG filter elements (optional — only present on mainpage.html) */
  const svgDisp = document.getElementById('svgDisp');
  const svgTurb = document.getElementById('svgTurb');
  const caRed   = document.getElementById('caRed');
  const caBlue  = document.getElementById('caBlue');

  function fireGlitchBurst() {
    glitchSeed   = Math.random() * 999;
    glitchActive = 1;

    /* SVG warp: ramp scale up, animate turbulence seed, then reset */
    if (svgDisp && svgTurb) {
      let frame = 0;
      const scales  = [0, 8, 20, 28, 18, 10, 4, 0];
      const glitchId = setInterval(() => {
        svgDisp.setAttribute('scale', scales[frame] ?? 0);
        svgTurb.setAttribute('seed',  Math.floor(Math.random() * 200));
        frame++;
        if (frame >= scales.length) {
          clearInterval(glitchId);
          svgDisp.setAttribute('scale', 0);
        }
      }, 28);
    }

    /* SVG chromatic aberration: shift R and B feOffset dx */
    if (caRed && caBlue) {
      const offsets = [[7, -7], [-9, 9], [5, -5], [0, 0]];
      let f2 = 0;
      const caId = setInterval(() => {
        const o = offsets[f2] ?? [0, 0];
        caRed.setAttribute('dx', o[0]);
        caBlue.setAttribute('dx', o[1]);
        f2++;
        if (f2 >= offsets.length) {
          clearInterval(caId);
          caRed.setAttribute('dx', 0);
          caBlue.setAttribute('dx', 0);
        }
      }, 35);
    }

    /* WebGL glitch bands: hold for 80 – 220 ms then schedule next */
    setTimeout(() => {
      glitchActive = 0;
      scheduleGlitch();
    }, 80 + Math.random() * 140);
  }

  function scheduleGlitch() {
    const delay = 3000 + Math.random() * 4000;
    setTimeout(fireGlitchBurst, delay);
  }
  scheduleGlitch();

  /* ── Mouse (smooth lerp) ───────────────────────────────────── */
  let tx = 0.5, ty = 0.5, sx = 0.5, sy = 0.5;
  document.addEventListener('mousemove', e => {
    tx = e.clientX / window.innerWidth;
    ty = 1.0 - e.clientY / window.innerHeight;
  });

  /* ── Resize ────────────────────────────────────────────────── */
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5× for perf
  function resize() {
    canvas.width  = Math.floor(window.innerWidth  * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ── Pause when tab hidden ─────────────────────────────────── */
  let paused = false;
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) requestAnimationFrame(render);
  });

  /* ── Render loop ───────────────────────────────────────────── */
  const t0 = performance.now();
  function render() {
    if (paused) return;
    sx += (tx - sx) * 0.055;
    sy += (ty - sy) * 0.055;

    const elapsed = (performance.now() - t0) / 1000;
    gl.uniform1f(uTime,   elapsed);
    gl.uniform2f(uRes,    canvas.width, canvas.height);
    gl.uniform2f(uMouse,  sx, sy);
    gl.uniform1f(uGlitch, glitchActive);
    gl.uniform1f(uGseed,  glitchSeed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();
})();
