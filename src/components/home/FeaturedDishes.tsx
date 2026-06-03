import Link from "next/link";
import { featuredDishes } from "@/data/mockData";
import SpotlightRotator from "./SpotlightRotator";

export default function FeaturedDishes() {
  return (
    <section className="py-32 bg-background bg-seigaiha relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-headline text-5xl md:text-6xl tracking-tighter uppercase mb-4">
              Featured <span className="text-primary">Dishes</span>
            </h2>
            <p className="font-body text-text-muted max-w-xl text-lg">
              Curated selections from our master chefs, blending traditional
              techniques with modern presentation.
            </p>
          </div>
          <Link
            href="/menu"
            className="hidden md:flex items-center gap-2 font-headline text-primary tracking-tight hover:text-white transition-colors underline-reveal"
          >
            SEE FULL MENU{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        <SpotlightRotator dishes={featuredDishes} />

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/menu"
            className="bg-surface border border-surface-border px-8 py-3 rounded font-headline tracking-wide hover:bg-surface-border transition-colors"
          >
            VIEW FULL MENU
          </Link>
        </div>
      </div>
    </section>
  );
}
