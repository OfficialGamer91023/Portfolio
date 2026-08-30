import { useActiveSection } from '../hooks/useActiveSection';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { label: 'work', href: '#work' },
  { label: 'lab', href: '#lab' },
  { label: 'skills', href: '#skills' },
  { label: 'off_the_clock', href: '#off' },
  { label: 'contact', href: '#contact' },
] as const;

const SECTION_IDS = ['hero', 'thesis', 'work', 'lab', 'skills', 'off', 'log', 'contact'] as const;

export function Navbar() {
  const activeSection = useActiveSection(SECTION_IDS);
  const activeHref = activeSection ? `#${activeSection}` : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-grid bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[940px] items-center justify-between px-6 py-3">
        <a href="#hero" className="font-mono text-sm font-semibold text-content" aria-label="Back to top">
          M.R.I <span className="text-verify">✓</span>
        </a>

        <nav className="flex items-center gap-4 sm:gap-5" aria-label="Primary">
          <ul className="hidden items-center gap-4 font-mono text-xs sm:flex sm:gap-5">
            {NAV_LINKS.map((link) => {
              const isActive = activeHref === link.href;
              const isContact = link.href === '#contact';
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`transition-colors hover:text-content ${
                      isContact ? 'text-plot' : isActive ? 'text-content' : 'text-content-3'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
