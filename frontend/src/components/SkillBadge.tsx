interface SkillBadgeProps {
  name: string;
}

export function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <span className="inline-block px-3 py-1.5 text-xs font-mono font-medium text-primary-700 bg-primary-50 border border-primary-100 rounded-md hover:bg-primary-100 hover:border-primary-200 transition-colors cursor-default">
      {name}
    </span>
  );
}
