import type { CSSProperties, ReactElement } from 'react';

export interface GlassIconItem {
  icon: ReactElement;
  /** A key of `GRADIENTS`, or any CSS background value. */
  color: string;
  label: string;
  value: string;
  href: string;
}

interface GlassIconsProps {
  items: GlassIconItem[];
  className?: string;
}

const GRADIENTS: Record<string, string> = {
  blue: 'linear-gradient(hsl(217, 91%, 60%), hsl(224, 76%, 48%))',
  cyan: 'linear-gradient(hsl(187, 85%, 53%), hsl(199, 89%, 48%))',
  violet: 'linear-gradient(hsl(258, 90%, 66%), hsl(271, 81%, 56%))',
  indigo: 'linear-gradient(hsl(239, 84%, 67%), hsl(243, 75%, 59%))',
};

function backgroundFor(color: string): CSSProperties {
  return { background: GRADIENTS[color] ?? color };
}

/**
 * Adapted from reactbits.dev "GlassIcons".
 *
 * Each icon is two stacked plates in 3D space: a saturated gradient plate
 * rotated behind, and a frosted glass plate in front that lifts toward the
 * viewer on hover.
 *
 * Upstream renders a grid of bare `<button>`s that reveal their label beneath
 * on hover. Here each item is a real `<a>` in a list, with the label and value
 * always visible beside the icon — a contact method needs to be readable and
 * activatable without hovering, and the destination needs to be a link for
 * keyboard and middle-click users. The lift also plays on `focus-within`, so
 * tabbing through gives the same feedback as hovering.
 */
export function GlassIcons({ items, className = '' }: GlassIconsProps) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isExternal = item.href.startsWith('http');

        return (
          <li key={item.label}>
            <a
              href={item.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="group flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-850/60 p-3 pr-5 transition-colors duration-300 hover:border-ink-600 hover:bg-ink-800/60"
              id={`contact-link-${item.label.toLowerCase()}`}
            >
              <span className="relative block h-12 w-12 shrink-0 [perspective:24em] [transform-style:preserve-3d]">
                <span
                  className="absolute inset-0 block rounded-[1rem] origin-[100%_100%] rotate-[15deg] transition-transform duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.4em,-0.4em,0.4em)] group-focus-within:[transform:rotate(25deg)_translate3d(-0.4em,-0.4em,0.4em)]"
                  style={{ ...backgroundFor(item.color), boxShadow: '0.4em -0.4em 0.7em hsla(223, 10%, 2%, 0.5)' }}
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-0 flex rounded-[1rem] bg-white/10 backdrop-blur-[0.7em] transition-transform duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] [will-change:transform] group-hover:[transform:translate3d(0,0,2em)] group-focus-within:[transform:translate3d(0,0,2em)]"
                  style={{ boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.25) inset' }}
                  aria-hidden="true"
                >
                  <span className="m-auto flex h-5 w-5 items-center justify-center text-white">{item.icon}</span>
                </span>
              </span>

              <span className="min-w-0">
                <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  {item.label}
                </span>
                <span className="block truncate text-sm font-medium text-white/90 transition-colors group-hover:text-primary-300">
                  {item.value}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
