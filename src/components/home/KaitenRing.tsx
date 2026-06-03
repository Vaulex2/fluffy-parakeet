import Image from "next/image";
import Link from "next/link";
import { featuredDishes } from "@/data/mockData";

// Six distinct plates evenly spaced (60° apart): the four featured dishes plus
// two cafe drinks (matcha latte + green tea) so the conveyor reads with variety.
const PLATES = [
  { name: featuredDishes[0].name, image: featuredDishes[0].image },
  { name: featuredDishes[1].name, image: featuredDishes[1].image },
  { name: featuredDishes[2].name, image: featuredDishes[2].image },
  { name: featuredDishes[3].name, image: featuredDishes[3].image },
  {
    name: "Matcha Latte",
    image:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Green Tea",
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80",
  },
];

// Radius as a percentage of the (square) stage, measured from center.
const RADIUS = 38;

export default function KaitenRing() {
  return (
    <div className="kaiten-stage relative w-full max-w-[42rem] mx-auto aspect-square">
      {/* Faint conveyor track behind the plates */}
      <div
        className="absolute rounded-full border border-dashed border-surface-border pointer-events-none"
        style={{
          left: `${50 - RADIUS}%`,
          top: `${50 - RADIUS}%`,
          width: `${RADIUS * 2}%`,
          height: `${RADIUS * 2}%`,
        }}
      />

      {/* Center emblem (static) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="absolute -inset-6 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border border-primary/40 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-2xl shadow-primary/10">
          <span className="font-headline text-black text-6xl md:text-7xl leading-none">
            鮨
          </span>
          <span className="font-body text-black text-[10px] tracking-[0.3em] uppercase mt-1">
            Fresh Daily
          </span>
        </div>
      </div>

      {/* Rotating ring of plates */}
      <div className="kaiten-ring absolute inset-0">
        {PLATES.map((dish, i) => {
          const angle = ((360 / PLATES.length) * i - 90) * (Math.PI / 180);
          const left = 50 + RADIUS * Math.cos(angle);
          const top = 50 + RADIUS * Math.sin(angle);
          return (
            <div
              key={i}
              className="kaiten-plate absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Counter-rotation keeps the plate upright while the ring spins */}
              <div className="kaiten-plate-spin">
                <Link
                  href="/menu"
                  aria-label={dish.name}
                  className="block relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-surface-border bg-surface shadow-lg shadow-black/30 transition-transform duration-300 hover:scale-105"
                >
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
