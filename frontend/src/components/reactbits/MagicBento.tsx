import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const DEFAULT_PARTICLE_COUNT = 8;
const DEFAULT_SPOTLIGHT_RADIUS = 320;
const DEFAULT_GLOW_RGB = '96, 165, 250';
const MOBILE_BREAKPOINT = 768;

/** Marks a card as a spotlight/glow target for GlobalSpotlight to find. */
const CARD_CLASS = 'bento-card';

/**
 * True on viewports where hover effects are meaningless and the extra GSAP
 * work is pure cost.
 */
function useIsCompact(): boolean {
  const [isCompact, setIsCompact] = useState<boolean>(false);

  useEffect(() => {
    function check(): void {
      setIsCompact(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isCompact;
}

function createParticle(x: number, y: number, glowRgb: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(${glowRgb}, 1);
    box-shadow: 0 0 6px rgba(${glowRgb}, 0.6);
    pointer-events: none;
    z-index: 2;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** "r, g, b" triple driving the border glow and particles. */
  glowRgb?: string;
  particleCount?: number;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  style?: CSSProperties;
}

/**
 * The card half of reactbits.dev "MagicBento" — particles drifting up on hover,
 * a subtle 3D tilt tracking the pointer, and a magnetic pull toward it.
 *
 * Adapted from upstream's `ParticleCard`: the demo's fixed six-card dataset and
 * inline `<style>` block are gone (the border-glow CSS lives in index.css under
 * `.glow-card`), the shell uses the project's `surface` token, and all of the
 * pointer choreography is skipped on compact viewports and under reduced motion.
 */
export function BentoCard({
  children,
  className = '',
  id,
  glowRgb = DEFAULT_GLOW_RGB,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  enableMagnetism = true,
  style,
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const activeParticlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef<boolean>(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const isCompact = useIsCompact();
  const disabled = prefersReducedMotion || isCompact;

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    activeParticlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => particle.remove(),
      });
    });
    activeParticlesRef.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    const { width, height } = card.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const particle = createParticle(Math.random() * width, Math.random() * height, glowRgb);
        cardRef.current.appendChild(particle);
        activeParticlesRef.current.push(particle);

        gsap.fromTo(
          particle,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
        gsap.to(particle, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
        gsap.to(particle, {
          opacity: 0.25,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        });
      }, i * 110);

      timeoutsRef.current.push(timeoutId);
    }
  }, [particleCount, glowRgb]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element || disabled) return;

    function handleMouseEnter(): void {
      isHoveredRef.current = true;
      spawnParticles();
    }

    function handleMouseLeave(): void {
      isHoveredRef.current = false;
      clearParticles();
      gsap.to(element, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    }

    function handleMouseMove(e: MouseEvent): void {
      if (!element || (!enableTilt && !enableMagnetism)) return;

      const rect = element.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const vars: gsap.TweenVars = { duration: 0.4, ease: 'power2.out', transformPerspective: 1000 };

      if (enableTilt) {
        vars.rotateX = ((relativeY - centerY) / centerY) * -5;
        vars.rotateY = ((relativeX - centerX) / centerX) * 5;
      }
      if (enableMagnetism) {
        vars.x = (relativeX - centerX) * 0.03;
        vars.y = (relativeY - centerY) * 0.03;
      }

      gsap.to(element, vars);
    }

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      clearParticles();
      gsap.killTweensOf(element);
    };
  }, [disabled, enableTilt, enableMagnetism, spawnParticles, clearParticles]);

  return (
    <div
      ref={cardRef}
      id={id}
      className={`${CARD_CLASS} glow-card surface group overflow-hidden transition-colors duration-300 hover:border-ink-600 ${className}`}
      style={{ ['--glow-rgb' as string]: glowRgb, ...style }}
    >
      {children}
    </div>
  );
}

interface GlobalSpotlightProps {
  gridRef: RefObject<HTMLDivElement | null>;
  spotlightRadius?: number;
  glowRgb?: string;
}

/**
 * The ambient half of "MagicBento": a large soft light that follows the pointer
 * across the grid and drives each card's `--glow-*` custom properties, so the
 * nearest card's border lights up along the edge closest to the cursor.
 *
 * Adapted from upstream's `GlobalSpotlight` — same maths, but it attaches the
 * spotlight element to the grid's own section rather than `document.body`
 * (keeping it inside the section's stacking context) and bails out on compact
 * viewports and under reduced motion.
 */
function GlobalSpotlight({
  gridRef,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowRgb = DEFAULT_GLOW_RGB,
}: GlobalSpotlightProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isCompact = useIsCompact();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion || isCompact) return;

    const spotlight = document.createElement('div');
    spotlight.style.cssText = `
      position: fixed;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowRgb}, 0.10) 0%,
        rgba(${glowRgb}, 0.05) 20%,
        rgba(${glowRgb}, 0.02) 40%,
        transparent 70%);
      z-index: 0;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    grid.appendChild(spotlight);

    const proximity = spotlightRadius * 0.5;
    const fadeDistance = spotlightRadius * 0.75;

    function resetCards(): void {
      grid?.querySelectorAll(`.${CARD_CLASS}`).forEach((card) => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
      });
    }

    function handleMouseMove(e: MouseEvent): void {
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        resetCards();
        return;
      }

      let minDistance = Infinity;

      grid.querySelectorAll(`.${CARD_CLASS}`).forEach((card) => {
        const element = card as HTMLElement;
        const cardRect = element.getBoundingClientRect();
        const distance = Math.max(
          0,
          Math.hypot(
            e.clientX - (cardRect.left + cardRect.width / 2),
            e.clientY - (cardRect.top + cardRect.height / 2)
          ) - Math.max(cardRect.width, cardRect.height) / 2
        );

        minDistance = Math.min(minDistance, distance);

        let intensity = 0;
        if (distance <= proximity) intensity = 1;
        else if (distance <= fadeDistance) intensity = (fadeDistance - distance) / (fadeDistance - proximity);

        element.style.setProperty('--glow-x', `${((e.clientX - cardRect.left) / cardRect.width) * 100}%`);
        element.style.setProperty('--glow-y', `${((e.clientY - cardRect.top) / cardRect.height) * 100}%`);
        element.style.setProperty('--glow-intensity', intensity.toString());
        element.style.setProperty('--glow-radius', `${spotlightRadius}px`);
      });

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlight, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out',
      });
    }

    function handleMouseLeave(): void {
      resetCards();
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(spotlight);
      spotlight.remove();
    };
  }, [gridRef, spotlightRadius, glowRgb, prefersReducedMotion, isCompact]);

  return null;
}

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  glowRgb?: string;
}

/** Grid wrapper that owns the shared spotlight for the cards inside it. */
export function BentoGrid({ children, className = '', glowRgb = DEFAULT_GLOW_RGB }: BentoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={gridRef} className={`relative ${className}`}>
      <GlobalSpotlight gridRef={gridRef} glowRgb={glowRgb} />
      {children}
    </div>
  );
}
