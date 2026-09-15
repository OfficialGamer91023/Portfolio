import { useProjects } from '../hooks/useProjects';
import { useContributions } from '../hooks/useContributions';
import { Reveal } from '../components/Reveal';
import type { Project, Contribution } from '../types';

export function WorkSection() {
  const { projects, loading: projectsLoading } = useProjects();
  const { contributions, loading: contribLoading } = useContributions();

  // Only case-shaped projects (problem/method/verified filled) render as cases.
  const cases = projects.filter((p) => p.verified);

  return (
    <section id="work" className="relative border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 py-11">
        <span className="section-idx">§ 01</span>
        <Reveal>
          <div className="mb-1 flex items-baseline justify-between gap-4">
            <h2 className="nb-h2">Selected work</h2>
            {cases.length > 0 && (
              <span className="section-lbl shrink-0" style={{ color: 'var(--ink-3)' }}>
                {cases.length} cases · scroll ↓
              </span>
            )}
          </div>
          <p className="mb-6 font-mono text-sm text-content-3">
            problem → method → <span className="text-verify">verification</span>
          </p>
        </Reveal>

        {/* Fixed-height, scrollable stack — mirrors the open-source ledger below, so
            the section stays compact as the case list grows. */}
        <div className="max-h-[600px] space-y-[18px] overflow-y-auto pr-1">
          {projectsLoading && cases.length === 0
            ? [0, 1, 2].map((i) => <CaseSkeleton key={i} />)
            : cases.map((project, i) => (
                <Reveal key={project.id} delay={i * 0.05}>
                  <WorkCase project={project} />
                </Reveal>
              ))}
        </div>

        {/* Open-source ledger */}
        <Reveal className="mt-14">
          <div className="mb-2.5 flex items-baseline justify-between">
            <span className="section-lbl">open-source ledger</span>
            <span className="section-lbl" style={{ color: 'var(--ink-3)' }}>
              {contributions.length ? `${contributions.length} entries · scroll ↓` : ''}
            </span>
          </div>
          <div className="nb-card max-h-[260px] overflow-y-auto">
            {contribLoading && contributions.length === 0
              ? [0, 1, 2, 3].map((i) => <LedgerSkeleton key={i} />)
              : contributions.map((c) => <LedgerRow key={c.id} contribution={c} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WorkCase({ project }: { project: Project }) {
  return (
    <article className="nb-card grid grid-cols-1 gap-3 p-6 sm:grid-cols-[auto_1fr] sm:gap-[22px]">
      <div className="font-mono text-xs tracking-[0.1em] text-plot sm:[writing-mode:vertical-rl] sm:rotate-180">
        {project.figNo ?? 'fig'}
      </div>
      <div>
        <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-content">{project.title}</h3>
        {project.subtitle && (
          <p className="mt-1 font-mono text-[11px] text-content-3">{project.subtitle}</p>
        )}
        <div className="mt-4 grid gap-2.5">
          <CaseRow k="problem" v={project.problem} />
          <CaseRow k="method" v={project.method} />
          <CaseRow k="verified" v={project.verified} verified />
        </div>
        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-edge bg-paper-2 px-2 py-0.5 font-mono text-[11px] text-content-2"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function CaseRow({ k, v, verified = false }: { k: string; v: string | null; verified?: boolean }) {
  if (!v) return null;
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[76px_1fr] sm:gap-4 sm:items-baseline">
      <span
        className={`font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${
          verified ? 'text-verify' : 'text-content-2'
        }`}
      >
        {k}
      </span>
      <span className={`text-[15px] leading-relaxed ${verified ? 'text-content' : 'text-content-2'}`}>
        {verified && <span className="mr-1 font-semibold text-verify">✓</span>}
        {v}
      </span>
    </div>
  );
}

function LedgerRow({ contribution: c }: { contribution: Contribution }) {
  const inner = (
    <>
      <span className="font-mono text-[13px] font-semibold text-content">{c.project}</span>
      <span className="font-mono text-xs text-content-2">{c.detail}</span>
      <span
        className={`whitespace-nowrap font-mono text-xs ${
          c.statusKind === 'plot' ? 'text-plot' : 'text-verify'
        }`}
      >
        {c.statusKind === 'plot' ? '' : '✓ '}
        {c.status}
      </span>
    </>
  );
  const grid =
    'grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 border-t border-grid px-4 py-3 first:border-t-0 sm:grid-cols-[210px_1fr_auto] sm:gap-4';

  return c.url ? (
    <a href={c.url} target="_blank" rel="noopener noreferrer" className={`${grid} transition-colors hover:bg-paper-2`}>
      {inner}
    </a>
  ) : (
    <div className={grid}>{inner}</div>
  );
}

function CaseSkeleton() {
  return (
    <div className="grid grid-cols-[44px_1fr] gap-5" aria-hidden="true">
      <div className="h-4 w-4 rounded bg-paper-2" />
      <div>
        <div className="h-6 w-2/3 rounded bg-paper-2" />
        <div className="mt-3 h-3 w-1/2 rounded bg-paper-2" />
        <div className="mt-5 space-y-2.5">
          <div className="h-4 w-full rounded bg-paper-2" />
          <div className="h-4 w-11/12 rounded bg-paper-2" />
          <div className="h-4 w-4/5 rounded bg-paper-2" />
        </div>
      </div>
    </div>
  );
}

function LedgerSkeleton() {
  return (
    <div className="flex items-center justify-between border-t border-grid px-4 py-3 first:border-t-0" aria-hidden="true">
      <div className="h-3 w-40 rounded bg-paper-2" />
      <div className="h-3 w-16 rounded bg-paper-2" />
    </div>
  );
}
