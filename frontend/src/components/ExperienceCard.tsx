import type { Experience } from '../types';

interface ExperienceCardProps {
  experience: Experience;
  index: number;
}

export function ExperienceCard({ experience, index: _index }: ExperienceCardProps) {
  const dateRange = experience.endDate
    ? `${experience.startDate} — ${experience.endDate}`
    : `${experience.startDate} — Present`;

  return (
    <div
      className="relative pl-8 md:pl-12 pb-12 last:pb-0 group"
      id={`experience-card-${experience.id}`}
    >
      {/* Timeline line */}
      <div className="absolute left-0 md:left-4 top-2 bottom-0 w-px bg-gray-200 group-last:hidden" />

      {/* Timeline dot */}
      <div className="absolute left-[-4px] md:left-[12px] top-2 w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-white" />

      {/* Card content */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-primary-100 hover:shadow-md transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-dark">{experience.company}</h3>
            <p className="text-sm font-medium text-primary-600">{experience.role}</p>
          </div>
          <div className="text-sm text-muted text-left sm:text-right">
            <p className="font-medium">{dateRange}</p>
            <p>{experience.location}</p>
          </div>
        </div>

        {/* Bullets */}
        <ul className="space-y-2 mt-4">
          {experience.bullets.map((bullet, bulletIndex) => (
            <li
              key={bulletIndex}
              className="text-sm text-muted leading-relaxed flex gap-2"
            >
              <span className="text-primary-400 mt-1.5 shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
