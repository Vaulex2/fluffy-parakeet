import Image from "next/image";
import Link from "next/link";
import { featuredDishes } from "@/data/mockData";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDishes.map((dish) => (
            <div
              key={dish.id}
              className={`group cursor-pointer ${dish.staggered ? "md:mt-12" : ""}`}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 border border-surface-border bg-surface">
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover img-hover-zoom"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {dish.badge && (
                  <div
                    className={`absolute top-4 right-4 z-20 font-headline px-3 py-1 rounded text-sm backdrop-blur-sm shadow-lg ${
                      dish.badgeDark
                        ? "bg-background/80 text-white border border-surface-border"
                        : "bg-primary/90 text-white"
                    }`}
                  >
                    {dish.badge}
                  </div>
                )}
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="font-headline text-2xl tracking-tight text-white mb-1">
                    {dish.name}
                  </h3>
                  <p className="font-body text-primary font-bold">{dish.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

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
