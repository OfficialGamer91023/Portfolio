import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ShinyTextProps {
  text: string;
  /** Seconds for one full sweep. */
  speed?: number;
  /** Resting colour of the text. */
  baseColor?: string;
  /** Colour of the highlight band that travels across it. */
  shineColor?: string;
  className?: string;
}

/**
 * Adapted from reactbits.dev "ShinyText".
 *
 * The upstream component animates the sweep with `motion`; this port drives it
 * from the `shine` keyframe in tailwind.config.js instead, so the whole effect
 * is a single background-position animation on a GPU-composited layer and adds
 * no runtime dependency.
 */
export function ShinyText({
  text,
  speed = 5,
  baseColor = 'rgba(255, 255, 255, 0.55)',
  shineColor = 'rgba(255, 255, 255, 0.95)',
  className = '',
}: ShinyTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <span className={className} style={{ color: baseColor }}>
        {text}
      </span>
    );
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent animate-shine ${className}`}
      style={{
        backgroundImage: `linear-gradient(120deg, ${baseColor} 40%, ${shineColor} 50%, ${baseColor} 60%)`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
