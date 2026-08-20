import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface GradientTextProps {
  children: ReactNode;
  /** Gradient stops, cycled left-to-right and back. */
  colors?: string[];
  /** Seconds for one full pan. */
  animationSpeed?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#60a5fa', '#22d3ee', '#8b5cf6', '#60a5fa'];

/**
 * Adapted from reactbits.dev "GradientText".
 *
 * Upstream drives the pan with `motion` + `useAnimationFrame`; this port uses
 * the `gradient` keyframe from tailwind.config.js over an oversized background,
 * which is equivalent visually and dependency-free. When motion is reduced the
 * gradient is still painted, just held still.
 */
export function GradientText({
  children,
  colors = DEFAULT_COLORS,
  animationSpeed = 8,
  className = '',
}: GradientTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${
        prefersReducedMotion ? '' : 'animate-gradient'
      } ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: `${animationSpeed}s`,
      }}
    >
      {children}
    </span>
  );
}
