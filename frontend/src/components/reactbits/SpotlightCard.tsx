import { useRef, useState } from 'react';
import type { MouseEventHandler, PropsWithChildren } from 'react';

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
  /** Colour of the radial highlight that tracks the pointer. */
  spotlightColor?: string;
}

/**
 * Adapted from reactbits.dev "SpotlightCard".
 *
 * A radial gradient follows the pointer across the card's surface. The port
 * keeps upstream's logic but swaps the hard-coded neutral-900 shell for the
 * project's `surface` token so every card in the site shares one border and
 * background treatment, and it also lights up on keyboard focus (upstream only
 * handled focus on the card element itself) so the effect is not mouse-only.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(96, 165, 250, 0.14)',
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const el = divRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  function reveal(): void {
    setOpacity(1);
  }

  function hide(): void {
    setOpacity(0);
  }

  /** Keyboard focus has no pointer position, so light the card from its centre. */
  function handleFocus(): void {
    const el = divRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({ x: rect.width / 2, y: rect.height / 2 });
    }
    reveal();
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={reveal}
      onMouseLeave={hide}
      onFocus={handleFocus}
      onBlur={hide}
      className={`surface group overflow-hidden p-6 transition-colors duration-300 hover:border-ink-600 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
