import { useExperience } from '../hooks/useExperience';
import { ExperienceCard } from '../components/ExperienceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SectionHeader } from '../components/SectionHeader';
import { AnimatedContent } from '../components/reactbits/AnimatedContent';

export function ExperienceSection() {
  const { experience, loading, error } = useExperience();

  return (
    <section id="experience" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          eyebrow="Experience"
          title="Where I've"
          accent="worked"
          description="Production experience across open source, cloud infrastructure, and fullstack development."
        />

        {loading && <LoadingSpinner message="Loading experience..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <div className="relative">
            {experience.map((exp, index) => (
              <AnimatedContent key={exp.id} delay={index * 0.08} distance={30}>
                <ExperienceCard
                  experience={exp}
                  // The API returns roles newest-first, so the head of the list
                  // is the current/most-recent one.
                  isCurrent={index === 0}
                  isLast={index === experience.length - 1}
                />
              </AnimatedContent>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
