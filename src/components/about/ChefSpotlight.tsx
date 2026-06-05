"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ChefSpotlight() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle portrait drift as the section scrolls through the viewport.
  const portraitY = useTransform(scrollYProgress, [0, 1], [-24, 24]);

  return (
    <section
      ref={ref}
      className="relative bg-light-bg text-light-text py-28 overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-tr-full pointer-events-none" />

      {/* Faint kanji watermark (板前 = itamae / chef) */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute top-1/2 right-0 -translate-y-1/2 font-headline text-light-text leading-none text-[30vw] md:text-[16vw] opacity-[0.04] z-0"
      >
        板前
      </span>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Portrait */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="absolute -inset-4 bg-background/5 rotate-3 rounded-2xl" />
          <motion.div
            style={{ y: portraitY }}
            className="relative aspect-[4/5] md:aspect-square rounded-xl overflow-hidden shadow-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80"
              alt="Kenji Sato, Head Chef"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
          {/* Name plate */}
          <div className="absolute -bottom-6 right-6 bg-background px-6 py-4 rounded-lg border border-surface-border shadow-2xl">
            <p className="font-accent text-primary text-lg leading-none mb-1">
              {t("about.chefHeadChef")}
            </p>
            <p className="font-headline text-white text-2xl leading-none tracking-tight">
              {t("about.chefName")}
            </p>
          </div>
        </Reveal>

        {/* Bio */}
        <Reveal delay={0.12} className="space-y-6 order-1 lg:order-2">
          <span className="font-accent text-primary text-2xl block">
            {t("about.chefTagline")}
          </span>
          <h2 className="font-headline text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.95] tracking-tighter uppercase text-light-text">
            {t("about.chefTitle1")}
            <br />
            <span className="text-primary">{t("about.chefTitle2")}</span>
          </h2>
          <p className="font-body text-lg text-light-text/80 leading-relaxed max-w-xl">
            {t("about.chefBio1")}
          </p>
          <p className="font-body text-lg text-light-text/80 leading-relaxed max-w-xl">
            {t("about.chefBio2")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
