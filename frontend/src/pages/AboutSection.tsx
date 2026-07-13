import { useSkills } from '../hooks/useSkills';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { AnimatedSection } from '../components/AnimatedSection';

// Category icons mapped to each skill group
const CATEGORY_ICONS: Record<string, string> = {
  Languages: '💻',
  Frontend: '🎨',
  'Backend & APIs': '⚙️',
  Databases: '🗄️',
  'Cloud & DevOps': '☁️',
  'ML/AI': '🤖',
  Tools: '🔧',
};

export function AboutSection() {
  const { skills, loading, error } = useSkills();

  return (
    <section id="about" className="py-24 lg:py-32 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              About Me
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">
              Passionate about building{' '}
              <span className="text-primary-600">real things</span>
            </h2>
            <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
              I'm a final-year Computer Science student at GIK Institute with a track record of
              shipping production code. From contributing to Inkscape (3M+ users) and building
              robust C++ libraries through Google Summer of Code, to designing cloud solutions at
              Systems Limited — I bring a builder's mindset to every team I join.
            </p>
          </div>
        </AnimatedSection>

        {/* Skills Grid */}
        {loading && <LoadingSpinner message="Loading skills..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {skills.map((group, index) => (
              <AnimatedSection key={group.category} delay={index * 0.08}>
                <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-primary-100 hover:shadow-md transition-all duration-300 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{CATEGORY_ICONS[group.category] || '📦'}</span>
                    <h3 className="text-sm font-semibold text-dark">{group.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <SkillBadge key={skill} name={skill} />
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
