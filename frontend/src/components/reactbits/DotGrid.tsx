import { useCallback, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(InertiaPlugin);

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  inertiaApplied: boolean;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  /** Radius in px within which dots take on `activeColor` and can be pushed. */
  proximity?: number;
  /** Pointer speed (px/s) above which dots get shoved aside. */
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
}

function throttle(fn: (event: MouseEvent) => void, limit: number): (event: MouseEvent) => void {
  let lastCall = 0;
  return (event: MouseEvent) => {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(event);
    }
  };
}

function hexToRgb(hex: string): Rgb {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/**
 * Adapted from reactbits.dev "DotGrid".
 *
 * A canvas of dots that brighten near the pointer and get shoved aside by fast
 * movement or a click, springing back with GSAP's InertiaPlugin.
 *
 * Differences from upstream: the wrapper is an absolutely positioned, decorative
 * layer rather than a padded flex `section` (it sits behind the hero, not beside
 * it); an `alpha` prop lets the grid sit at low contrast behind text; and under
 * reduced motion it paints the grid exactly once and registers no pointer
 * handlers or animation frames at all, so the texture survives but nothing moves.
 */
export function DotGrid({
  dotSize = 2.5,
  gap = 26,
  baseColor = '#2b3350',
  activeColor = '#7dd3fc',
  proximity = 130,
  speedTrigger = 100,
  shockRadius = 220,
  shockStrength = 4,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = '',
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999, lastTime: 0, lastX: 0, lastY: 0 });
  const prefersReducedMotion = usePrefersReducedMotion();

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null;
    const path = new Path2D();
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return path;
  }, [dotSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !circlePath) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x: px, y: py } = pointerRef.current;
    const proximitySquared = proximity * proximity;

    for (const dot of dotsRef.current) {
      const dx = dot.cx - px;
      const dy = dot.cy - py;
      const distanceSquared = dx * dx + dy * dy;

      let fillStyle = baseColor;
      if (distanceSquared <= proximitySquared) {
        const t = 1 - Math.sqrt(distanceSquared) / proximity;
        const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
        const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
        const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
        fillStyle = `rgb(${r},${g},${b})`;
      }

      ctx.save();
      ctx.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset);
      ctx.fillStyle = fillStyle;
      ctx.fill(circlePath);
      ctx.restore();
    }
  }, [circlePath, proximity, baseColor, baseRgb, activeRgb]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const cell = dotSize + gap;
    const cols = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);
    const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2;
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          inertiaApplied: false,
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  // Build (and rebuild on resize). Under reduced motion this is also the only
  // place anything gets painted.
  useEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;

    function rebuild(): void {
      buildGrid();
      if (prefersReducedMotion) draw();
    }

    rebuild();

    const observer = new ResizeObserver(rebuild);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [buildGrid, draw, prefersReducedMotion]);

  // Continuous repaint — only while motion is allowed.
  useEffect(() => {
    if (prefersReducedMotion || !circlePath) return;

    let rafId = 0;
    const tick = (): void => {
      draw();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [draw, circlePath, prefersReducedMotion]);

  // Pointer interaction.
  useEffect(() => {
    if (prefersReducedMotion) return;

    function pushDot(dot: Dot, pushX: number, pushY: number): void {
      dot.inertiaApplied = true;
      gsap.killTweensOf(dot);
      gsap.to(dot, {
        inertia: { xOffset: pushX, yOffset: pushY, resistance },
        onComplete: () => {
          gsap.to(dot, {
            xOffset: 0,
            yOffset: 0,
            duration: returnDuration,
            ease: 'elastic.out(1,0.75)',
          });
          dot.inertiaApplied = false;
        },
      });
    }

    function onMove(e: MouseEvent): void {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = performance.now();
      const pointer = pointerRef.current;
      const dt = pointer.lastTime ? now - pointer.lastTime : 16;
      let vx = ((e.clientX - pointer.lastX) / dt) * 1000;
      let vy = ((e.clientY - pointer.lastY) / dt) * 1000;
      let speed = Math.hypot(vx, vy);

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }

      pointer.lastTime = now;
      pointer.lastX = e.clientX;
      pointer.lastY = e.clientY;

      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;

      if (speed <= speedTrigger) return;

      for (const dot of dotsRef.current) {
        if (dot.inertiaApplied) continue;
        const distance = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);
        if (distance >= proximity) continue;
        pushDot(dot, dot.cx - pointer.x + vx * 0.005, dot.cy - pointer.y + vy * 0.005);
      }
    }

    function onClick(e: MouseEvent): void {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        if (dot.inertiaApplied) continue;
        const distance = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (distance >= shockRadius) continue;
        const falloff = Math.max(0, 1 - distance / shockRadius);
        pushDot(dot, (dot.cx - cx) * shockStrength * falloff, (dot.cy - cy) * shockStrength * falloff);
      }
    }

    const throttledMove = throttle(onMove, 40);
    window.addEventListener('mousemove', throttledMove, { passive: true });
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', throttledMove);
      window.removeEventListener('click', onClick);
      dotsRef.current.forEach((dot) => gsap.killTweensOf(dot));
    };
  }, [
    prefersReducedMotion,
    maxSpeed,
    speedTrigger,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
  ]);

  return (
    <div ref={wrapperRef} className={`absolute inset-0 ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
