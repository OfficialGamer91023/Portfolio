import { useExperience } from '../hooks/useExperience';
import { ExperienceCard } from '../components/ExperienceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { AnimatedSection } from '../components/AnimatedSection';

export function ExperienceSection() {
  const { experience, loading, error } = useExperience();

  return (
    <section id="experience" className="py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSection>
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              Experience
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">
              Where I've <span className="text-primary-600">worked</span>
            </h2>
            <p className="text-base text-muted max-w-xl mx-auto leading-relaxed">
              Production experience across open source, cloud infrastructure, and fullstack development.
            </p>
          </div>
        </AnimatedSection>

        {/* Timeline */}
        {loading && <LoadingSpinner message="Loading experience..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <div className="relative">
            {experience.map((exp, index) => (
              <AnimatedSection key={exp.id} delay={index * 0.1}>
                <ExperienceCard experience={exp} index={index} />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
