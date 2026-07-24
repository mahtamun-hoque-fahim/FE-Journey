export default function SearchPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center">
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Recipe Finder
        </h1>
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="text"
            disabled
            placeholder="Search recipes..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </div>
        <p className="text-xs text-muted">
          Placeholder screen. Live search wiring comes in a later assignment.
        </p>
      </div>

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-2 gap-6 px-4 pb-20 sm:px-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-xl bg-surface"
          >
            <div className="aspect-square w-full bg-surface-hover" />
            <div className="px-4 py-4">
              <div className="h-4 w-3/4 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
