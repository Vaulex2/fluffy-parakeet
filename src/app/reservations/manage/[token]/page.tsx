import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import NavbarSkeleton from "@/components/layout/NavbarSkeleton";
import Footer from "@/components/layout/Footer";
import ManageReservation from "@/components/reservation/ManageReservation";
import { getReservationByToken } from "@/lib/actions/reservations";

export const metadata = {
  title: "Manage Reservation | SushiGO",
  robots: { index: false, follow: false },
};

export default async function ManageReservationPage({
  params,
}: {
  params: { token: string };
}) {
  const reservation = await getReservationByToken(params.token);
  if (!reservation) notFound();

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
                Your Booking
              </p>
              <h1 className="font-headline text-5xl md:text-6xl tracking-tighter text-text-primary leading-none mb-4">
                Manage Reservation
              </h1>
            </div>
            <ManageReservation reservation={reservation} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
