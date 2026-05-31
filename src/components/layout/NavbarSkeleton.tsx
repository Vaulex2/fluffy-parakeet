export default function NavbarSkeleton() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0B0B0B]/85 backdrop-blur-xl border-b border-[rgba(244,236,216,0.10)] shadow-xl shadow-red-900/10">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-full">
        {/* Brand — static, no data needed */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-headline font-black text-xl leading-none">S</span>
          </div>
          <span className="text-2xl font-headline tracking-tighter text-primary leading-none">
            SUSHI GO
          </span>
        </div>

        {/* Nav link shimmers */}
        <div className="hidden md:flex items-center gap-8">
          {[72, 56, 112, 72].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-surface-border animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Action shimmers */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-6 h-6 rounded bg-surface-border animate-pulse" />
          <div className="hidden md:block w-8 h-8 rounded-full bg-surface-border animate-pulse" />
        </div>
      </div>
    </header>
  );
}
