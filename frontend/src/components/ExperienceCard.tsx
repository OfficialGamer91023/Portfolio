import type { Experience } from '../types';
import { SpotlightCard } from './reactbits/SpotlightCard';

interface ExperienceCardProps {
  experience: Experience;
  /** Marks the most recent role, which gets the animated border and a badge. */
  isCurrent: boolean;
  /** Suppresses the connector below the final entry. */
  isLast: boolean;
}

export function ExperienceCard({ experience, isCurrent, isLast }: ExperienceCardProps) {
  const isOngoing = experience.endDate === null;
  const dateRange = isOngoing
    ? `${experience.startDate} — Present`
    : `${experience.startDate} — ${experience.endDate}`;

  return (
    <div className="relative pb-10 pl-10 last:pb-0 md:pl-14" id={`experience-card-${experience.id}`}>
      {/* Connector — fades out toward the bottom of the timeline. */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-3 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-ink-700 to-ink-700/20 md:left-[11px]"
          aria-hidden="true"
        />
      )}

      {/* Marker */}
      <span
        className={`absolute left-0 top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full md:left-1 ${
          isCurrent ? 'bg-primary-500/20' : 'bg-ink-800'
        }`}
        aria-hidden="true"
      >
        {isCurrent && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400/40" />}
        <span
          className={`relative h-[7px] w-[7px] rounded-full ${
            isCurrent ? 'bg-primary-400 shadow-[0_0_10px_2px_rgba(96,165,250,0.6)]' : 'bg-ink-600'
          }`}
        />
      </span>

      <SpotlightCard className={isCurrent ? 'border-beam border-primary-500/25' : ''}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{experience.company}</h3>
              {isCurrent && (
                <span className="rounded-full border border-primary-400/30 bg-primary-500/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-primary-300">
                  {isOngoing ? 'Present' : 'Most recent'}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm font-medium text-primary-300">{experience.role}</p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="font-mono text-xs tracking-tight text-white/70">{dateRange}</p>
            <p className="mt-0.5 text-xs text-muted">{experience.location}</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {experience.bullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex} className="flex gap-3 text-sm leading-relaxed text-muted">
              <svg
                className="mt-[7px] h-1.5 w-1.5 shrink-0 text-primary-400/70"
                fill="currentColor"
                viewBox="0 0 8 8"
                aria-hidden="true"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </SpotlightCard>
    </div>
  );
}
