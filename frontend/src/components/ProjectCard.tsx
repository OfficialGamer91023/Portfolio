import type { Project } from '../types';
import { BentoCard } from './reactbits/MagicBento';

interface ProjectCardProps {
  project: Project;
  /**
   * True when this card occupies a double-width cell. The grid span itself is
   * applied by the section (the reveal wrapper is the grid item); this only
   * scales the type to suit the wider box.
   */
  wide: boolean;
}

/** The API stores "no link" as a literal '#', not as null. */
function isRealUrl(url: string | null): url is string {
  return url !== null && url !== '' && url !== '#';
}

export function ProjectCard({ project, wide }: ProjectCardProps) {
  return (
    <BentoCard
      className="flex h-full flex-col p-6"
      id={`project-card-${project.id}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          {project.featured && (
            <span className="mb-2 inline-block rounded-full border border-primary-400/30 bg-primary-500/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-primary-300">
              Featured
            </span>
          )}
          <h3
            className={`font-semibold text-white transition-colors duration-300 group-hover:text-primary-200 ${
              wide ? 'text-xl' : 'text-lg'
            }`}
          >
            {project.title}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isRealUrl(project.githubUrl) && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
              aria-label={`Source code for ${project.title}`}
            >
              <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
          {isRealUrl(project.liveUrl) && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-primary-300"
              aria-label={`Live demo for ${project.title}`}
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      <p className="mb-5 flex-grow text-sm leading-relaxed text-muted">{project.description}</p>

      <ul className="mt-auto flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded border border-ink-700 bg-ink-900/70 px-2 py-0.5 font-mono text-[0.68rem] text-primary-200/80"
          >
            {tag}
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}
