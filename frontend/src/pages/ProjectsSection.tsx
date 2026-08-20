import { useMemo, useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { TagFilter } from '../components/TagFilter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SectionHeader } from '../components/SectionHeader';
import { AnimatedContent } from '../components/reactbits/AnimatedContent';
import { BentoGrid } from '../components/reactbits/MagicBento';

/**
 * Below this many results a featured card stops spanning two columns — a lone
 * double-width card in a three-column grid reads as a layout bug.
 */
const MIN_PROJECTS_FOR_WIDE_CARDS = 3;

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

  const useWideCards = projects.length >= MIN_PROJECTS_FOR_WIDE_CARDS;

  return (
    <section id="projects" className="relative py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(139,92,246,0.07),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Projects"
          title="Things I've"
          accent="built"
          description="From ML platforms to high-performance computing — a selection of projects that showcase my range."
        />

        <AnimatedContent delay={0.1}>
          <div className="mb-10">
            <TagFilter tags={uniqueTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
          </div>
        </AnimatedContent>

        {loading && <LoadingSpinner message="Loading projects..." />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <BentoGrid className="grid grid-cols-1 gap-5 [grid-auto-flow:dense] md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <AnimatedContent
                key={project.id}
                delay={index * 0.07}
                distance={30}
                // The wrapper has to carry the span too, otherwise it, not the
                // card, is what the grid places.
                className={`h-full ${useWideCards && project.featured ? 'lg:col-span-2' : ''}`}
              >
                <ProjectCard project={project} wide={useWideCards && project.featured} />
              </AnimatedContent>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-sm text-muted">No projects found for this filter.</p>
              </div>
            )}
          </BentoGrid>
        )}
      </div>
    </section>
  );
}
