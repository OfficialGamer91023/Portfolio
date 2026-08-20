import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface AuroraGlowProps {
  className?: string;
  /** Three colour fields, back to front. */
  colors?: [string, string, string];
  /** Overall strength of the wash, 0-1. */
  intensity?: number;
}

const DEFAULT_COLORS: [string, string, string] = ['#3b82f6', '#22d3ee', '#8b5cf6'];

/**
 * A CSS adaptation of the reactbits.dev "SoftAurora" background.
 *
 * The upstream component renders a fragment shader through `ogl`. That would
 * have meant a WebGL runtime (~50 kB gz) and a second rendering model in a
 * codebase that is otherwise GSAP + CSS, so this port reproduces the same
 * effect with three heavily blurred radial gradients drifting on independent
 * `aurora-*` keyframes. It costs nothing at runtime, degrades cleanly, and
 * stops entirely under reduced motion (the colour wash stays, the drift goes).
 */
export function AuroraGlow({
  className = '',
  colors = DEFAULT_COLORS,
  intensity = 0.5,
}: AuroraGlowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [first, second, third] = colors;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className={`absolute -left-[15%] -top-[25%] h-[75vh] w-[75vw] rounded-full blur-[110px] ${
          prefersReducedMotion ? '' : 'animate-aurora-one'
        }`}
        style={{ background: first, opacity: intensity * 0.42 }}
      />
      <div
        className={`absolute -right-[15%] -top-[10%] h-[65vh] w-[65vw] rounded-full blur-[120px] ${
          prefersReducedMotion ? '' : 'animate-aurora-two'
        }`}
        style={{ background: second, opacity: intensity * 0.3 }}
      />
      <div
        className={`absolute -bottom-[25%] left-[15%] h-[60vh] w-[60vw] rounded-full blur-[130px] ${
          prefersReducedMotion ? '' : 'animate-aurora-three'
        }`}
        style={{ background: third, opacity: intensity * 0.36 }}
      />
      {/* Pulls contrast back under the headline without flattening the wash at
          the edges, so text stays legible over the brightest part of the glow. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(7,7,11,0.8),transparent_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  );
}
