export default function FavoritesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted">
          Placeholder screen. Saving favorites will need auth and persistence,
          planned for a later assignment.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <p className="text-sm text-muted">
          No favorites yet. Recipes you save will show up here.
        </p>
      </div>
    </div>
  );
}
