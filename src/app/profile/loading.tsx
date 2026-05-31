export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      {/* Profile header shimmer */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-surface-border animate-pulse shrink-0" />
        <div className="space-y-2.5">
          <div className="h-6 w-48 bg-surface-border animate-pulse rounded" />
          <div className="h-4 w-40 bg-surface-border/60 animate-pulse rounded" />
          <div className="h-6 w-28 bg-surface-border/40 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Edit profile card shimmer */}
      <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-5">
        <div className="h-5 w-28 bg-surface-border animate-pulse rounded" />
        {[140, 120, 100].map((w, i) => (
          <div key={i} className="space-y-2">
            <div
              className="h-3 bg-surface-border/60 animate-pulse rounded"
              style={{ width: w }}
            />
            <div className="h-11 bg-surface-border/40 animate-pulse rounded-xl" />
          </div>
        ))}
        {/* Language pills */}
        <div className="flex gap-2">
          {[72, 80, 72].map((w, i) => (
            <div
              key={i}
              className="h-9 rounded-xl bg-surface-border/50 animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="h-11 w-36 bg-surface-border animate-pulse rounded-xl" />
      </div>

      {/* Reservations shimmer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-surface-border animate-pulse rounded" />
          <div className="h-4 w-24 bg-surface-border/50 animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface border border-surface-border rounded-xl p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-surface-border animate-pulse rounded" />
                <div className="h-3 w-56 bg-surface-border/60 animate-pulse rounded" />
              </div>
              <div className="h-6 w-20 bg-surface-border/60 animate-pulse rounded-full" />
            </div>
            <div className="h-3 w-24 bg-surface-border/40 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
