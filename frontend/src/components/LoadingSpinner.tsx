interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-ink-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
      </div>
      <p className="text-sm font-medium text-muted">{message}</p>
    </div>
  );
}
