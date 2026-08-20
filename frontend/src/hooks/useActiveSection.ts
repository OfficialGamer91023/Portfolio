import { useEffect, useState } from 'react';

/**
 * Reports which of the given section ids is currently the primary one in view,
 * so the navigation can mark it as current.
 *
 * Uses a single scroll listener rather than an IntersectionObserver because the
 * sections are taller than the viewport — "which one is intersecting" is
 * ambiguous, whereas "the last one whose top has passed the marker line" is not.
 */
export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    function handleScroll(): void {
      // A line a third of the way down the viewport decides the winner.
      const marker = window.scrollY + window.innerHeight / 3;

      let current: string | null = null;
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.offsetTop <= marker) current = id;
      }

      // Anything at the very bottom of the page counts as the last section,
      // which may otherwise be too short to reach the marker.
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
      setActiveId(atBottom ? (sectionIds[sectionIds.length - 1] ?? current) : current);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sectionIds]);

  return activeId;
}
