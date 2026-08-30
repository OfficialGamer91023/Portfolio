import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark';

const STORAGE_KEY = 'nb-theme';

/** The theme actually showing right now, resolving "system" against the OS. */
function resolveSystem(): ThemeChoice {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStored(): ThemeChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Runtime theme control for the paper <-> blueprint palette.
 *
 * With no stored choice the site follows the OS preference (no `data-theme`
 * attribute, so the CSS `@media (prefers-color-scheme)` block applies). Toggling
 * writes an explicit choice that wins in both directions and persists.
 *
 * An inline script in index.html applies the stored/OS theme before first paint,
 * so this hook only keeps React in sync after mount — there is no theme flash.
 */
export function useTheme(): { theme: ThemeChoice; toggle: () => void } {
  const [theme, setTheme] = useState<ThemeChoice>(() => readStored() ?? resolveSystem());

  // Keep following the OS while the user has made no explicit choice.
  useEffect(() => {
    if (readStored() !== null || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => setTheme(resolveSystem());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: ThemeChoice = current === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage may be unavailable (private mode) — the attribute still applies */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
