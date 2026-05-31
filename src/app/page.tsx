import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import MarqueeBanner from "@/components/home/MarqueeBanner";
import FeaturedDishes from "@/components/home/FeaturedDishes";
import AboutSection from "@/components/home/AboutSection";
import ReservationCTA from "@/components/home/ReservationCTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <HeroSection />
        <MarqueeBanner />
        <FeaturedDishes />
        <AboutSection />
        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
