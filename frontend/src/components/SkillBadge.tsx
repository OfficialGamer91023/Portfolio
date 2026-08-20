interface SkillBadgeProps {
  name: string;
}

export function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <span className="inline-block cursor-default rounded-md border border-ink-700 bg-ink-800/60 px-2.5 py-1 font-mono text-[0.7rem] font-medium text-white/70 transition-colors duration-200 hover:border-primary-400/40 hover:bg-primary-500/10 hover:text-primary-200">
      {name}
    </span>
  );
}
