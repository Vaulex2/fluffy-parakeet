"use client";

// Provides fly({ imageUrl, from }) — animates a small circular dish clone from
// a source rect to the navbar cart icon (read at fire time from #cart-fly-target),
// then dispatches "sushigo:cart-pop" so the badge bounces. Honors reduced-motion.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXPO } from "@/components/ui/Reveal";

interface FlyArgs {
  imageUrl: string | null;
  /** Bounding rect of the element the dish flies from. */
  from: DOMRect;
}

interface Flight {
  id: number;
  imageUrl: string | null;
  fromX: number; // center of source
  fromY: number;
  dx: number; // delta to target center
  dy: number;
}

const FlyToCartContext = createContext<((args: FlyArgs) => void) | null>(null);

const CLONE = 56; // px

function popCart() {
  window.dispatchEvent(new CustomEvent("sushigo:cart-pop"));
}

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const nextId = useRef(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => (reduceMotion.current = mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fly = useCallback(({ imageUrl, from }: FlyArgs) => {
    const target = document.getElementById("cart-fly-target");
    // No target (e.g. mobile where the icon is hidden) or reduced motion:
    // skip the flight but still acknowledge with a badge pop.
    if (!target || reduceMotion.current) {
      popCart();
      return;
    }
    const to = target.getBoundingClientRect();
    const fromX = from.left + from.width / 2;
    const fromY = from.top + from.height / 2;
    const toX = to.left + to.width / 2;
    const toY = to.top + to.height / 2;

    setFlights((prev) => [
      ...prev,
      { id: nextId.current++, imageUrl, fromX, fromY, dx: toX - fromX, dy: toY - fromY },
    ]);
  }, []);

  const done = useCallback((id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
    popCart();
  }, []);

  return (
    <FlyToCartContext.Provider value={fly}>
      {children}
      <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
        <AnimatePresence>
          {flights.map((f) => {
            const lift = Math.max(70, Math.abs(f.dy) * 0.4 + 50);
            return (
              <motion.div
                key={f.id}
                className="absolute rounded-full overflow-hidden border border-primary/40 bg-surface shadow-lg shadow-black/40"
                style={{
                  width: CLONE,
                  height: CLONE,
                  left: f.fromX - CLONE / 2,
                  top: f.fromY - CLONE / 2,
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: f.dx,
                  y: [0, -lift, f.dy],
                  scale: 0.3,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.7,
                  ease: EXPO,
                  y: { duration: 0.7, ease: EXPO, times: [0, 0.4, 1] },
                  opacity: { duration: 0.7, times: [0, 0.75, 1] },
                }}
                onAnimationComplete={() => done(f.id)}
              >
                {f.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center font-headline text-primary text-2xl">
                    鮨
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const fly = useContext(FlyToCartContext);
  if (!fly) throw new Error("useFlyToCart must be used inside FlyToCartProvider");
  return fly;
}
