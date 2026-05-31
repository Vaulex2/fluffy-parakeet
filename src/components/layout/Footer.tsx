import Link from "next/link";
import { footerExplore, footerInfo } from "@/data/mockData";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0B0B] border-t border-[rgba(244,236,216,0.05)]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="space-y-6">
          <div className="font-headline text-3xl text-text-primary tracking-tighter">
            SUSHI GO
          </div>
          <p className="font-body text-text-muted text-sm leading-relaxed max-w-[250px]">
            Authentic Japanese cuisine in the heart of Namangan. Fresh
            ingredients, masterful preparation.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
              aria-label="Website"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface border border-surface-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
              aria-label="Share"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-headline text-lg tracking-tight text-white mb-6 uppercase">
            Explore
          </h4>
          <ul className="space-y-4 font-body text-sm">
            {footerExplore.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`underline-reveal transition-colors hover:text-primary ${
                    link.active ? "text-primary" : "text-text-muted"
                  }`}
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
            Information
          </h4>
          <ul className="space-y-4 font-body text-sm">
            {footerInfo.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-text-muted underline-reveal transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit Us */}
        <div>
          <h4 className="font-headline text-lg tracking-tight text-white mb-6 uppercase">
            Visit Us
          </h4>
          <div className="space-y-4 font-body text-sm text-text-muted">
            <p className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                location_on
              </span>
              <span>
                123 Main Street
                <br />
                Namangan, Uzbekistan
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
              <span>Mon–Sun: 11:00 – 23:00</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(244,236,216,0.05)] px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-text-muted text-xs text-center md:text-left">
            © 2024 Sushi GO Namangan. Authentic Japanese Excellence.
          </p>
          <p className="text-xs text-text-muted font-body">
            Designed with{" "}
            <span className="text-primary material-symbols-outlined text-[12px] fill align-middle">
              favorite
            </span>{" "}
            for sushi lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
