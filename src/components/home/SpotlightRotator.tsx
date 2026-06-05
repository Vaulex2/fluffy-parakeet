"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { MenuItem } from "@/data/mockData";

const SLIDE_MS = 3000;
const EXPO = [0.16, 1, 0.3, 1] as const;

interface SpotlightRotatorProps {
  dishes: MenuItem[];
}

export default function SpotlightRotator({ dishes }: SpotlightRotatorProps) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  // Bumped on every transition so the timer bar restarts even when the same
  // index is re-selected.
  const [tick, setTick] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive(index);
    setTick((t) => t + 1);
  }, []);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % dishes.length);
    setTick((t) => t + 1);
  }, [dishes.length]);

  // Respect the user's reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Auto-advance, unless motion is reduced. Keeps cycling even on hover.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(next, SLIDE_MS);
    return () => clearInterval(id);
  }, [reduceMotion, next, tick]);

  const dish = dishes[active];

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Image side */}
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-surface-border bg-surface">
          <AnimatePresence initial={false}>
            <motion.div
              key={dish.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: EXPO }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: reduceMotion ? 1 : 1.05 }}
                animate={{ scale: reduceMotion ? 1 : 1.12 }}
                transition={{ duration: SLIDE_MS / 1000 + 1, ease: "linear" }}
              >
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={active === 0}
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </motion.div>
          </AnimatePresence>

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
        </div>

        {/* Details side */}
        <div className="relative bg-[#F4ECD8]/50 rounded-xl p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: EXPO }}
            >
              <p className="font-accent text-primary text-2xl mb-2">
                {t("home.chefSpotlight")}
              </p>
              <h3 className="font-headline text-5xl md:text-6xl tracking-tighter uppercase text-white mb-4">
                {dish.name}
              </h3>
              {dish.description && (
                <p className="font-body text-black text-lg max-w-md mb-6 leading-relaxed">
                  {dish.description}
                </p>
              )}
              <p className="font-headline text-primary text-3xl tracking-tight mb-8">
                {dish.price}
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded font-headline tracking-wide btn-hover-lift"
              >
                {t("home.orderNow")}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thumbnail selector + timer bar */}
      <div className="mt-10 flex gap-4">
        {dishes.map((d, i) => {
          const isActive = i === active;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={d.name}
              aria-current={isActive}
              className="group flex-1 max-w-[140px] text-left focus:outline-none"
            >
              <div
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-[opacity,border-color] duration-300 ${
                  isActive
                    ? "border-primary opacity-100"
                    : "border-surface-border opacity-50 group-hover:opacity-80"
                }`}
              >
                <Image
                  src={d.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              {/* Timer / active indicator track */}
              <div className="mt-2 h-0.5 w-full rounded-full bg-surface-border overflow-hidden">
                {isActive &&
                  (reduceMotion ? (
                    <div className="h-full w-full bg-primary" />
                  ) : (
                    <motion.div
                      key={tick}
                      className="h-full w-full bg-primary origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: SLIDE_MS / 1000,
                        ease: "linear",
                      }}
                    />
                  ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
