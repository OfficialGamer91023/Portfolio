import { Reveal } from '../components/Reveal';
import { CV_DOWNLOAD_PATH } from '../config';

const EMAIL = 'rafay119muhammad@gmail.com';

const LINKS = [
  { label: 'github', href: 'https://github.com/OfficialGamer91023', external: true },
  { label: 'gitlab', href: 'https://gitlab.com/rafay119muhammad', external: true },
  {
    label: 'linkedin',
    href: 'https://www.linkedin.com/in/muhammad-rafay-irfan-7341b7247/',
    external: true,
  },
  { label: 'CV ✓', href: CV_DOWNLOAD_PATH, external: false, download: true },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 pb-[60px] pt-11">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-lbl">§ 06 — contact</span>
              <p className="mt-1.5 font-serif text-[30px] font-semibold tracking-[-0.01em] text-content">
                Let&apos;s build something that holds up.
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-3 inline-block border-b border-plot/40 font-mono text-sm text-plot"
              >
                {EMAIL}
              </a>
            </div>

            <div className="flex items-center gap-5 font-mono text-xs text-content-3">
              {LINKS.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-content"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    download
                    className="text-verify transition-opacity hover:opacity-80"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>

          <p className="mt-8 font-mono text-[11px] text-content-3">
            © {year} Muhammad Rafay Irfan · Lahore, PK · compiled {year} · all curves verified
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
