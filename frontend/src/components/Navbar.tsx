import { useEffect, useState } from 'react';
import { PillNav } from './reactbits/PillNav';
import { useActiveSection } from '../hooks/useActiveSection';
import { CV_DOWNLOAD_PATH } from '../config';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Lab', href: '#lab' },
  { label: 'Contact', href: '#contact' },
] as const;

const SECTION_IDS = ['hero', 'about', 'experience', 'projects', 'lab', 'contact'] as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const SCROLL_THRESHOLD = 50;

    function handleScroll(): void {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PillNav
          items={NAV_LINKS.map((link) => ({ ...link }))}
          activeHref={activeSection ? `#${activeSection}` : undefined}
          logo={<span className="text-sm">MRI</span>}
          logoHref="#hero"
          logoLabel="Back to top"
          action={
            <a
              href={CV_DOWNLOAD_PATH}
              download
              id="nav-cv-download"
              className="block rounded-full bg-white px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink-950 transition-colors duration-300 hover:bg-primary-300"
            >
              Download CV
            </a>
          }
        />
      </div>
    </header>
  );
}
