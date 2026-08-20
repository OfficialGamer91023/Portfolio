import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface RotatingTextProps {
  texts: string[];
  /** Milliseconds each phrase stays on screen. */
  rotationInterval?: number;
  /** Milliseconds added per character, front to back. */
  staggerDuration?: number;
  className?: string;
  /** Classes applied to the animated phrase itself. */
  textClassName?: string;
}

/** Duration of the `charOut` keyframe in tailwind.config.js, in milliseconds. */
const EXIT_DURATION = 400;

/**
 * How long the incoming phrase waits before rising. Upstream uses
 * AnimatePresence's "wait" mode, which fully sequences exit then enter; holding
 * back most of the exit duration gives the same read while keeping a little
 * overlap, so the slot never looks empty.
 */
const ENTRY_DELAY = 260;

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

/**
 * Adapted from reactbits.dev "RotatingText".
 *
 * Cycles a list of phrases, staggering each grapheme up into place while the
 * previous phrase exits through the top of the slot.
 *
 * Upstream drives this with `motion` + `AnimatePresence`; this port reproduces
 * the behaviour on the `char-in`/`char-out` keyframes from tailwind.config.js,
 * which avoids adding a second animation library alongside GSAP. Two other
 * deliberate differences: an invisible sizer reserves the width of the longest
 * phrase so surrounding text never reflows mid-rotation, and the live phrase is
 * exposed to assistive tech once via an off-screen node rather than as a stream
 * of individual characters.
 */
export function RotatingText({
  texts,
  rotationInterval = 2600,
  staggerDuration = 22,
  className = '',
  textClassName = '',
}: RotatingTextProps) {
  const [index, setIndex] = useState<number>(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const indexRef = useRef<number>(0);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const longestText = useMemo(
    () => texts.reduce((longest, text) => (text.length > longest.length ? text : longest), ''),
    [texts]
  );

  useEffect(() => {
    if (prefersReducedMotion || texts.length < 2) return;

    const intervalId = setInterval(() => {
      const current = indexRef.current;
      const next = (current + 1) % texts.length;
      indexRef.current = next;

      setExitingIndex(current);
      setIndex(next);

      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = setTimeout(
        () => setExitingIndex(null),
        EXIT_DURATION + texts[current].length * staggerDuration
      );
    }, rotationInterval);

    return () => {
      clearInterval(intervalId);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [texts, rotationInterval, staggerDuration, prefersReducedMotion]);

  // Static rendering: no slot, no animation, just the first phrase. `className`
  // is deliberately dropped — it sizes the animation slot, and applying it to a
  // plain inline span would knock the text off its baseline.
  if (prefersReducedMotion) {
    return <span className={textClassName}>{texts[0]}</span>;
  }

  function renderPhrase(phraseIndex: number, animation: 'in' | 'out'): ReactElement {
    // The very first phrase has nothing to wait for, so it appears immediately.
    const startDelay = animation === 'in' && exitingIndex !== null ? ENTRY_DELAY : 0;

    return (
      <span
        key={`${animation}-${phraseIndex}`}
        className={`absolute inset-0 flex items-center justify-center whitespace-pre ${textClassName}`}
        aria-hidden="true"
      >
        {splitIntoCharacters(texts[phraseIndex]).map((char, charIndex) => (
          <span
            key={`${char}-${charIndex}`}
            className={`inline-block ${animation === 'in' ? 'animate-char-in' : 'animate-char-out'}`}
            style={{ animationDelay: `${startDelay + charIndex * staggerDuration}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`relative inline-flex overflow-hidden align-bottom ${className}`}>
      {/* Reserves the widest phrase's footprint so the layout never jumps. */}
      <span className={`invisible whitespace-pre ${textClassName}`} aria-hidden="true">
        {longestText}
      </span>
      {/* The only copy assistive tech sees. */}
      <span className="sr-only">{texts[index]}</span>
      {exitingIndex !== null && renderPhrase(exitingIndex, 'out')}
      {renderPhrase(index, 'in')}
    </span>
  );
}
