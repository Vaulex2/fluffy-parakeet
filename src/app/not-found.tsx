import Link from "next/link";
import KaitenSpinner from "@/components/ui/KaitenSpinner";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background bg-seigaiha px-6">
      {/* Radial glow — same language as the hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Oversized kanji watermark */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[18rem] md:text-[24rem] font-headline text-surface pointer-events-none select-none leading-none">
        迷
      </div>

      <div className="relative z-10 text-center max-w-lg space-y-8">
        <div className="flex justify-center">
          <KaitenSpinner size="lg" />
        </div>

        <div className="space-y-3">
          <p className="font-accent text-primary text-3xl -rotate-2">mayoi — lost</p>
          <h1 className="font-headline text-5xl md:text-6xl tracking-tighter uppercase text-text-primary leading-none">
            This page wandered<br />off the belt
          </h1>
          <p className="font-body text-text-muted text-lg max-w-[40ch] mx-auto leading-relaxed">
            We looked all the way around the conveyor and couldn&apos;t find what
            you were after.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/menu"
            className="bg-primary text-white font-headline text-lg px-8 py-3.5 rounded tracking-tight btn-hover-lift inline-flex items-center gap-2"
          >
            Return to the menu
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
          <Link
            href="/"
            className="text-text-primary font-headline text-lg tracking-tight underline-reveal hover:text-primary transition-colors"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
