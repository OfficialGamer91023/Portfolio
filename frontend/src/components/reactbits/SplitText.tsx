import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

type SplitType = 'chars' | 'words' | 'lines' | 'words, chars';

interface SplitTextProps {
  text: string;
  className?: string;
  /** Milliseconds between each piece entering. */
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  /** Fraction of the element that must be in view before the tween runs. */
  threshold?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  textAlign?: CSSProperties['textAlign'];
}

/**
 * Adapted from reactbits.dev "SplitText".
 *
 * Splits a string into lines/words/characters with GSAP's SplitText plugin and
 * staggers them into view once on scroll. Trimmed down from upstream (the
 * disappear/callback plumbing and rootMargin parsing are unused here) and given
 * a reduced-motion branch that renders the plain string with no split at all.
 *
 * `aria: 'auto'` leaves the readable text on the parent and hides the generated
 * per-character spans from assistive tech, so the headline is still announced
 * as one phrase.
 */
export function SplitText({
  text,
  className = '',
  delay = 40,
  duration = 1,
  ease = 'power3.out',
  splitType = 'lines, chars' as SplitType,
  from = { opacity: 0, y: 60 },
  to = { opacity: 1, y: 0 },
  threshold = 0.15,
  tag = 'p',
  textAlign = 'center',
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Splitting before the webfont settles measures the fallback font and leaves
  // characters at the wrong offsets, so wait for it.
  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !text || !fontsLoaded || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const split = new GSAPSplitText(el, {
        type: splitType,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        smartWrap: true,
        aria: 'auto',
      });

      const targets = splitType.includes('chars')
        ? split.chars
        : splitType.includes('words')
          ? split.words
          : split.lines;

      gsap.fromTo(targets, from, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        force3D: true,
        scrollTrigger: {
          trigger: el,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
        },
      });

      // Runs on ctx.revert(): puts the original text node back.
      return () => split.revert();
    }, el);

    return () => ctx.revert();
    // `from`/`to` are object literals from the caller; splitting on their
    // identity would re-split on every render, so they are intentionally read
    // once at setup alongside the values that actually change the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontsLoaded, prefersReducedMotion, splitType, delay, duration, ease, threshold]);

  const Tag = tag as ElementType;

  // Hold the text invisible until the split is wired up, otherwise the
  // un-split string flashes at full opacity for a frame.
  const shouldHide = !prefersReducedMotion && !fontsLoaded;

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{ textAlign, wordWrap: 'break-word', visibility: shouldHide ? 'hidden' : 'visible' }}
    >
      {text}
    </Tag>
  );
}
