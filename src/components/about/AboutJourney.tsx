import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { aboutMilestones } from "@/data/mockData";
import { getT } from "@/lib/i18n/server";

export default function AboutJourney() {
  const { t } = getT();
  const milestones = [
    { year: t("about.m1Year"), title: t("about.m1Title"), description: t("about.m1Desc"), image: aboutMilestones[0].image, imageAlt: t("about.m1Alt") },
    { year: t("about.m2Year"), title: t("about.m2Title"), description: t("about.m2Desc"), image: aboutMilestones[1].image, imageAlt: t("about.m2Alt") },
    { year: t("about.m3Year"), title: t("about.m3Title"), description: t("about.m3Desc"), image: aboutMilestones[2].image, imageAlt: t("about.m3Alt") },
    { year: t("about.m4Year"), title: t("about.m4Title"), description: t("about.m4Desc"), image: aboutMilestones[3].image, imageAlt: t("about.m4Alt") },
  ];
  return (
    <section className="relative max-w-7xl mx-auto px-6 md:px-12 py-20">
      <Reveal className="max-w-2xl mb-16">
        <span className="font-accent text-primary text-2xl block mb-2">
          {t("about.journeyTagline")}
        </span>
        <h2 className="font-headline text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-tighter uppercase text-text-primary">
          {t("about.journeyTitle1")}
          <br />
          <span className="text-primary">{t("about.journeyTitle2")}</span>
        </h2>
      </Reveal>

      <div className="relative">
        {/* Vertical line — left rail on mobile, centered on desktop */}
        <div className="absolute top-0 bottom-0 left-[7px] lg:left-1/2 lg:-translate-x-1/2 w-px bg-surface-border">
          <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
        </div>

        <ol className="space-y-16 lg:space-y-0">
          {milestones.map((m, i) => {
            const textLeft = i % 2 === 0;
            return (
              <li
                key={m.year}
                className="relative pl-10 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-12 lg:py-12"
              >
                {/* Node */}
                <span className="absolute left-0 top-2 lg:left-1/2 lg:-translate-x-1/2 lg:top-16 w-4 h-4 rounded-full bg-primary ring-4 ring-background shadow-lg shadow-primary/30 z-10" />

                {/* Text block */}
                <Reveal
                  delay={i * 0.08}
                  className={
                    textLeft
                      ? "lg:col-start-1 lg:text-right lg:pr-8 self-center"
                      : "lg:col-start-2 lg:pl-8 self-center"
                  }
                >
                  <span className="font-headline text-primary text-3xl md:text-4xl tracking-tighter block mb-1">
                    {m.year}
                  </span>
                  <h3 className="font-headline text-2xl md:text-3xl text-text-primary tracking-tight uppercase mb-3">
                    {m.title}
                  </h3>
                  <p className="font-body text-text-muted text-base md:text-lg leading-relaxed max-w-md lg:inline-block">
                    {m.description}
                  </p>
                </Reveal>

                {/* Image block — opposite side on desktop, below text on mobile */}
                <Reveal
                  delay={i * 0.08 + 0.1}
                  className={[
                    "mt-6 lg:mt-0 self-center",
                    textLeft
                      ? "lg:col-start-2 lg:row-start-1 lg:pl-8"
                      : "lg:col-start-1 lg:row-start-1 lg:pr-8",
                  ].join(" ")}
                >
                  <div className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-surface-border shadow-xl shadow-black/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent z-10 pointer-events-none" />
                    <Image
                      src={m.image}
                      alt={m.imageAlt}
                      fill
                      className="object-cover img-hover-zoom"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
