import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { signatureDishes as sigImages } from "@/data/mockData";
import { getT } from "@/lib/i18n/server";

export default function SignatureCreations() {
  const { t } = getT();
  const signatureDishes = [
    { name: t("about.sig1Name"), description: t("about.sig1Desc"), image: sigImages[0].image, chefsFavorite: sigImages[0].chefsFavorite },
    { name: t("about.sig2Name"), description: t("about.sig2Desc"), image: sigImages[1].image, chefsFavorite: sigImages[1].chefsFavorite },
    { name: t("about.sig3Name"), description: t("about.sig3Desc"), image: sigImages[2].image, chefsFavorite: sigImages[2].chefsFavorite },
  ];
  return (
    <section className="relative max-w-7xl mx-auto px-6 md:px-12 py-24">
      <Reveal className="text-center mb-14">
        <span className="font-accent text-primary text-2xl block mb-2">
          {t("about.signatureTagline")}
        </span>
        <h2 className="font-headline text-5xl md:text-6xl tracking-tighter uppercase text-text-primary">
          {t("about.signatureTitle1")} <span className="text-primary">{t("about.signatureTitle2")}</span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {signatureDishes.map((dish, i) => (
          <Reveal key={dish.name} delay={i * 0.08}>
            <div className="group relative h-full bg-surface border border-surface-border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-500">
              <div className="relative aspect-[4/3] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10 pointer-events-none" />
                {/* Index label */}
                <span className="absolute top-3 right-4 z-20 font-headline text-4xl leading-none text-white/30 tracking-tighter">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {dish.chefsFavorite && (
                  <span className="absolute top-3 left-3 z-20 font-headline tracking-widest uppercase text-[10px] px-2 py-1 rounded bg-primary/90 text-white backdrop-blur-sm">
                    {t("about.chefsFavorite")}
                  </span>
                )}
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover img-hover-zoom"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 relative z-20 -mt-12">
                <h3 className="font-headline text-3xl text-text-primary tracking-tighter uppercase mb-2">
                  {dish.name}
                </h3>
                <p className="font-body text-text-muted text-sm font-light leading-relaxed">
                  {dish.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
