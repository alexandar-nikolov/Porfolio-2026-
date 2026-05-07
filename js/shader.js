/**
 * shader.js — Neon Metaball Plasma × Spider-Verse (index.html background)
 *
 * GPU-rendered GLSL fragment shader. Replaces the CSS .bg element entirely.
 *
 * What it does:
 *   • Six autonomously orbiting metaballs in neon palette
 *   • One large mouse-controlled blob that follows the cursor
 *   • Rim lighting on metaball surfaces  (very bright neon edges)
 *   • Vortex spiral underlayer that pulses with time
 *   • mix-blend-mode:difference on .stage makes ALL marquee text
 *     colours INVERT in real-time wherever a metaball drifts behind them
 *
 * Spider-Verse enhancements (NEW):
 *   • Ben-Day halftone dots — comic printing signature (two frequencies)
 *   • Speed lines radiating from mouse — Spider-Man action burst
 *   • Cel-shading quantization — comic book posterize
 *   • Ink edge detection via dFdx/dFdy — harsh comic outlines on metaballs
 */
(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'shader-bg';
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:0;display:block;';
  document.body.insertBefore(canvas, document.body.firstChild);

  const gl =
    canvas.getContext('webgl',             { antialias: false, alpha: false }) ||
    canvas.getContext('experimental-webgl',{ antialias: false, alpha: false });

  if (!gl) { canvas.remove(); return; }

  /* Request OES_standard_derivatives for ink edge dFdx/dFdy */
  const hasDerivatives = !!gl.getExtension('OES_standard_derivatives');

  /* ── GLSL ─────────────────────────────────────────────────── */
  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  /* #extension must be the very first line of the fragment source */
  const FRAG = (hasDerivatives ? `#extension GL_OES_standard_derivatives : enable\n` : ``) + `
    precision mediump float;

    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_mouse;

    #define TAU 6.28318530718

    /* ── Spider-Verse neon comics palette ── */
    vec3 palette(float t) {
      vec3 a = vec3(0.22, 0.18, 0.32);
      vec3 b = vec3(0.20, 0.16, 0.26);
      vec3 c = vec3(1.00, 1.00, 1.00);
      vec3 d = vec3(0.00, 0.40, 0.72);
      return a + b * cos(TAU * (c * t + d));
    }

    /* ── Ben-Day halftone dot — signature Spider-Verse / comics printing ──
       val 0..1 controls dot radius inside the cell.
       Returns 1.0 inside the dot, 0.0 outside (with soft anti-alias edge).  */
    float benDay(vec2 uv, float freq, float val) {
      vec2 cell = fract(uv * freq) - 0.5;
      float r = clamp(val * 0.72, 0.0, 0.49);
      return 1.0 - smoothstep(r - 0.015, r + 0.015, length(cell));
    }

    /* ── Speed lines — Spider-Man radial action burst from focal point ── */
    float speedLines(vec2 uv, vec2 origin, float time) {
      vec2 d = uv - origin;
      float ang  = atan(d.y, d.x);
      float dist = length(d);
      /* 24 radiating spokes, slowly rotating */
      float spokes = pow(max(0.0, sin(ang * 24.0 + time * 0.28)), 16.0);
      /* Strong near origin, fading at edge */
      float fade = smoothstep(1.5, 0.05, dist) * smoothstep(0.0, 0.08, dist);
      return spokes * fade;
    }

    /* ── Cel-shade quantize — posterize to N flat tones ── */
    vec3 cel(vec3 c, float n) {
      return floor(c * n + 0.5) / n;
    }

    /* ── Classic smooth metaball potential ── */
    float ball(vec2 p, vec2 c, float r) {
      vec2 d = p - c;
      return (r * r) / (dot(d, d) + 0.001);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
      vec2 mu = (u_mouse  * 2.0 - u_res) / min(u_res.x, u_res.y);
      float t = u_time * 0.26;

      /* ── Six orbiting blobs ──────────────────────────────── */
      vec2 p0 = vec2(cos(t * 0.70),           sin(t * 0.53))           * 0.88;
      vec2 p1 = vec2(cos(t * 0.53 + 1.60),    sin(t * 0.82 + 0.55))    * 0.76;
      vec2 p2 = vec2(cos(t * 0.91 + 3.10),    sin(t * 0.41 + 2.10))    * 0.92;
      vec2 p3 = vec2(cos(t * 0.42 + 2.00),    sin(t * 0.73 + 1.10))    * 0.68;
      vec2 p4 = vec2(cos(t * 1.10 + 0.85),    sin(t * 0.63 + 3.60))    * 0.72;
      vec2 p5 = mu;  /* mouse blob */

      /* ── Metaball field ──────────────────────────────────── */
      float f = 0.0;
      f += ball(uv, p0, 0.36);
      f += ball(uv, p1, 0.31);
      f += ball(uv, p2, 0.29);
      f += ball(uv, p3, 0.26);
      f += ball(uv, p4, 0.23);
      f += ball(uv, p5, 0.52);   /* mouse blob: largest */

      /* ── Plasma noise layer ──────────────────────────────── */
      float v = sin(uv.x * 4.1 + t * 1.3) * cos(uv.y * 3.2 + t);
      v += sin((uv.x - uv.y) * 5.2 + t * 0.9) * 0.50;
      f += v * 0.20;

      /* ── Vortex swirl from origin ────────────────────────── */
      float ang  = atan(uv.y, uv.x);
      float rad  = length(uv);
      float vort = sin(rad * 6.5 - t * 2.2 + ang * 4.0)
                   * exp(-rad * 1.6) * 0.28;
      f += vort;

      /* ── Isosurface layers ───────────────────────────────── */
      float inside = smoothstep(2.8, 4.2, f);
      float rim    = smoothstep(1.8, 2.8, f) * (1.0 - inside);
      float glow   = exp(-max(0.0, 1.8 - f) * 2.8)
                     * (1.0 - rim - inside * 0.6);

      /* ── Base colour: near-black deep-purple void ── */
      vec3 col = vec3(0.022, 0.0, 0.055);

      col += palette(f * 0.13 + t * 0.045) * inside * 0.18;
      col += (palette(f * 0.22 + t * 0.065) * 0.55 + vec3(0.10)) * rim * 0.50;
      col += palette(f * 0.10 + t * 0.030) * glow * 0.14;

      /* ════════════════════════════════════════════════════════
         SPIDER-VERSE ENHANCEMENTS
         ════════════════════════════════════════════════════════ */

      /* 1. Ben-Day halftone dots — replace smooth gradients with
            comic-printing dot patterns (two frequencies: coarse + fine) */
      float lum     = dot(col, vec3(0.299, 0.587, 0.114));
      float dotVal  = lum * 2.6;
      float dots_bg = benDay(uv, 11.0, dotVal * 0.65);   /* coarse 11/unit */
      float dots_fg = benDay(uv, 23.0, dotVal * 0.45);   /* fine   23/unit */
      float dotMask = smoothstep(0.03, 0.22, lum);
      /* In lit areas: half-tone replaces smooth colour */
      col = mix(col, col * (0.38 + dots_bg * 0.82), dotMask * 0.50);
      col = mix(col, col * (0.65 + dots_fg * 0.52), dotMask * 0.28);

      /* 2. Speed lines from mouse — radial spokes, cycling cyan ↔ pink */
      float sl      = speedLines(uv, mu, u_time);
      float slSwap  = sin(u_time * 0.5) * 0.5 + 0.5;
      vec3  slCol   = mix(
        vec3(0.0, 0.96, 1.0),    /* vivid cyan  */
        vec3(1.0, 0.0,  0.43),   /* hot pink    */
        slSwap
      );
      col += slCol * sl * 0.30;

      /* 3. Cel-shading — quantize to 4 tones for painterly comic look */
      vec3 celCol = cel(col, 4.0);
      col = mix(col, celCol, 0.28);

      /* 4. Ink edge detection — dFdx/dFdy detect sharp metaball boundaries
            and darken them, producing harsh ink outlines like comic panels.
            Requires OES_standard_derivatives (guarded by preprocessor). */
      #ifdef GL_OES_standard_derivatives
      float dfx     = abs(dFdx(f));
      float dfy     = abs(dFdy(f));
      float inkEdge = smoothstep(0.25, 2.2, (dfx + dfy) * 18.0);
      col *= (1.0 - inkEdge * 0.68);
      #endif

      /* ── Vignette — fade to black toward corners ── */
      float vign = 1.0 - smoothstep(0.65, 1.50, rad);
      col *= vign * 0.55 + 0.45;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  /* ── Compile + link ────────────────────────────────────────── */
  function makeShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[shader.js]', gl.getShaderInfoLog(s));
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
    console.warn('[shader.js] link:', gl.getProgramInfoLog(prog));
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

  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  /* ── Mouse (lerped for smooth blob movement) ───────────────── */
  let tx = 0, ty = 0, sx = 0, sy = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  /* ── DPR cap — limits resolution on HiDPI screens for perf ─── */
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    canvas.width  = Math.floor(window.innerWidth  * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
    /* Centre blob on start */
    if (sx === 0 && sy === 0) {
      tx = window.innerWidth  / 2;
      ty = window.innerHeight / 2;
      sx = tx; sy = ty;
    }
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* Hide CSS .bg — replaced by WebGL */
  const bgEl = document.querySelector('.bg');
  if (bgEl) bgEl.style.display = 'none';

  /* ── Pause when tab is hidden ──────────────────────────────── */
  let paused = false;
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) requestAnimationFrame(render);
  });

  /* ── Render loop ───────────────────────────────────────────── */
  const t0 = performance.now();
  function render() {
    if (paused) return;
    sx += (tx - sx) * 0.055;   /* smooth mouse lerp */
    sy += (ty - sy) * 0.055;

    const elapsed = (performance.now() - t0) / 1000;
    gl.uniform1f(uTime,  elapsed);
    gl.uniform2f(uRes,   canvas.width, canvas.height);
    gl.uniform2f(uMouse, sx * DPR, canvas.height - sy * DPR);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();
})();
