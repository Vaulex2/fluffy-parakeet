"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "@/lib/actions/auth";
import NavHeader from "@/components/ui/nav-header";
import { useCart } from "@/components/cart/CartContext";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { EXPO } from "@/components/ui/Reveal";
import type { TranslationKey } from "@/lib/i18n";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS: { tKey: TranslationKey; href: string }[] = [
  { tKey: "nav.menu", href: "/menu" },
  { tKey: "nav.about", href: "/about" },
  { tKey: "nav.reservations", href: "/reservations" },
  { tKey: "nav.contact", href: "#contact" },
];

// Cart icon with a live count badge that "pops" when an item lands (fly-to-cart
// dispatches "sushigo:cart-pop"). Doubles as the fly target via #cart-fly-target.
function CartButton() {
  const { count } = useCart();
  const { t } = useLanguage();
  const [pop, setPop] = useState(0);

  useEffect(() => {
    const handler = () => setPop((p) => p + 1);
    window.addEventListener("sushigo:cart-pop", handler);
    return () => window.removeEventListener("sushigo:cart-pop", handler);
  }, []);

  return (
    <Link
      href="/menu"
      id="cart-fly-target"
      aria-label={`${t("nav.cart")}${count > 0 ? `, ${count}` : ""}`}
      className="text-text-primary hover:text-primary transition-colors relative hover:-translate-y-0.5 hover:transition-transform duration-300"
    >
      <motion.span
        key={pop}
        animate={pop ? { scale: [1, 1.35, 1] } : undefined}
        transition={{ duration: 0.45, ease: EXPO }}
        className="material-symbols-outlined block"
      >
        shopping_cart
      </motion.span>
      {count > 0 ? (
        <motion.span
          key={`badge-${pop}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: EXPO }}
          className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-primary text-white text-[10px] font-body font-bold rounded-full flex items-center justify-center leading-none"
        >
          {count}
        </motion.span>
      ) : (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
      )}
    </Link>
  );
}

interface NavbarClientProps {
  user: User | null;
  profile: Profile | null;
}

function LoyaltyChip({ points }: { points: number }) {
  return (
    <span className="hidden md:inline-flex items-center gap-1 text-amber-400 font-body text-xs font-medium">
      <span className="material-symbols-outlined text-[14px]">star</span>
      {points.toLocaleString()}
    </span>
  );
}

export default function NavbarClient({ user, profile }: NavbarClientProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  async function handleSignOut() {
    await signOut();
  }

  const navLinks = NAV_ITEMS.map((item) => ({
    label: t(item.tKey),
    href: item.href,
    active: item.href.startsWith("/") && pathname.startsWith(item.href),
  }));

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0B0B0B]/85 backdrop-blur-xl border-b border-[rgba(244,236,216,0.10)] shadow-xl shadow-red-900/10">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-full">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group hover:-translate-y-0.5 transition-transform duration-300"
        >
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-headline font-black text-xl leading-none">S</span>
          </div>
          <span className="text-2xl font-headline tracking-tighter text-primary leading-none">
            SUSHI GO
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <NavHeader links={navLinks} />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <CartButton />

          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {user ? (
            /* Authenticated: avatar + dropdown */
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 group"
                aria-expanded={dropdownOpen}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile?.avatar_url ?? ''}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border border-primary/30"
                  style={{ display: profile?.avatar_url ? 'block' : 'none' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 items-center justify-center"
                  style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                </div>
                {profile && <LoyaltyChip points={profile.loyalty_points} />}
                <span className="material-symbols-outlined text-text-muted text-[16px]">
                  {dropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-surface-border rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b border-surface-border">
                      <p className="text-text-primary font-body text-sm font-medium truncate">
                        {profile?.full_name ?? "My Account"}
                      </p>
                      <p className="text-text-muted font-body text-xs truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-text-muted hover:text-text-primary hover:bg-background font-body text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      {t("nav.profile")}
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-text-muted hover:text-text-primary hover:bg-background font-body text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                      {t("nav.myOrders")}
                    </Link>
                    <div className="border-t border-surface-border mt-1" />
                    <button
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-primary hover:bg-primary/10 font-body text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      {t("nav.signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Unauthenticated: sign in button */
            <Link
              href="/auth/login"
              className="hidden md:block bg-primary text-white font-headline tracking-tight px-6 py-2.5 rounded hover:bg-red-700 btn-hover-lift"
            >
              {t("nav.signIn")}
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("nav.toggleMenu")}
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-[#0B0B0B]/95 backdrop-blur-xl">
          <nav className="flex flex-col px-6 py-4 gap-4 font-body">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`py-2 transition-colors ${
                  link.active ? "text-primary" : "text-text-primary hover:text-primary"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="py-2 text-text-primary hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.profile")}
                </Link>
                <Link
                  href="/orders"
                  className="py-2 text-text-primary hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.myOrders")}
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="mt-2 bg-primary/10 text-primary font-headline text-center px-6 py-3 rounded tracking-tight w-full"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="mt-2 bg-primary text-white font-headline text-center px-6 py-3 rounded tracking-tight"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.signIn")}
              </Link>
            )}

            {/* Language */}
            <div className="mt-3 pt-3 border-t border-surface-border">
              <p className="text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                {t("nav.language")}
              </p>
              <LanguageSwitcher variant="inline" onSelect={() => setMobileOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
