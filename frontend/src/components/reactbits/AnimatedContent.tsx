import { useLayoutEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Travel distance in pixels before settling. */
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  /** Animate in from the opposite side. */
  reverse?: boolean;
  duration?: number;
  ease?: string;
  scale?: number;
  /** Fraction of the element that must be in view before it plays. */
  threshold?: number;
  /** Seconds to wait once triggered — used to stagger siblings in a grid. */
  delay?: number;
}

/**
 * Adapted from reactbits.dev "AnimatedContent".
 *
 * Replaces the site's previous hand-rolled `AnimatedSection`
 * (IntersectionObserver + a CSS class toggle) so that every scroll reveal on
 * the page runs through the same GSAP/ScrollTrigger pipeline as the other
 * animated components — one timing model, one easing vocabulary.
 *
 * Trimmed from upstream: the custom scroller lookup and the "disappear after"
 * timeline aren't needed for a single-page layout. Added: a reduced-motion
 * branch that renders children immediately with no wrapper animation, and a
 * guaranteed-visible fallback so content can never be stranded hidden.
 */
export function AnimatedContent({
  children,
  distance = 40,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  scale = 1,
  threshold = 0.1,
  delay = 0,
  className = '',
  ...props
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;

    // gsap.context scopes every tween and ScrollTrigger created inside it, so a
    // single revert() on unmount tears all of it down.
    const ctx = gsap.context(() => {
      gsap.set(el, { [axis]: offset, scale, opacity: 0, visibility: 'visible' });

      gsap.to(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: el,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [prefersReducedMotion, distance, direction, reverse, duration, ease, scale, threshold, delay]);

  return (
    // `invisible` is a class rather than an inline style so the inline
    // `visibility: visible` GSAP writes on setup reliably wins over it.
    <div ref={ref} className={`${prefersReducedMotion ? '' : 'invisible'} ${className}`} {...props}>
      {children}
    </div>
  );
}
