import { useSkills } from '../hooks/useSkills';
import { Reveal } from '../components/Reveal';

/**
 * The toolkit collapses the backend's seven skill categories into three display
 * columns. Content stays API-driven (useSkills); only the grouping is presentation.
 */
const COLUMNS: { title: string; categories: string[] }[] = [
  { title: 'systems', categories: ['Languages', 'Tools'] },
  { title: 'ai / ml', categories: ['ML/AI'] },
  { title: 'product / cloud', categories: ['Backend & APIs', 'Databases', 'Cloud & DevOps', 'Frontend'] },
];

export function SkillsSection() {
  const { skills, loading } = useSkills();

  const byCategory = new Map(skills.map((group) => [group.category, group.skills]));

  return (
    <section id="skills" className="relative border-t border-grid-bold">
      <div className="mx-auto max-w-[940px] px-6 py-11">
        <span className="section-idx">§ 03</span>
        <Reveal>
          <span className="section-lbl">instruments</span>
          <h2 className="nb-h2 mt-1.5">Toolkit</h2>
        </Reveal>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((column, i) => {
            const items = column.categories.flatMap((category) => byCategory.get(category) ?? []);
            return (
              <Reveal key={column.title} delay={i * 0.06}>
                <div className="nb-card h-full p-5">
                  <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-plot">
                    {column.title}
                  </div>
                  <ul className="grid gap-1.5">
                    {loading && items.length === 0
                      ? [0, 1, 2, 3].map((k) => (
                          <li key={k} className="h-4 w-3/4 rounded bg-paper-2" aria-hidden="true" />
                        ))
                      : items.map((item) => (
                          <li key={item} className="font-mono text-[13px] text-content-2">
                            {item}
                          </li>
                        ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
