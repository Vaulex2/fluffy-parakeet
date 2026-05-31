import Link from "next/link";

export default function ReservationCTA() {
  return (
    <section className="py-32 bg-background bg-seigaiha relative border-y border-surface-border flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <span className="font-accent text-primary text-3xl block mb-4">
          Join us tonight
        </span>
        <h2 className="font-headline text-5xl md:text-7xl tracking-tighter uppercase mb-8 leading-[0.9]">
          BOOK YOUR
          <br />
          PERFECT EVENING
        </h2>
        <p className="font-body text-text-muted text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Reserve a table for an unforgettable dining experience or check our
          availability for tonight.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/reservations"
            className="w-full sm:w-auto bg-primary text-white font-headline text-xl px-10 py-4 rounded tracking-tight btn-hover-lift shadow-lg shadow-primary/20"
          >
            Make a Reservation
          </Link>
          <Link
            href="/reservations"
            className="w-full sm:w-auto bg-surface text-text-primary border border-surface-border font-headline text-xl px-10 py-4 rounded tracking-tight hover:bg-surface-border transition-colors"
          >
            See Availability
          </Link>
        </div>
      </div>
    </section>
  );
}
