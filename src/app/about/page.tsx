import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import NavbarSkeleton from "@/components/layout/NavbarSkeleton";
import Footer from "@/components/layout/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutJourney from "@/components/about/AboutJourney";
import ChefSpotlight from "@/components/about/ChefSpotlight";
import PhilosophyQuote from "@/components/about/PhilosophyQuote";
import SignatureCreations from "@/components/about/SignatureCreations";
import AboutValues from "@/components/about/AboutValues";
import ReservationCTA from "@/components/home/ReservationCTA";

export const metadata = {
  title: "About | SushiGO",
  description:
    "Modern Japanese dining in Namangan — meet head chef Kenji Sato and the story behind SushiGO's atmosphere and signature creations.",
};

export default function AboutPage() {
  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main className="pt-[72px] bg-background bg-seigaiha relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

        <div className="relative z-10">
          <AboutHero />
          <AboutJourney />
          <ChefSpotlight />
          <PhilosophyQuote />
          <SignatureCreations />
          <AboutValues />
        </div>
      </main>
      <ReservationCTA />
      <Footer />
    </>
  );
}
