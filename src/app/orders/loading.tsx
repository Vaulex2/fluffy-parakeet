export default function OrdersLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Page title row shimmer */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-surface-border animate-pulse rounded" />
        <div className="h-4 w-28 bg-surface-border/50 animate-pulse rounded" />
      </div>

      {/* Order card shimmers */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-surface-border rounded-xl p-5 space-y-3"
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-surface-border animate-pulse rounded" />
                <div className="h-3 w-40 bg-surface-border/60 animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-surface-border animate-pulse rounded-full" />
                <div className="h-6 w-14 bg-surface-border/60 animate-pulse rounded-full" />
              </div>
            </div>

            {/* Item rows */}
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="h-4 w-44 bg-surface-border/60 animate-pulse rounded" />
                <div className="h-4 w-28 bg-surface-border/50 animate-pulse rounded" />
              </div>
            ))}

            {/* Footer total */}
            <div className="flex justify-end pt-2 border-t border-surface-border">
              <div className="h-6 w-36 bg-surface-border animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
