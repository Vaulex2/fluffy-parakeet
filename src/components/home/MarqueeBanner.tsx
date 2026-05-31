export default function MarqueeBanner() {
  const items = [
    "FRESH DAILY",
    "PREMIUM INGREDIENTS",
    "DINE IN · TAKEAWAY · DELIVERY",
    "FRESH DAILY",
    "PREMIUM INGREDIENTS",
    "DINE IN · TAKEAWAY · DELIVERY",
  ];

  return (
    <div className="bg-primary py-4 overflow-hidden flex whitespace-nowrap border-y border-red-900 shadow-lg shadow-primary/10 relative z-20">
      <div className="animate-marquee flex gap-12 font-headline text-2xl tracking-tight text-white items-center">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-4">
            {item}
            <span className="material-symbols-outlined fill text-sm opacity-50">
              star
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
