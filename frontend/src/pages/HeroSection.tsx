import { HERO_STATS } from '../data/heroStats';
import { NotebookCanvas } from '../components/NotebookCanvas';

/**
 * The hero renders fully on first paint — no scroll-reveal gating, no data fetch,
 * no webfont visibility hold. This is the section that used to blank the page on a
 * cold load; it is now pure static markup so first meaningful paint is immediate.
 *
 * Styling mirrors the "Verified Notebook" mockup exactly: the name is set in
 * JetBrains Mono (not the serif), the focus values sit in filled plot chips, and
 * the figure is a square card.
 */
export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="mx-auto max-w-[940px] px-6 pb-16 pt-11">
        <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left: identity */}
          <div>
            <p className="inline-flex items-center gap-[9px] font-mono text-xs text-verify">
              <span
                className="h-2 w-2 rounded-full bg-verify"
                style={{ boxShadow: '0 0 0 4px rgba(10,125,85,.14)' }}
              />
              <span>
                open_to_work = <span className="text-verify">true</span>
              </span>
            </p>

            <h1 className="mt-[18px] font-mono font-bold leading-[1.0] tracking-[-0.03em] text-content [font-size:clamp(34px,6.4vw,60px)]">
              Muhammad Rafay
              <br />
              <span className="text-plot">Irfan</span>
            </h1>

            <p className="mt-[18px] font-mono text-[15px] text-content-2">
              <span className="text-verify">focus</span> = [{' '}
              <span className="bg-plot px-1.5 py-px text-paper">systems</span> ,{' '}
              <span className="bg-plot px-1.5 py-px text-paper">ai&nbsp;engineering</span> ]
            </p>

            <p className="mt-[18px] max-w-[46ch] text-base leading-relaxed text-content-2">
              I build systems that stay correct when things get messy, from error-bounded geometry
              in C++ to LLM agents that can&apos;t act without passing a deterministic gate.
            </p>

            <dl className="mt-[26px] flex flex-wrap gap-x-[26px] gap-y-4 font-mono">
              {HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium text-content-2">{stat.label}</dt>
                  <dd className="mt-0.5 text-[22px] font-semibold tracking-[-0.02em] text-content">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: fig.01 — square figure */}
          <figure
            className="nb-card relative m-0 aspect-square overflow-hidden"
            style={{ boxShadow: '0 18px 40px -22px rgba(26,26,23,.35)' }}
          >
            <NotebookCanvas
              dots={2}
              speed={0.012}
              className="absolute inset-0 h-full w-full"
              ariaLabel="Two curves crossing at two verified points"
            />
            <figcaption className="absolute right-2.5 top-2 font-mono text-[10px] text-plot">
              fig.01 — intersection
            </figcaption>
            <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-content-3">
              two curves · verified crossings
            </span>
          </figure>
        </div>
      </div>
    </section>
  );
}
