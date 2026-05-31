import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import NavbarSkeleton from "@/components/layout/NavbarSkeleton";
import Footer from "@/components/layout/Footer";
import MenuHero from "@/components/menu/MenuHero";
import MenuClientShell from "@/components/menu/MenuClientShell";
import { getMenuItems, getCategories } from "@/lib/actions/menu";

export const metadata = {
  title: "Menu | SushiGO",
  description: "Fresh rolls, nigiri, ramen and more — crafted daily in Namangan.",
};

export default async function MenuPage() {
  const [items, categories] = await Promise.all([getMenuItems(), getCategories()]);

  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <main className="relative pt-[72px] pb-20 overflow-hidden bg-background bg-seigaiha min-h-screen">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <MenuHero />
          <MenuClientShell items={items} categories={categories} />
        </section>
      </main>
      <Footer />
    </>
  );
}
