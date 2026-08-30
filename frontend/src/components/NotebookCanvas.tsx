import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface NotebookCanvasProps {
  /** Number of verified-crossing dots marked along the midline. */
  dots?: number;
  /** Radians advanced per frame. */
  speed?: number;
  /** Starting phase. */
  phase0?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Decorative "two curves, verified crossings" figure, drawn on a canvas over the
 * engineering grid. Reads its colours from the theme CSS variables so it repaints
 * correctly in paper and blueprint. Under reduced motion it draws a single static
 * frame and never starts the rAF loop.
 *
 * This is purely ornamental — the real, interactive intersection solver lives in
 * the Lab (`CurveIntersectionToy`).
 */
export function NotebookCanvas({
  dots = 2,
  speed = 0.012,
  phase0 = 0,
  className = '',
  ariaLabel = 'Two curves crossing at verified points',
}: NotebookCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let t = phase0;

    function palette(): { grid: string; plot: string; blue: string; verify: string } {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      // The external stylesheet can apply a beat after this canvas first paints
      // in a production build, so getPropertyValue may briefly return "". An
      // empty string leaves the canvas strokeStyle at its default black, which
      // is the "black scribble" bug. Fall back to the token's literal value for
      // the active theme so the curves are never black; the fallbacks equal the
      // real tokens, so there is no visible change once the vars resolve.
      const dark =
        root.dataset.theme === 'dark' ||
        (root.dataset.theme !== 'light' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      const v = (name: string, fallback: string): string =>
        cs.getPropertyValue(name).trim() || fallback;
      return {
        grid: `rgba(${v('--cv-grid', dark ? '30, 52, 84' : '220, 216, 200')}, 0.7)`,
        plot: v('--plot', dark ? '#f2854e' : '#c2410c'),
        blue: v('--blue', dark ? '#6ea8ff' : '#3155b8'),
        verify: v('--verify', dark ? '#37c98d' : '#0a7d55'),
      };
    }
    let pal = palette();

    function size(): void {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGrid(): void {
      ctx!.strokeStyle = pal.grid;
      ctx!.lineWidth = 1;
      for (let x = 0; x < width; x += 24) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += 24) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }
    }

    function curve(ph: number, amp: number, color: string, dash: number[]): void {
      ctx!.beginPath();
      ctx!.lineWidth = 2;
      ctx!.strokeStyle = color;
      ctx!.setLineDash(dash);
      for (let x = 0; x <= width; x += 5) {
        const y = height / 2 + Math.sin((x / width) * Math.PI * 2 + ph) * amp * Math.sin((x / width) * Math.PI);
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();
      ctx!.setLineDash([]);
    }

    function frame(): void {
      ctx!.clearRect(0, 0, width, height);
      drawGrid();
      curve(t, height * 0.26, pal.plot, []);
      curve(-t * 1.25 + 1, height * 0.2, pal.blue, [6, 5]);
      for (let i = 1; i <= dots; i++) {
        const px = (width * i) / (dots + 1);
        ctx!.beginPath();
        ctx!.arc(px, height / 2, 3.5, 0, 7);
        ctx!.fillStyle = pal.verify;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(px, height / 2, 8, 0, 7);
        ctx!.strokeStyle = pal.verify;
        ctx!.globalAlpha = 0.4;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }
      if (!prefersReducedMotion) {
        t += speed;
        raf = requestAnimationFrame(frame);
      }
    }

    size();
    frame();

    function onResize(): void {
      pal = palette();
      size();
      if (prefersReducedMotion) frame();
    }
    window.addEventListener('resize', onResize);

    // Repaint when the theme flips (data-theme changes on <html>).
    const observer = new MutationObserver(() => {
      pal = palette();
      if (prefersReducedMotion) frame();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, [dots, speed, phase0, prefersReducedMotion]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={ariaLabel} />;
}
