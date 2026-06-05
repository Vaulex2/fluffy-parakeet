"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EXPO } from "@/components/ui/Reveal";
import SushiAnime from "@/components/about/SushiAnime";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AboutHero() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EXPO },
        };

  return (
    <section
      ref={ref}
      className="relative max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20 overflow-hidden"
    >
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
        {/* Left: copy */}
        <motion.div
          style={reduceMotion ? undefined : { y: copyY }}
          className="relative z-10"
        >
          <motion.span
            {...enter(0)}
            className="font-accent text-primary text-3xl mb-4 block -rotate-2"
          >
            {t("about.heroTagline")}
          </motion.span>
          <h1 className="font-headline text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.9] tracking-tighter uppercase text-text-primary">
            <motion.span {...enter(0.08)} className="block">
              {t("about.heroTitle1")}
            </motion.span>
            <motion.span {...enter(0.18)} className="block text-primary">
              {t("about.heroTitle2")}
            </motion.span>
          </h1>
          <motion.p
            {...enter(0.3)}
            className="font-body font-light text-text-muted text-lg md:text-xl max-w-[48ch] leading-relaxed mt-6"
          >
            {t("about.heroSubtitle")}
          </motion.p>

          {/* Scroll cue */}
          <motion.div
            {...enter(0.45)}
            className="mt-14 flex items-center gap-3 text-text-muted"
          >
            <span className="font-body text-xs uppercase tracking-[0.25em]">
              {t("about.scroll")}
            </span>
            <motion.span
              aria-hidden
              className="material-symbols-outlined text-primary"
              animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
              }
            >
              arrow_downward
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Right: kawaii anime sushi — desktop only */}
        <div
          className="hidden lg:flex lg:items-center lg:justify-center"
          aria-hidden="true"
        >
          <SushiAnime />
        </div>
      </div>
    </section>
  );
}
