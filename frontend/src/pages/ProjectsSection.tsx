import { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { TagFilter } from '../components/TagFilter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { AnimatedSection } from '../components/AnimatedSection';

export function ProjectsSection() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const { projects, loading, error } = useProjects(selectedTag);

  // Extract unique tags from all projects for the filter bar
  // We fetch all projects once to build the tag list, then filter via API
  const { projects: allProjects } = useProjects();

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    allProjects.forEach((project) => {
      project.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allProjects]);

  return (
    <section id="projects" className="py-24 lg:py-32 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              Projects
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">
              Things I've <span className="text-primary-600">built</span>
            </h2>
            <p className="text-base text-muted max-w-xl mx-auto leading-relaxed">
              From ML platforms to high-performance computing — a selection of projects
              that showcase my range.
            </p>
          </div>
        </AnimatedSection>

        {/* Tag Filter */}
        <AnimatedSection delay={0.1}>
          <div className="mb-10">
            <TagFilter
              tags={uniqueTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />
          </div>
        </AnimatedSection>

        {/* Project Grid */}
        {loading && <LoadingSpinner message="Loading projects..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <AnimatedSection key={project.id} delay={index * 0.08}>
                <ProjectCard project={project} />
              </AnimatedSection>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted text-sm">No projects found for this filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
