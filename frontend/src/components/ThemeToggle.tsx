import { useTheme } from '../hooks/useTheme';

/**
 * Paper <-> blueprint toggle. Shows the icon for the theme it will switch TO,
 * so the affordance reads as "go to dark / go to light".
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex items-center gap-1.5 rounded-md border border-edge bg-card px-2.5 py-1.5 font-mono text-xs text-content-2 transition-colors hover:text-content hover:border-content-3 ${className}`}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
      <span className="hidden sm:inline">{next}</span>
    </button>
  );
}
