// Suspense fallback for the admin content area. Renders inside the persistent
// admin layout's <main>, so it intentionally omits the sidebar. Shows instantly
// on navigation (the page Server Component awaits Supabase queries), so moving
// between subpages never hangs on the old page. Neutral enough to read well on
// the dashboard, reservations, orders, menu, tables and users routes.
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {/* Title + filter bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-surface" />
          <div className="h-4 w-32 rounded bg-surface/60" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-surface" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-surface-border bg-surface/40 p-5 space-y-3"
          >
            <div className="h-4 w-20 rounded bg-surface" />
            <div className="h-8 w-16 rounded-md bg-surface" />
          </div>
        ))}
      </div>

      {/* Table / list rows */}
      <div className="rounded-xl border border-surface-border bg-surface/40 overflow-hidden">
        <div className="h-12 border-b border-surface-border bg-surface/60" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-surface-border last:border-b-0"
          >
            <div className="h-10 w-10 rounded-full bg-surface shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-surface" />
              <div className="h-3 w-1/4 rounded bg-surface/60" />
            </div>
            <div className="h-6 w-20 rounded-full bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
