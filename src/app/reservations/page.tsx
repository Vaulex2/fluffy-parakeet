import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import NavbarSkeleton from "@/components/layout/NavbarSkeleton";
import Footer from "@/components/layout/Footer";
import ReservationForm from "@/components/reservation/ReservationForm";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "Reserve a Table | SushiGO",
  description: "Book a table at SushiGO — Namangan's finest sushi restaurant.",
};

export default function ReservationsPage() {
  const { t } = getT();
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main className="flex-grow pt-[72px] bg-background bg-seigaiha relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <section className="py-16 px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-primary font-body text-sm uppercase tracking-widest mb-3">
                {t("reservations.pageTagline")}
              </p>
              <h1 className="font-headline text-5xl md:text-6xl tracking-tighter text-text-primary leading-none mb-4">
                {t("reservations.pageTitle")}
              </h1>
              <p className="text-text-muted font-body text-base max-w-md mx-auto">
                {t("reservations.pageSubtitle")}
              </p>
            </div>
            <ReservationForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
