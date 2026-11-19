'use client';

import { useEffect, useRef } from 'react';
import type { GradientASCIIProps } from './GradientASCII';
import './GradientASCII.css';

/**
 * Canvas-2D replica of GradientASCII for browsers without WebGL2.
 *
 * The pipeline mirrors the shader: evaluate the flipped `horizon` field, map
 * both field channels through the colour ramp in OKLab, mix them by the shape
 * weight, then draw a monospace glyph grid additively on top.
 */

type RGB = [number, number, number];
type Lab = [number, number, number];

const DEFAULT_COLORS = ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'];
const DEFAULT_CHARACTERS = ' =+xX0S8#@';
const DEFAULT_FONT = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const INTRO_SECONDS = 2.4;
const CLICK_LIFE = 1.2;
const TRAIL_LIFE = 0.7;
const TRAIL_STEP = 0.015;
const MAX_TRAIL = 24;
const MAX_CLICKS = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clamp01 = (value: number) => clamp(value, 0, 1);
const fract = (value: number) => value - Math.floor(value);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const toLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const encode = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;

const toLab = ([r, g, b]: RGB): Lab => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const labToRgb = ([l, a, b]: Lab): RGB => {
  let ll = l + 0.3963377774 * a + 0.2158037573 * b;
  let mm = l - 0.1055613458 * a - 0.0638541728 * b;
  let ss = l - 0.0894841775 * a - 1.291485548 * b;
  ll = ll * ll * ll;
  mm = mm * mm * mm;
  ss = ss * ss * ss;
  return [
    4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss,
  ];
};

const luma = (rgb: RGB) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

const dot2 = (pair: [number, number], x: number, y: number) => pair[0] * x + pair[1] * y;

/** Shader `hash22`: two independent values in [-1, 1]. */
const hash22 = (x: number, y: number): [number, number] => {
  let qx = fract(x * 0.1031);
  let qy = fract(y * 0.103);
  let qz = fract(x * 0.0973);
  const d = qx * (qy + 33.33) + qy * (qz + 33.33) + qz * (qx + 33.33);
  qx += d;
  qy += d;
  qz += d;
  return [fract((qx + qy) * qz) * 2 - 1, fract((qx + qz) * qy) * 2 - 1];
};

/** Shader `hash12`: one value in [0, 1]. */
const hash12 = (x: number, y: number) => {
  let qx = fract(x * 0.1031);
  let qy = fract(y * 0.1031);
  let qz = fract(x * 0.1031);
  const d = qx * (qy + 33.33) + qy * (qz + 33.33) + qz * (qx + 33.33);
  qx += d;
  qy += d;
  qz += d;
  return fract((qx + qy) * qz);
};

const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const a = dot2(hash22(ix, iy), fx, fy);
  const b = dot2(hash22(ix + 1, iy), fx - 1, fy);
  const c = dot2(hash22(ix, iy + 1), fx, fy - 1);
  const d = dot2(hash22(ix + 1, iy + 1), fx - 1, fy - 1);
  return 0.5 + 0.5 * mix(mix(a, b, ux), mix(c, d, ux), uy);
};

const parseColor = (value: string): RGB => {
  let hex = value.trim().replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }
  if (hex.length === 6) {
    const int = Number.parseInt(hex, 16);
    if (Number.isFinite(int)) {
      return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
    }
  }
  return [0, 0, 0];
};

interface Tone {
  lab: Lab;
  alpha: number;
}

interface Field {
  rgb: RGB;
  alpha: number;
  value: number;
  order: number;
}

interface Point {
  x: number;
  y: number;
  age: number;
}

interface Click extends Point {
  effect: number;
}

interface Settings {
  colors: string[];
  characters: string;
  cellSize: number;
  density: number;
  glyphOpacity: number;
  glow: number;
  flicker: number;
  softness: number;
  scale: number;
  flow: number;
  speed: number;
  gradientOpacity: number;
  grain: number;
  mouseInteraction: boolean;
  scrambleRadius: number;
  clickEffect: GradientASCIIProps['clickEffect'];
  intro: boolean;
  fontFamily: string;
  dpr?: number;
}

const GradientASCII2D = (props: GradientASCIIProps) => {
  const {
    colors = DEFAULT_COLORS,
    characters = DEFAULT_CHARACTERS,
    cellSize = 18,
    density = 0.8,
    glyphOpacity = 0.85,
    glow = 0.2,
    flicker = 0.2,
    softness = 0.5,
    scale = 1,
    flow = 0.5,
    speed = 1,
    gradientOpacity = 0.9,
    grain = 0.08,
    mouseInteraction = true,
    scrambleRadius = 0.1,
    clickEffect = 'wave',
    intro = true,
    fontFamily = DEFAULT_FONT,
    dpr,
    className = '',
    style,
  } = props;

  const settings: Settings = {
    colors: (colors.length > 1 ? colors : [colors[0], colors[0]]).slice(0, 8),
    characters: characters || DEFAULT_CHARACTERS,
    cellSize,
    density,
    glyphOpacity,
    glow,
    flicker,
    softness,
    scale,
    flow,
    speed,
    gradientOpacity,
    grain,
    mouseInteraction,
    scrambleRadius,
    clickEffect,
    intro,
    fontFamily: fontFamily || DEFAULT_FONT,
    dpr,
  };
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const {
      colors,
      characters,
      cellSize,
      density,
      glyphOpacity,
      glow,
      flicker,
      softness,
      scale,
      flow,
      speed,
      gradientOpacity,
      grain,
      mouseInteraction,
      scrambleRadius,
      clickEffect,
      intro,
      fontFamily,
      dpr,
    } = settingsRef.current;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const ramp = colors.map(value => toLab(parseColor(value)));
    const last = ramp.length - 1;

    const glyphs = [...new Set([...characters].filter(char => char !== '\n' && char !== '\r'))];
    if (!glyphs.length) glyphs.push(' ');
    const glyphCount = glyphs.length;
    const effect = clickEffect === 'none' ? 0 : clickEffect === 'burst' ? 2 : 1;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const seedX = Math.random() * 8;
    const seedY = Math.random() * 8;

    const wash = document.createElement('canvas');
    (window as unknown as { __wash?: HTMLCanvasElement }).__wash = wash;
    const washCtx = wash.getContext('2d');
    if (!washCtx) return undefined;

    let width = 1;
    let height = 1;
    let aspect = 1;
    let ratio = 1;
    let cols = 0;
    let rows = 0;
    let cellWidth = 1;
    let cellHeight = 1;
    let offsetX = 0;
    let offsetY = 0;
    let pick = new Float32Array(0);
    let level = new Float32Array(0);
    let washImage: ImageData | null = null;
    let washClock = 0;
    let grainDots = new Float32Array(0);
    let lastTick = -1;
    let time = 0;
    let glyphTime = 0;
    const startedAt = performance.now();
    let introClock = reduce || !intro ? 1 : 0;
    let lastFrame = 0;
    let drawn = false;
    let raf = 0;
    let visible = true;
    let disposed = false;

    const trail: Point[] = [];
    const clicks: Click[] = [];
    const pointer = { x: 0, y: 0, inside: false };

    const styleCache = new Map<number, string>();
    const styleFor = (r: number, g: number, b: number, a: number) => {
      const ri = Math.round(clamp01(r) * 15);
      const gi = Math.round(clamp01(g) * 15);
      const bi = Math.round(clamp01(b) * 15);
      const ai = Math.round(clamp01(a) * 19);
      const key = ((ri * 16 + gi) * 16 + bi) * 20 + ai;
      let value = styleCache.get(key);
      if (!value) {
        value = `rgba(${Math.round((ri / 15) * 255)},${Math.round((gi / 15) * 255)},${Math.round(
          (bi / 15) * 255
        )},${((ai + 0.5) / 20).toFixed(3)})`;
        styleCache.set(key, value);
      }
      return value;
    };

    const toneAt = (t: number): Tone => {
      const x = smoothstep(0.3, 1, t) ** 1.45 * last;
      const index = Math.min(last, Math.floor(x));
      const next = Math.min(last, index + 1);
      const f = x - Math.floor(x);
      return {
        lab: [
          mix(ramp[index][0], ramp[next][0], f),
          mix(ramp[index][1], ramp[next][1], f),
          mix(ramp[index][2], ramp[next][2], f),
        ],
        alpha: smoothstep(0, 0.38, t),
      };
    };

    const sample = (u: number, v: number, reveal: number): Field => {
      // Matches the shader: centre and aspect-correct p, flip vertically, then
      // scale before evaluating the horizon.
      const px = (u - 0.5) * aspect;
      const py = v - 0.5;
      let qx = px / scale;
      let qy = -py / scale;

      if (flow > 0) {
        const wx =
          noise(qx * 1.6 + seedX, qy * 1.6 + seedY + time * 0.3) - 0.5;
        const wy =
          noise(qx * 1.6 + seedY + 4.3, qy * 1.6 + seedX - time * 0.24) - 0.5;
        qx += wx * flow * 0.18;
        qy += wy * flow * 0.18;
      }

      const span = 0.5 * Math.max(aspect, 1);
      const nx = qx / span;
      const arch = -0.17 - 0.2 * nx * nx + 0.02 * Math.sin(time * 0.6);
      const soft = 0.05 + 0.17 * softness;
      const edge = qy - arch;
      const rim = 0.38 * smoothstep(-soft, 0.42, edge);
      const sunX = 0.08 * Math.sin(time * 0.31) * span;
      const dx = (qx - sunX) / (0.95 * span);
      const dy = (qy - 0.58) / 0.75;
      const spread = Math.hypot(dx, dy);
      const sky = 0.55 + 0.45 * smoothstep(0.2, 0.95, spread);
      const order = clamp01(edge * 1.3);
      const shape = smoothstep(0.18, 0.62, edge);

      const gain = mix(0.7, 1, reveal);
      const a = toneAt(clamp01(rim * gain));
      const b = toneAt(clamp01(sky * gain));
      const lab: Lab = [
        mix(a.lab[0], b.lab[0], shape),
        mix(a.lab[1], b.lab[1], shape),
        mix(a.lab[2], b.lab[2], shape),
      ];
      const alpha = mix(a.alpha, b.alpha, shape) * reveal;
      const linear = labToRgb(lab);
      // Cheap stand-in for the shader's bloom pass: a soft additive lift that
      // follows the field alpha, so the glyph field keeps its hazy glow.
      const lift = 0.08 * glow * alpha;
      const rgb: RGB = [
        clamp01(encode(linear[0]) + lift),
        clamp01(encode(linear[1]) + lift),
        clamp01(encode(linear[2]) + lift),
      ];
      return { rgb, alpha, value: luma(rgb) * alpha, order };
    };

    const revealAt = (order: number) =>
      smoothstep(0, 1, clamp01((introClock * 1.45 - order) / 0.45));

    const updateWash = () => {
      const w = wash.width;
      const h = wash.height;
      if (!washImage || washImage.width !== w || washImage.height !== h) {
        washImage = washCtx.createImageData(w, h);
      }
      const data = washImage.data;
      for (let y = 0; y < h; y++) {
        const v = 1 - (y + 0.5) / h;
        for (let x = 0; x < w; x++) {
          const u = (x + 0.5) / w;
          let field = sample(u, v, 1);
          if (introClock < 1) field = sample(u, v, revealAt(field.order));
          const i = (y * w + x) * 4;
          data[i] = Math.round(clamp01(field.rgb[0] * field.alpha * gradientOpacity) * 255);
          data[i + 1] = Math.round(clamp01(field.rgb[1] * field.alpha * gradientOpacity) * 255);
          data[i + 2] = Math.round(clamp01(field.rgb[2] * field.alpha * gradientOpacity) * 255);
          data[i + 3] = 255;
        }
      }
      washCtx.putImageData(washImage, 0, 0);
    };

    const scrambleAt = (px: number, py: number) => {
      let scramble = 0;
      if (trail.length) {
        const radiusSq = scrambleRadius * scrambleRadius;
        for (let i = 0; i < trail.length; i++) {
          const point = trail[i];
          if (point.age >= TRAIL_LIFE) continue;
          const k = 1 - point.age / TRAIL_LIFE;
          const dx = px - point.x;
          const dy = py - point.y;
          scramble = Math.max(scramble, k * k * Math.exp(-(dx * dx + dy * dy) / radiusSq));
        }
      }
      for (let i = 0; i < clicks.length; i++) {
        const click = clicks[i];
        const k = click.age / CLICK_LIFE;
        const envelope = Math.min(1, click.age / 0.08) * (1 - k) * (1 - k);
        if (envelope <= 0) continue;
        const distance = Math.hypot(px - click.x, py - click.y);
        if (click.effect === 1) {
          const ring = (distance - click.age * 0.75) / 0.06;
          scramble = Math.max(scramble, Math.exp(-(ring * ring)) * envelope);
        } else if (click.effect === 2) {
          const size = 0.08 + 0.22 * (1 - Math.exp(-click.age * 5));
          scramble = Math.max(
            scramble,
            (1 - smoothstep(size * 0.6, size, distance)) * envelope
          );
        }
      }
      return scramble;
    };

    const renderGlyphs = (target: CanvasRenderingContext2D) => {
      target.globalCompositeOperation = 'lighter';
      target.font = `300 ${Math.round(cellHeight * 0.78)}px ${fontFamily}`;
      target.textAlign = 'center';
      target.textBaseline = 'middle';

      const frame = Math.floor(glyphTime * 20);
      const flip = Math.floor(glyphTime * 9);

      for (let row = 0; row < rows; row++) {
        const cy = offsetY + (row + 0.5) * cellHeight;
        const v = 1 - cy / height;
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          const cx = offsetX + (col + 0.5) * cellWidth;
          const u = cx / width;

          // During the intro the field is dimmed until its region decodes.
          let field = sample(u, v, 1);
          if (introClock < 1) field = sample(u, v, revealAt(field.order));
          if (field.value < 0.008) continue;

          const lv = level[index];
          const tick = flip + Math.floor(lv * 9);
          const wobble =
            (hash12(col * 2.31 + tick * 17.7, row) - 0.5) * flicker * 0.4 +
            (lv - 0.5) * 0.1;
          const tone = clamp01(field.value ** 0.75 + wobble);

          const presence = density * mix(1, 0.3 + tone * 1.1, 0.55);
          if (pick[index] > presence) continue;

          let glyph = Math.floor(tone * (glyphCount - 1) + 0.5);

          const px = (u - 0.5) * aspect;
          const py = v - 0.5;
          const decode = Math.max(scrambleAt(px, py), 1 - introClock);
          if (decode > 0.02 && hash12(col * 3.7 + frame * 5.3, row) < decode * 1.25) {
            glyph = 1 + Math.floor(hash12(col + frame * 1.37, row) * (glyphCount - 1));
          }
          const char = glyphs[glyph];
          if (!char || char === ' ') continue;

          const cutoff = smoothstep(0.03, 0.1, field.value);
          const alpha =
            glyphOpacity * cutoff * mix(1, 0.35 + 0.65 * lv, 0.55);
          if (alpha < 0.02) continue;

          // Shader `light`: premultiplied field colour, slightly lifted.
          const light: RGB = [
            field.rgb[0] * field.alpha * 0.55 + 0.03 * field.alpha,
            field.rgb[1] * field.alpha * 0.55 + 0.03 * field.alpha,
            field.rgb[2] * field.alpha * 0.55 + 0.03 * field.alpha,
          ];
          target.fillStyle = styleFor(light[0], light[1], light[2], alpha);
          target.fillText(char, cx, cy);
        }
      }
    };

    const render = () => {
      // The wash is an opaque, full-bleed image, so no clear is needed.
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(wash, 0, 0, width, height);

      ctx.save();
      renderGlyphs(ctx);
      ctx.restore();

      if (grain > 0.001 && !reduce) {
        ctx.save();
        ctx.fillStyle = `rgba(207,226,255,${(0.04 * clamp01(grain / 0.08)).toFixed(3)})`;
        for (let i = 0; i < grainDots.length; i += 2) {
          ctx.fillRect(grainDots[i] * width, grainDots[i + 1] * height, 1, 1);
        }
        ctx.restore();
      }
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      aspect = width / height;
      ratio = Math.min(dpr || window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);


      cellHeight = clamp(cellSize, 6, 64);
      cellWidth = cellHeight * 0.6;
      cols = Math.ceil(width / cellWidth);
      rows = Math.ceil(height / cellHeight);
      offsetX = (width - cols * cellWidth) / 2;
      offsetY = (height - rows * cellHeight) / 2;

      pick = new Float32Array(cols * rows);
      level = new Float32Array(cols * rows);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          pick[i] = hash12(col + 4.1, row + 9.7);
          level[i] = hash12(col * 1.73 + 4.1, row * 1.73 + 4.1);
        }
      }

      grainDots = new Float32Array(800);
      for (let i = 0; i < 400; i++) {
        grainDots[i * 2] = hash12(i * 1.37 + 3.3, i * 2.11 + 0.5);
        grainDots[i * 2 + 1] = hash12(i * 3.71 + 9.2, i * 0.9 + 7.1);
      }

      const washWidth = Math.max(96, Math.round(width / 8));
      wash.width = washWidth;
      wash.height = Math.max(1, Math.round((height / width) * washWidth));
      washImage = null;

      styleCache.clear();
      washClock = 0;
      updateWash();
      render();
      wake();
    };

    const updateInput = (dt: number) => {
      if (trail.length) {
        for (let i = 0; i < trail.length; i++) trail[i].age += dt;
        while (trail.length && trail[trail.length - 1].age > TRAIL_LIFE) trail.pop();
      }
      if (clicks.length) {
        for (let i = 0; i < clicks.length; i++) clicks[i].age += dt;
        while (clicks.length && clicks[clicks.length - 1].age > CLICK_LIFE) clicks.pop();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      const dt = lastFrame ? clamp((now - lastFrame) / 1000, 0.001, 0.05) : 1 / 60;
      lastFrame = now;
      if (!reduce) {
        // Wall-clock based so the animation pace matches the shader version
        // regardless of the frame rate.
        const elapsed = (now - startedAt) / 1000;
        time = elapsed * speed * 0.5;
        glyphTime = elapsed * Math.max(speed, 0.15);
      }
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);
      updateInput(dt);

      washClock += dt;
      const tick = Math.floor(glyphTime * 9);
      const busy = introClock < 1 || clicks.length > 0 || trail.length > 0;
      if (!drawn || busy || washClock >= 0.08 || tick !== lastTick) {
        lastTick = tick;
        if (washClock >= 0.08) {
          washClock = 0;
          updateWash();
        }
        render();
        drawn = true;
      }

      const animate = !reduce || introClock < 1 || clicks.length > 0 || trail.length > 0;
      if (animate) {
        raf = requestAnimationFrame(frame);
      } else {
        lastFrame = 0;
      }
    };

    function wake() {
      if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const u = (event.clientX - rect.left) / Math.max(1, rect.width);
      const v = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
      pointer.inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;
      const currentAspect = rect.width / Math.max(1, rect.height);
      pointer.x = (u - 0.5) * currentAspect;
      pointer.y = v - 0.5;
    };

    const onPointerMove = (event: PointerEvent) => {
      locate(event);
      if (!pointer.inside || !mouseInteraction || reduce) return;
      const head = trail[0];
      const gap = head ? Math.hypot(pointer.x - head.x, pointer.y - head.y) : Infinity;
      if (gap < TRAIL_STEP) return;
      if (head && head.age < 0.1) {
        const steps = Math.min(6, Math.floor(gap / (TRAIL_STEP * 2)));
        for (let i = 1; i <= steps; i++) {
          const k = i / (steps + 1);
          trail.unshift({
            x: head.x + (pointer.x - head.x) * k,
            y: head.y + (pointer.y - head.y) * k,
            age: 0,
          });
        }
      }
      trail.unshift({ x: pointer.x, y: pointer.y, age: 0 });
      if (trail.length > MAX_TRAIL) trail.length = MAX_TRAIL;
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      locate(event);
      if (!pointer.inside || !effect || reduce) return;
      clicks.unshift({ x: pointer.x, y: pointer.y, age: 0, effect });
      if (clicks.length > MAX_CLICKS) clicks.pop();
      wake();
    };

    const onVisibility = () => {
      lastFrame = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        lastFrame = 0;
        wake();
      }
    });
    intersection.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    document.fonts?.ready?.then(() => {
      if (!disposed) wake();
    });

    resize();
    wakeRef.current = wake;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div
      ref={containerRef}
      className={`gradient-ascii-container${className ? ` ${className}` : ''}`}
      style={style}
    >
      <canvas ref={canvasRef} className="gradient-ascii-canvas" aria-hidden="true" />
    </div>
  );
};

export default GradientASCII2D;
