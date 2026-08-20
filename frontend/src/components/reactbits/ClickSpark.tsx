import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ClickSparkProps {
  children?: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  /** Milliseconds for one spark to travel and fade. */
  duration?: number;
  /** Classes for the wrapper — set the positioning context here. */
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

/**
 * Adapted from reactbits.dev "ClickSpark".
 *
 * Radiates a short burst of lines from the click point on a canvas overlaid on
 * its children.
 *
 * Upstream wraps the whole page; here it is applied only around the two hero
 * CTAs and the contact submit button, so the feedback reads as a property of
 * those controls rather than ambient page noise. The wrapper class is
 * configurable (upstream hard-codes `w-full h-full`) so it can hug an inline
 * button group, and the canvas/RAF loop is skipped entirely under reduced motion.
 */
export function ClickSpark({
  children,
  sparkColor = '#60a5fa',
  sparkSize = 9,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 420,
  className = 'relative',
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Match the canvas backing store to the wrapper as it resizes.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    function resize(): void {
      if (!canvas || !parent) return;
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const easeOut = useCallback((t: number) => t * (2 - t), []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let rafId = 0;
    const drawFrame = (timestamp: number): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const eased = easeOut(elapsed / duration);
        const distance = eased * sparkRadius;
        const lineLength = sparkSize * (1 - eased);
        const cos = Math.cos(spark.angle);
        const sin = Math.sin(spark.angle);

        ctx.beginPath();
        ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
        ctx.lineTo(spark.x + (distance + lineLength) * cos, spark.y + (distance + lineLength) * sin);
        ctx.stroke();

        return true;
      });

      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [sparkColor, sparkSize, sparkRadius, duration, easeOut, prefersReducedMotion]);

  function handleClick(e: ReactMouseEvent<HTMLDivElement>): void {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const rect = canvas.getBoundingClientRect();
    const now = performance.now();

    for (let i = 0; i < sparkCount; i++) {
      sparksRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      });
    }
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className} onClick={handleClick}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      {children}
    </div>
  );
}
