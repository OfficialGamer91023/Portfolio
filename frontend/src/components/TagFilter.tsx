interface TagFilterProps {
  tags: string[];
  selectedTag: string | undefined;
  onSelectTag: (tag: string | undefined) => void;
}

const BASE_CLASSES =
  'rounded-full border px-4 py-1.5 font-mono text-xs transition-all duration-200';
const SELECTED_CLASSES = 'border-primary-400/50 bg-primary-500/15 text-primary-200';
const IDLE_CLASSES = 'border-ink-700 bg-ink-850/60 text-muted hover:border-ink-600 hover:text-white';

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      id="project-tag-filter"
      role="group"
      aria-label="Filter projects by technology"
    >
      <button
        type="button"
        onClick={() => onSelectTag(undefined)}
        aria-pressed={selectedTag === undefined}
        className={`${BASE_CLASSES} ${selectedTag === undefined ? SELECTED_CLASSES : IDLE_CLASSES}`}
        id="tag-filter-all"
      >
        All
      </button>
      {tags.map((tag) => {
        const isSelected = tag === selectedTag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(isSelected ? undefined : tag)}
            aria-pressed={isSelected}
            className={`${BASE_CLASSES} ${isSelected ? SELECTED_CLASSES : IDLE_CLASSES}`}
            id={`tag-filter-${tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
