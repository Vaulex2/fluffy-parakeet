import NavbarSkeleton from "@/components/layout/NavbarSkeleton";

export default function MenuLoading() {
  return (
    <>
      <NavbarSkeleton />
      <main className="relative pt-[72px] pb-20 overflow-hidden bg-background bg-seigaiha min-h-screen">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          {/* Hero shimmer */}
          <div className="mb-16">
            <div className="h-5 w-44 bg-surface-border/70 rounded-full animate-pulse mb-4" />
            <div className="h-20 w-80 bg-surface-border animate-pulse rounded mb-2" />
            <div className="h-20 w-56 bg-surface-border animate-pulse rounded mb-6" />
            <div className="space-y-2.5 max-w-xl">
              <div className="h-4 w-full bg-surface-border/50 animate-pulse rounded-full" />
              <div className="h-4 w-4/5 bg-surface-border/40 animate-pulse rounded-full" />
              <div className="h-4 w-3/5 bg-surface-border/30 animate-pulse rounded-full" />
            </div>
          </div>

          {/* Category pills shimmer */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {[88, 72, 96, 80, 112, 64, 80].map((w, i) => (
              <div
                key={i}
                className="h-9 rounded-full bg-surface-border animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>

          {/* Cards grid shimmer — matches lg:grid-cols-4 layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] rounded-xl bg-surface-border animate-pulse" />
                <div className="h-4 w-2/3 bg-surface-border/70 animate-pulse rounded-full" />
                <div className="h-3 w-1/3 bg-surface-border/50 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
