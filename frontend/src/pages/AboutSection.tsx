import type { ReactElement } from 'react';
import { useSkills } from '../hooks/useSkills';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SectionHeader } from '../components/SectionHeader';
import { AnimatedContent } from '../components/reactbits/AnimatedContent';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { LogoLoop } from '../components/reactbits/LogoLoop';
import { TECH_LOGOS } from '../data/techLogos';

/**
 * One line-art glyph per skill category, replacing the emoji the section used
 * before — emoji render in full colour and broke the palette on a dark canvas.
 */
const CATEGORY_ICONS: Record<string, ReactElement> = {
  Languages: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  ),
  Frontend: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M3 5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25zM3 9h18M7 6h.01M10 6h.01"
    />
  ),
  'Backend & APIs': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M4 6.75A1.75 1.75 0 015.75 5h12.5A1.75 1.75 0 0120 6.75v2.5A1.75 1.75 0 0118.25 11H5.75A1.75 1.75 0 014 9.25v-2.5zm0 8A1.75 1.75 0 015.75 13h12.5A1.75 1.75 0 0120 14.75v2.5A1.75 1.75 0 0118.25 19H5.75A1.75 1.75 0 014 17.25v-2.5zM7.5 8h.01M7.5 16h.01"
    />
  ),
  Databases: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M4 6c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3"
    />
  ),
  'Cloud & DevOps': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M6.75 19.5a4.5 4.5 0 01-.53-8.97 6 6 0 0111.6-1.77 4.125 4.125 0 01.68 8.19H6.75z"
    />
  ),
  'ML/AI': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7V7zm3.5 3.5h3v3h-3v-3z"
    />
  ),
  Tools: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M11.42 15.17L6.7 19.89a2.25 2.25 0 01-3.18-3.18l4.72-4.72m3.18 3.18a6 6 0 007.62-7.62l-2.9 2.9-2.82-.75-.76-2.82 2.9-2.9a6 6 0 00-7.62 7.62"
    />
  ),
};

const FALLBACK_ICON: ReactElement = (
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.6}
    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  />
);

export function AboutSection() {
  const { skills, loading, error } = useSkills();

  return (
    <section id="about" className="relative py-24 lg:py-32">
      {/* Section-wide ambient tint keeps the dark canvas from reading as flat black. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(59,130,246,0.07),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="About Me"
          title="Passionate about building"
          accent="real things"
          description="I'm a Computer Science graduate from GIK Institute with a track record of shipping production code. From contributing to Inkscape (3M+ users) and building robust C++ libraries through Google Summer of Code, to designing cloud solutions at Systems Limited — I bring a builder's mindset to every team I join."
          descriptionClassName="max-w-2xl"
        />

        {/* Technology marquee */}
        <AnimatedContent delay={0.1}>
          <div className="mb-16 border-y border-ink-800 py-6">
            <LogoLoop logos={TECH_LOGOS} speed={55} />
          </div>
        </AnimatedContent>

        {/* Skills Grid */}
        {loading && <LoadingSpinner message="Loading skills..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skills.map((group, index) => (
              <AnimatedContent key={group.category} delay={index * 0.06} className="h-full">
                <SpotlightCard className="h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-400/20 bg-primary-500/10 text-primary-300">
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        {CATEGORY_ICONS[group.category] ?? FALLBACK_ICON}
                      </svg>
                    </span>
                    <h3 className="text-sm font-semibold text-white">{group.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <SkillBadge key={skill} name={skill} />
                    ))}
                  </div>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
