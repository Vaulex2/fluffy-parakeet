import Reveal from "@/components/ui/Reveal";
import { getT } from "@/lib/i18n/server";

export default function PhilosophyQuote() {
  const { t } = getT();
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      {/* Contained radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />

      {/* Faint kanji watermark (心 = heart / spirit) */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-primary leading-none text-[40vw] md:text-[24vw] opacity-[0.05] z-0"
      >
        心
      </span>

      <Reveal className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
        <p className="font-accent text-primary text-[clamp(2.5rem,6vw,5rem)] leading-[1.05]">
          {t("about.philosophyQuote")}
        </p>
        <p className="font-body text-text-muted text-base md:text-lg mt-6 tracking-wide">
          {t("about.philosophySub")}
        </p>
      </Reveal>
    </section>
  );
}
