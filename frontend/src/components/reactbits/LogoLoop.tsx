import type { ReactElement } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export interface LogoLoopItem {
  node: ReactElement;
  title: string;
}

interface LogoLoopProps {
  logos: LogoLoopItem[];
  /** Seconds for the track to travel one full copy. Higher is slower. */
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

/**
 * Adapted from reactbits.dev "LogoLoop" / "TechLogoLoop".
 *
 * Upstream measures the track with a ResizeObserver and computes how many
 * copies it needs at runtime. Because this marquee always renders exactly two
 * copies of the same list, the seam is guaranteed to land at -50%, so the whole
 * thing reduces to one CSS transform on the `marquee` keyframe — no measurement,
 * no layout thrash, and it keeps running smoothly on a compositor thread.
 *
 * The animated track is hidden from assistive tech (it says everything twice);
 * a single off-screen list carries the real content instead. Under reduced
 * motion the marquee becomes a static wrapped row.
 */
export function LogoLoop({ logos, speed = 42, direction = 'left', className = '' }: LogoLoopProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const renderLogo = (logo: LogoLoopItem, key: string) => (
    <li
      key={key}
      className="flex shrink-0 items-center gap-2.5 px-6 text-muted transition-colors duration-300 hover:text-primary-300"
    >
      <span className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current">{logo.node}</span>
      <span className="whitespace-nowrap font-mono text-xs uppercase tracking-wider">{logo.title}</span>
    </li>
  );

  if (prefersReducedMotion) {
    return (
      <ul className={`flex flex-wrap items-center justify-center gap-y-4 ${className}`}>
        {logos.map((logo) => renderLogo(logo, logo.title))}
      </ul>
    );
  }

  return (
    <div className={`group relative overflow-hidden edge-fade ${className}`}>
      <span className="sr-only">
        Technologies I work with: {logos.map((logo) => logo.title).join(', ')}.
      </span>
      <ul
        className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
        aria-hidden="true"
      >
        {logos.map((logo) => renderLogo(logo, `a-${logo.title}`))}
        {logos.map((logo) => renderLogo(logo, `b-${logo.title}`))}
      </ul>
    </div>
  );
}
