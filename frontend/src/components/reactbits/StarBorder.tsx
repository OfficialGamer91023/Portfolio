import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface StarBorderOwnProps {
  className?: string;
  /** Classes for the inner surface (the part that actually holds the label). */
  innerClassName?: string;
  children?: ReactNode;
  /** Colour of the two comet highlights that orbit the border. */
  color?: string;
  /** CSS duration for one pass of a comet. */
  speed?: CSSProperties['animationDuration'];
  /** Thickness of the glowing gutter, in pixels. */
  thickness?: number;
}

type StarBorderProps<T extends ElementType> = StarBorderOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderOwnProps | 'as'>;

/**
 * Adapted from reactbits.dev "StarBorder".
 *
 * Two radial-gradient "comets" sweep along the top and bottom gutters of the
 * element, reading as a border that catches the light. Polymorphic via `as` so
 * the same treatment works on a link (hero CTA) and a submit button (contact
 * form). Colours are retargeted to the primary accent; the inner surface uses
 * the ink palette instead of upstream's black/gray.
 */
export function StarBorder<T extends ElementType = 'button'>({
  as,
  className = '',
  innerClassName = '',
  color = '#60a5fa',
  speed = '6s',
  thickness = 1.5,
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = (as ?? 'button') as ElementType;
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-xl ${className}`}
      style={{ padding: `${thickness}px 0` }}
      {...rest}
    >
      {!prefersReducedMotion && (
        <>
          <span
            className="absolute bottom-[-11px] right-[-250%] z-0 h-1/2 w-[300%] rounded-full opacity-70 animate-star-movement-bottom"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 10%)`,
              animationDuration: speed,
            }}
            aria-hidden="true"
          />
          <span
            className="absolute left-[-250%] top-[-10px] z-0 h-1/2 w-[300%] rounded-full opacity-70 animate-star-movement-top"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 10%)`,
              animationDuration: speed,
            }}
            aria-hidden="true"
          />
        </>
      )}
      <span
        className={`relative z-[1] flex items-center justify-center gap-2 rounded-[10px] border border-ink-700 bg-gradient-to-b from-ink-800 to-ink-900 px-7 py-3 text-center text-sm font-semibold text-white transition-colors duration-300 hover:border-primary-500/50 hover:from-ink-700 ${innerClassName}`}
      >
        {children}
      </span>
    </Component>
  );
}
