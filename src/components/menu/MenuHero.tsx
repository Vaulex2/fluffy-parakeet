import { getT } from "@/lib/i18n/server";

export default function MenuHero() {
  const { t } = getT();
  return (
    <div className="mb-16">
      <span className="font-accent text-primary text-2xl mb-2 block">
        {t("menu.heroTagline")}
      </span>
      <h1 className="font-headline text-7xl md:text-8xl text-text-primary uppercase leading-none tracking-tighter mb-6">
        {t("menu.heroTitle1")} <br />
        <span className="text-primary">{t("menu.heroTitle2")}</span>
      </h1>
      <p className="max-w-[65ch] text-text-muted text-lg font-light leading-relaxed">
        {t("menu.heroSubtitle")}
      </p>
    </div>
  );
}
