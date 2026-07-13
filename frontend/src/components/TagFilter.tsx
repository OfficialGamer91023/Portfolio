interface TagFilterProps {
  tags: string[];
  selectedTag: string | undefined;
  onSelectTag: (tag: string | undefined) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center" id="project-tag-filter">
      <button
        onClick={() => onSelectTag(undefined)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedTag === undefined
            ? 'bg-dark text-white shadow-sm'
            : 'bg-gray-100 text-muted hover:bg-gray-200 hover:text-dark'
        }`}
        id="tag-filter-all"
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag === selectedTag ? undefined : tag)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            tag === selectedTag
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-gray-100 text-muted hover:bg-gray-200 hover:text-dark'
          }`}
          id={`tag-filter-${tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
