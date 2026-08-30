import { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Seconds to delay the entrance once in view — used to stagger siblings. */
  delay?: number;
  /** Fraction of the element visible before it plays. */
  threshold?: number;
}

/**
 * Scroll-reveal wrapper that is VISIBLE by default.
 *
 * The entrance transition is a progressive enhancement: the element only hides
 * (`is-armed`) once JS has mounted and an IntersectionObserver is watching it,
 * then reveals (`is-in`) when it scrolls into view. If JS never runs, is slow to
 * load, or the user prefers reduced motion, the content is simply present — this
 * is deliberately the opposite of the old `AnimatedContent`, which hid content
 * until GSAP loaded and so blanked the page on a cold load.
 */
export function Reveal({
  children,
  delay = 0,
  threshold = 0.15,
  className = '',
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    // Arm (hide) only now that we can guarantee we will also reveal it.
    el.classList.add('is-armed');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in');
            observer.disconnect();
          }
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion, threshold]);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: delay ? `${delay}s` : undefined, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
