import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export interface PillNavItem {
  label: string;
  href: string;
}

interface PillNavProps {
  items: PillNavItem[];
  /** Href of the item to mark as current. */
  activeHref?: string;
  /** Rendered inside the circular logo pill. */
  logo: ReactNode;
  logoHref: string;
  logoLabel: string;
  /** Trailing call-to-action, shown beside the pills on desktop and in the menu on mobile. */
  action: ReactNode;
  className?: string;
}

const EASE = 'power3.out';

/**
 * Adapted from reactbits.dev "PillNav".
 *
 * Each pill hides a circle anchored below its baseline; on hover the circle
 * scales up to flood the pill while the label slides out the top and a second
 * copy slides in from the bottom. The geometry (`R`, `delta`, `originY`) is
 * upstream's — it sizes the circle so its arc exactly covers the pill's corners.
 *
 * Adapted for this codebase: the react-router dependency is dropped (this is a
 * single page, every item is an in-page anchor), the logo is a text mark rather
 * than an `<img>`, an `action` slot carries the CV download, the mobile menu
 * staggers its items in and closes on Escape or an outside click, and the whole
 * GSAP layer is skipped under reduced motion in favour of a plain colour
 * transition.
 */
export function PillNav({
  items,
  activeHref,
  logo,
  logoHref,
  logoLabel,
  action,
  className = '',
}: PillNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const timelineRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const tweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Build one paused timeline per pill, re-measuring on resize and once the
  // webfont settles (label widths shift the circle geometry).
  useEffect(() => {
    if (prefersReducedMotion) return;

    function layout(): void {
      circleRefs.current.forEach((circle, index) => {
        const pill = circle?.parentElement;
        if (!circle || !pill) return;

        const { width, height } = pill.getBoundingClientRect();
        if (width === 0 || height === 0) return;

        const radius = ((width * width) / 4 + height * height) / (2 * height);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1;

        circle.style.width = `${diameter}px`;
        circle.style.height = `${diameter}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${diameter - delta}px` });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const hoverLabel = pill.querySelector<HTMLElement>('.pill-label-hover');

        timelineRefs.current[index]?.kill();
        const timeline = gsap.timeline({ paused: true });
        timeline.to(circle, { scale: 1.2, xPercent: -50, duration: 1, ease: EASE, overwrite: 'auto' }, 0);

        if (label) {
          gsap.set(label, { y: 0 });
          timeline.to(label, { y: -(height + 8), duration: 1, ease: EASE, overwrite: 'auto' }, 0);
        }
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: height + 12, opacity: 0 });
          timeline.to(hoverLabel, { y: 0, opacity: 1, duration: 1, ease: EASE, overwrite: 'auto' }, 0);
        }

        timelineRefs.current[index] = timeline;
      });
    }

    layout();
    window.addEventListener('resize', layout);
    document.fonts?.ready.then(layout).catch(() => {});

    const timelines = timelineRefs.current;
    return () => {
      window.removeEventListener('resize', layout);
      timelines.forEach((timeline) => timeline?.kill());
    };
  }, [items, prefersReducedMotion]);

  // Close the mobile menu on Escape or a click outside it.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    }
    function handlePointerDown(e: MouseEvent): void {
      if (!containerRef.current?.contains(e.target as Node)) setIsMobileMenuOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  // Stagger the menu items in each time the menu opens.
  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu || !isMobileMenuOpen || prefersReducedMotion) return;

    const tween = gsap.fromTo(
      menu.querySelectorAll('.mobile-menu-item'),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: EASE }
    );
    return () => {
      tween.kill();
    };
  }, [isMobileMenuOpen, prefersReducedMotion]);

  function handleEnter(index: number): void {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    tweenRefs.current[index]?.kill();
    tweenRefs.current[index] = timeline.tweenTo(timeline.duration(), { duration: 0.35, ease: EASE, overwrite: 'auto' });
  }

  function handleLeave(index: number): void {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    tweenRefs.current[index]?.kill();
    tweenRefs.current[index] = timeline.tweenTo(0, { duration: 0.25, ease: EASE, overwrite: 'auto' });
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <nav aria-label="Primary" className="flex items-center justify-between gap-3">
        <a
          href={logoHref}
          aria-label={logoLabel}
          id="nav-logo"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-850/80 font-bold tracking-tight text-white backdrop-blur-md transition-colors duration-300 hover:border-primary-400/60 hover:text-primary-300"
        >
          {logo}
        </a>

        {/* Desktop pills */}
        <ul className="hidden items-stretch gap-1 rounded-full border border-ink-700 bg-ink-850/70 p-1 backdrop-blur-md md:flex">
          {items.map((item, index) => {
            const isActive = activeHref === item.href;

            return (
              <li key={item.href} className="flex">
                <a
                  href={item.href}
                  id={`nav-${item.label.toLowerCase()}`}
                  aria-current={isActive ? 'page' : undefined}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                  className={`relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
                    isActive ? 'text-primary-300' : 'text-muted hover:text-white'
                  } ${prefersReducedMotion ? 'hover:bg-white/5' : ''}`}
                >
                  {!prefersReducedMotion && (
                    <span
                      ref={(el) => {
                        circleRefs.current[index] = el;
                      }}
                      className="pointer-events-none absolute left-1/2 bottom-0 z-[1] block rounded-full bg-primary-400 [will-change:transform]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-[2] inline-block leading-none">
                    <span className="pill-label relative z-[2] inline-block leading-none [will-change:transform]">
                      {item.label}
                    </span>
                    {!prefersReducedMotion && (
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-block leading-none text-ink-950 [will-change:transform,opacity]"
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 z-[4] h-1 w-1 -translate-x-1/2 rounded-full bg-primary-400"
                      aria-hidden="true"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">{action}</div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          id="mobile-menu-toggle"
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-full border border-ink-700 bg-ink-850/80 backdrop-blur-md md:hidden"
        >
          <span
            className={`block h-0.5 w-4 rounded bg-white transition-transform duration-300 ${
              isMobileMenuOpen ? 'translate-y-[4px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-4 rounded bg-white transition-transform duration-300 ${
              isMobileMenuOpen ? '-translate-y-[4px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className="absolute inset-x-0 top-[calc(100%+0.75rem)] z-50 rounded-2xl border border-ink-700 bg-ink-900/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href} className="mobile-menu-item">
                <a
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={activeHref === item.href ? 'page' : undefined}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeHref === item.href
                      ? 'bg-primary-500/10 text-primary-300'
                      : 'text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="mobile-menu-item px-1 pb-1 pt-2" onClick={() => setIsMobileMenuOpen(false)}>
              {action}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
