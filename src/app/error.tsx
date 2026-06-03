"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for logging/observability.
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background bg-seigaiha px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[14rem] md:text-[20rem] font-headline text-surface pointer-events-none select-none leading-none">
        御免
      </div>

      <div className="relative z-10 text-center max-w-lg space-y-8">
        {/* Static "dropped plate" mark — calm, not spinning, since it's an error */}
        <div className="mx-auto w-24 h-24 rounded-full border border-surface-border bg-surface flex items-center justify-center rotate-6">
          <span className="material-symbols-outlined text-primary text-5xl">
            ramen_dining
          </span>
        </div>

        <div className="space-y-3">
          <p className="font-accent text-primary text-3xl -rotate-2">gomennasai</p>
          <h1 className="font-headline text-5xl md:text-6xl tracking-tighter uppercase text-text-primary leading-none">
            Something slipped<br />off the belt
          </h1>
          <p className="font-body text-text-muted text-lg max-w-[40ch] mx-auto leading-relaxed">
            A dish didn&apos;t plate the way it should. Give it another pass — our
            kitchen is already on it.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={reset}
            className="bg-primary text-white font-headline text-lg px-8 py-3.5 rounded tracking-tight btn-hover-lift inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Try again
          </button>
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
