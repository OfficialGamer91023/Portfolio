import { lazy, Suspense } from 'react';
import { AuroraGlow } from '../components/reactbits/AuroraGlow';
import { SplitText } from '../components/reactbits/SplitText';
import { GradientText } from '../components/reactbits/GradientText';
import { RotatingText } from '../components/reactbits/RotatingText';
import { StarBorder } from '../components/reactbits/StarBorder';
import { ShinyText } from '../components/reactbits/ShinyText';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { AnimatedContent } from '../components/reactbits/AnimatedContent';
import { CV_DOWNLOAD_PATH } from '../config';

// The dot grid is decorative and pulls in GSAP's InertiaPlugin, so it is split
// out of the initial bundle and streamed in behind the aurora wash.
const DotGrid = lazy(() =>
  import('../components/reactbits/DotGrid').then((module) => ({ default: module.DotGrid }))
);

/**
 * Roles the hero cycles through. The first entry completes the site's original
 * headline — "Software Engineer & Open Source Developer" — which is what renders
 * on first paint and under reduced motion.
 */
const ROLES = [
  'Open Source Developer',
  'Fullstack Engineer',
  'Systems Programmer',
  'GSoC Contributor',
] as const;

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pb-24 pt-32"
    >
      {/* Background layers. Kept at z-0 (not a negative z-index) because neither
          the section nor the app shell establishes a stacking context, so a
          negative layer would slide behind the shell's opaque background. */}
      <div className="absolute inset-0 z-0">
        <AuroraGlow intensity={0.75} />
        <Suspense fallback={null}>
          <DotGrid />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Availability tag */}
        <AnimatedContent distance={20} duration={0.6}>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-400/25 bg-primary-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-200 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-400" />
            </span>
            Open to opportunities
          </p>
        </AnimatedContent>

        {/* Name */}
        <h1 className="mt-8 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          <SplitText
            tag="span"
            text="Muhammad Rafay"
            className="block text-white"
            splitType="chars"
            delay={28}
            duration={0.9}
            from={{ opacity: 0, y: 70, rotateX: -60 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
          />
          <GradientText className="block pb-2">Irfan</GradientText>
        </h1>

        {/* Role — the rotating half completes the original headline. */}
        <AnimatedContent delay={0.35} distance={20}>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 text-lg font-medium text-white/70 sm:text-2xl">
            <span>Software Engineer &amp;</span>
            <RotatingText
              texts={ROLES.map((role) => role)}
              textClassName="font-semibold text-primary-300"
              className="h-[1.6em]"
            />
          </p>
        </AnimatedContent>

        {/* Tagline */}
        <AnimatedContent delay={0.45} distance={20}>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted">
            Computer Science Graduate from GIK Institute with production experience from Google
            Summer of Code and two software engineering internships.
          </p>
        </AnimatedContent>

        {/* CTAs */}
        <AnimatedContent delay={0.55} distance={20}>
          <ClickSpark className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <StarBorder
              as="a"
              href="#projects"
              id="hero-cta-projects"
              className="w-full sm:w-auto"
              innerClassName="w-full"
            >
              View My Work
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </StarBorder>

            <a
              href={CV_DOWNLOAD_PATH}
              download
              id="hero-cta-cv"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink-700 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition-colors duration-300 hover:border-ink-600 hover:bg-white/[0.07] sm:w-auto"
            >
              <svg className="h-4 w-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <ShinyText text="Download CV" />
            </a>
          </ClickSpark>
        </AnimatedContent>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 text-muted/50 transition-colors hover:text-primary-300"
      >
        <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
        </svg>
      </a>
    </section>
  );
}
