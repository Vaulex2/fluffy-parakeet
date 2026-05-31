import NavbarSkeleton from "@/components/layout/NavbarSkeleton";

export default function ReservationsLoading() {
  return (
    <>
      <NavbarSkeleton />
      <main className="flex-grow pt-[72px] bg-background bg-seigaiha relative min-h-screen">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <section className="py-16 px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Page header shimmer */}
            <div className="mb-10 flex flex-col items-center gap-3">
              <div className="h-3 w-28 bg-surface-border/60 animate-pulse rounded-full" />
              <div className="h-14 w-72 bg-surface-border animate-pulse rounded" />
              <div className="h-4 w-64 bg-surface-border/50 animate-pulse rounded-full" />
            </div>

            {/* Form card shimmer */}
            <div className="bg-surface border border-surface-border rounded-2xl p-8 space-y-6">
              {[130, 110, 120, 100].map((w, i) => (
                <div key={i} className="space-y-2">
                  <div
                    className="h-3 bg-surface-border/60 animate-pulse rounded"
                    style={{ width: w }}
                  />
                  <div className="h-11 bg-surface-border/40 animate-pulse rounded-xl" />
                </div>
              ))}
              <div className="h-12 bg-primary/20 animate-pulse rounded-xl" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
