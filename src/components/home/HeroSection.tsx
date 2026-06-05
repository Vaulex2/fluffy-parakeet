import Link from "next/link";
import KaitenRing from "./KaitenRing";
import { getT } from "@/lib/i18n/server";

export default function HeroSection() {
  const { t } = getT();
  const heroStats = [
    { value: "50+", label: t("home.statUniqueRolls") },
    { value: "100%", label: t("home.statFreshIngredients") },
    { value: "4.9", label: t("home.statRating") },
  ];
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background bg-seigaiha">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Copy + stats */}
        <div className="space-y-8 relative">
          <div className="absolute -top-12 -left-12 text-[12rem] font-headline text-surface pointer-events-none select-none z-0 leading-none">
            新鮮
          </div>
          <div className="relative z-10">
            <p className="font-accent text-primary text-3xl mb-4 -rotate-2">
              {t("home.heroTagline")}
            </p>
            <h1 className="font-headline text-[clamp(4rem,8vw,8rem)] leading-[0.85] tracking-tighter text-text-primary uppercase flex flex-col">
              <span>{t("home.heroTitle1")}</span>
              <span className="text-primary text-[clamp(4.5rem,9vw,9rem)] ml-[-0.05em] drop-shadow-2xl">
                {t("home.heroTitle2")}
              </span>
              <span>{t("home.heroTitle3")}</span>
            </h1>
          </div>

          <p className="font-body font-light text-text-muted text-lg md:text-xl max-w-[45ch] leading-relaxed">
            {t("home.heroSubtitle")}
          </p>

          <div className="flex items-center gap-6 pt-4 flex-wrap">
            <Link
              href="/menu"
              className="bg-primary text-white font-headline text-xl px-8 py-4 rounded tracking-tight btn-hover-lift"
            >
              {t("home.orderNow")}
            </Link>
            <Link
              href="/menu"
              className="text-text-primary font-headline text-lg tracking-tight underline-reveal hover:text-primary transition-colors flex items-center gap-2"
            >
              {t("home.viewMenu")}{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-surface-border mt-4">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="font-headline text-3xl text-primary leading-none mb-1">
                  {stat.value}
                </p>
                <p className="font-body text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: kaiten conveyor ring */}
        <div className="flex items-center justify-center">
          <KaitenRing />
        </div>
      </div>
    </section>
  );
}
