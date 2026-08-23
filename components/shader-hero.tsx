"use client";

/**
 * ShaderHero — FE-AA3
 *
 * A fullscreen GLSL fragment shader rendered on a WebGL canvas behind the
 * hero content. The shader uses three uniforms:
 *
 *   u_time        — drives animation (seconds since mount)
 *   u_resolution  — canvas size in pixels for aspect-ratio correction
 *   u_mouse       — cursor position in canvas pixels (y-flipped for WebGL)
 *
 * Responsible defaults:
 *   • devicePixelRatio capped at 2 — prevents 3× overdraw on OLED phones
 *   • requestAnimationFrame pauses when the tab is hidden (visibilitychange)
 *   • prefers-reduced-motion → canvas stays hidden; a CSS gradient fallback
 *     on the <section> shows the same palette statically
 *   • WebGL context loss handled — RAF stops and canvas hides gracefully
 */

import { useEffect, useRef } from "react";

// ─── Vertex shader ────────────────────────────────────────────────────────────
// Maps a fullscreen quad (two triangles, already in clip space [-1, 1]²)
// straight to the screen. No MVP matrices needed — we control every pixel
// ourselves in the fragment shader.
const VERT = /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`.trim();

// ─── Fragment shader — "Spice Drift" ─────────────────────────────────────────
const FRAG = /* glsl */ `
precision highp float;

uniform float u_time;       // seconds since mount
uniform vec2  u_resolution; // canvas size in physical pixels
uniform vec2  u_mouse;      // cursor in physical pixels, y-up

// --- Hash ---
// Cheap 2-D pseudo-random scalar via two dot products.
// Maps a grid cell to a value in (0, 1). No trig, no texture lookup.
float hash(vec2 p) {
  p  = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 43.21);
  return fract(p.x * p.y);
}

// --- Value noise ---
// Bilinear interpolation of four hash values at the corners of a unit cell.
// smoothstep easing on fract(p) removes the grid's sharp creases.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = smoothstep(0.0, 1.0, fract(p));
  return mix(
    mix(hash(i),                hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// --- Fractal Brownian Motion ---
// 4 octaves of noise summed at half amplitude / double frequency each time.
// A 0.5-radian rotation per octave breaks axis-aligned streaks and makes
// the result look organic rather than grid-like.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p  = rot * p * 2.0 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  // --- Coordinate setup ---
  // uv: [0,1]² from bottom-left. st: same range but x is stretched by aspect
  // so the pattern doesn't squash on wide screens.
  vec2 uv     = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 st     = vec2(uv.x * aspect, uv.y);

  // Mouse in the same coordinate space. Gentle influence: divide by 8 so
  // it bends the warp field without overpowering it.
  vec2 mouse = vec2(
    u_mouse.x / u_resolution.x * aspect,
    u_mouse.y / u_resolution.y          // already y-up from JS
  );

  float t = u_time * 0.12; // slow-drift speed — feels like warm oil

  // --- Domain warping (two levels) ---
  // Level 1: sample two fbm values to get a 2-D offset vector q.
  // Using different seeds (5.2,1.3) for each axis decorrelates them.
  vec2 q = vec2(
    fbm(st + vec2(0.0, 0.0) + t),
    fbm(st + vec2(5.2, 1.3) + t * 0.9)
  );

  // Mouse bends q toward the cursor. smoothstep limits the effect to a
  // 0.6-unit radius around the cursor so distant areas stay calm.
  float proximity = 1.0 - smoothstep(0.0, 0.6, length(mouse - st));
  vec2  pull      = normalize(mouse - st + 0.001) * 0.20;
  q += pull * proximity;

  // Level 2: use q to offset a second pair of fbm samples, creating the
  // characteristic "folded" look of domain-warped noise.
  vec2 r = vec2(
    fbm(st + 3.5 * q + vec2(1.7, 9.2) + t * 0.55),
    fbm(st + 3.5 * q + vec2(8.3, 2.8) + t * 0.45)
  );

  // Final scalar value that drives colour selection.
  float f = fbm(st + 3.0 * r + t * 0.25);

  // --- Colour ---
  // Three-stop gradient in the Flavorly warm palette:
  //   c0  deep near-black  (base / shadow)
  //   c1  amber            (mid-range)
  //   c2  saffron gold     (bright peaks)
  vec3 c0 = vec3(0.06, 0.03, 0.01);
  vec3 c1 = vec3(0.62, 0.28, 0.04);
  vec3 c2 = vec3(0.90, 0.65, 0.20);

  vec3 col = mix(c0, c1, smoothstep(0.0, 0.55, f));
       col = mix(col, c2, smoothstep(0.45, 0.90, f) * 0.75);

  // Brand-accent thread: a whisper of Flavorly green on the brightest peaks.
  vec3 accent = vec3(0.14, 0.90, 0.58); // #23E694, matches --accent CSS var
  col = mix(col, accent, smoothstep(0.80, 0.95, f) * 0.22);

  // --- Vignette ---
  // Darkens edges so overlaid white text retains contrast in all quadrants.
  float vig = 1.0 - smoothstep(0.25, 1.1, length(st - vec2(aspect * 0.5, 0.5)));
  col *= vig;

  // Cap brightness — the hero text must stay WCAG-AA readable (contrast ≥ 4.5:1
  // against white, so the shader surface must stay below roughly 18% luminance).
  col *= 0.52;

  gl_FragColor = vec4(col, 1.0);
}
`.trim();

// ─── WebGL helpers ────────────────────────────────────────────────────────────

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("[ShaderHero] compile error:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function buildProgram(gl: WebGLRenderingContext) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("[ShaderHero] link error:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ShaderHeroProps {
  children: React.ReactNode;
}

export function ShaderHero({ children }: ShaderHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Reduced-motion guard ──────────────────────────────────────────────
    // If the user prefers reduced motion, leave the canvas hidden.
    // The CSS gradient on the parent <section> is the static fallback.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ── WebGL context ─────────────────────────────────────────────────────
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const prog = buildProgram(gl);
    if (!prog) return;

    // Fullscreen quad: two triangles covering clip space [-1,1]²
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(prog);
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    // ── State ─────────────────────────────────────────────────────────────
    const start = performance.now();
    let rafId = 0;
    let paused = false;
    // Default mouse to hero centre so the warp is symmetrical on load.
    let mx = canvas.clientWidth / 2;
    let my = canvas.clientHeight / 2;
    const DPR = Math.min(devicePixelRatio, 2); // cap at 2× — no 3× OLED overdraw

    // ── Render loop ───────────────────────────────────────────────────────
    function render() {
      if (paused) return;

      // Resize canvas to match its CSS size (at capped DPR).
      const w = Math.floor(canvas!.clientWidth  * DPR);
      const h = Math.floor(canvas!.clientHeight * DPR);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width  = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }

      const elapsed = (performance.now() - start) / 1000;
      gl!.uniform1f(uTime,  elapsed);
      gl!.uniform2f(uRes,   w, h);
      // Mouse is tracked in CSS pixels; scale up to physical pixels,
      // and flip y so WebGL's y-up matches our y-down DOM coordinates.
      gl!.uniform2f(uMouse, mx * DPR, (canvas!.clientHeight - my) * DPR);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    }

    // ── Input tracking ────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }
    function onTouchMove(e: TouchEvent) {
      const r = canvas!.getBoundingClientRect();
      mx = e.touches[0].clientX - r.left;
      my = e.touches[0].clientY - r.top;
    }

    // ── Visibility pause ─────────────────────────────────────────────────
    // When the tab is backgrounded the GPU still renders unless we stop RAF.
    function onVisibility() {
      paused = document.hidden;
      if (!paused) render();
    }

    // ── Context loss ──────────────────────────────────────────────────────
    function onContextLost(e: Event) {
      e.preventDefault();
      cancelAnimationFrame(rafId);
      canvas!.style.opacity = "0";
    }

    canvas.addEventListener("webglcontextlost", onContextLost);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Fade in once the first frame renders so there's no flash.
    requestAnimationFrame(() => {
      render();
      canvas!.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(rafId);
      canvas!.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    // The CSS gradient is the prefers-reduced-motion fallback AND the
    // background shown before WebGL initialises — zero layout shift.
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f0502 0%, #2a0f01 45%, #080e07 100%)",
      }}
    >
      {/* WebGL canvas — absolutely fills the section, fades in after first frame */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: 0 }}
      />
      {/* Hero content sits above the canvas on z-index 10 */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
