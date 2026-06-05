import Link from "next/link";
import CookiePreferencesLink from "@/components/cookies/CookiePreferencesLink";
import { getT } from "@/lib/i18n/server";

export default function Footer() {
  const { t } = getT();
  const footerExplore = [
    { label: t("nav.menu"), href: "/menu" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.reservations"), href: "/reservations" },
    { label: t("nav.contact"), href: "#contact" },
  ];
  const footerInfo = [
    { label: t("footer.privacy"), href: "/privacy" },
    { label: t("footer.terms"), href: "/terms" },
    { label: t("footer.myAccount"), href: "/profile" },
  ];
  return (
    <footer className="w-full bg-[#0B0B0B] border-t border-[rgba(244,236,216,0.05)]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="space-y-6">
          <div className="font-headline text-3xl text-text-primary tracking-tighter">
            SUSHI GO
          </div>
          <p className="font-body text-text-muted text-sm leading-relaxed max-w-[250px]">
            {t("footer.brandDesc")}
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
              aria-label={t("footer.website")}
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
              aria-label={t("footer.share")}
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-headline text-lg tracking-tight text-white mb-6 uppercase">
            {t("footer.explore")}
          </h4>
          <ul className="space-y-4 font-body text-sm">
            {footerExplore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline-reveal transition-colors hover:text-primary text-text-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="font-headline text-lg tracking-tight text-white mb-6 uppercase">
            {t("footer.information")}
          </h4>
          <ul className="space-y-4 font-body text-sm">
            {footerInfo.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-text-muted underline-reveal transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <CookiePreferencesLink className="text-text-muted underline-reveal transition-colors hover:text-primary text-left" />
            </li>
          </ul>
        </div>

        {/* Visit Us */}
        <div>
          <h4 className="font-headline text-lg tracking-tight text-white mb-6 uppercase">
            {t("footer.visitUs")}
          </h4>
          <div className="space-y-4 font-body text-sm text-text-muted">
            <p className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                location_on
              </span>
              <span>
                {t("footer.addressLine1")}
                <br />
                {t("footer.addressLine2")}
              </span>
            </p>
            <p className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[18px]">
                phone
              </span>
              <span>+998 90 123 45 67</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[18px]">
                schedule
              </span>
              <span>{t("footer.hours")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(244,236,216,0.05)] px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-text-muted text-xs text-center md:text-left">
            {t("footer.copyright")}
          </p>
          <p className="text-xs text-text-muted font-body">
            {t("footer.designedWith")}{" "}
            <span className="text-primary material-symbols-outlined text-[12px] fill align-middle">
              favorite
            </span>{" "}
            {t("footer.forSushiLovers")}
          </p>
        </div>
      </div>
    </footer>
  );
}
