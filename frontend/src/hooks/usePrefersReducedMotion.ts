import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's OS-level "reduce motion" preference and stays in sync if
 * they change it mid-session.
 *
 * Animated components call this and render a static equivalent when it returns
 * true, so GSAP timelines, canvas loops and marquees never start at all rather
 * than merely being sped up by the CSS backstop in index.css.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia(QUERY);

    function handleChange(event: MediaQueryListEvent): void {
      setPrefersReducedMotion(event.matches);
    }

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
