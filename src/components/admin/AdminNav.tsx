"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "grid_view" },
  { href: "/admin/reservations", label: "Reservations", icon: "calendar_month" },
  { href: "/admin/orders", label: "Orders", icon: "shopping_bag" },
  { href: "/admin/menu", label: "Menu", icon: "restaurant_menu" },
  { href: "/admin/tables", label: "Tables", icon: "table_restaurant" },
  { href: "/admin/users", label: "Users", icon: "people" },
];

export default function AdminNav({
  userEmail,
  open,
  onClose,
}: {
  userEmail: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Dismiss the mobile drawer whenever the route changes (a no-op on desktop,
  // where it stays pinned open).
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-64 h-screen bg-[#0f0f0f] border-r border-surface-border flex flex-col transition-transform duration-300 ease-[var(--expo)] lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-5 py-5 border-b border-surface-border flex items-start justify-between">
        <div>
          <p className="font-headline text-xl text-primary tracking-tight">SUSHIGO</p>
          <p className="text-text-muted font-body text-xs mt-0.5">Admin Panel</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden -mr-1 text-text-muted hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                active
                  ? "text-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-surface"
              }`}
            >
              {active &&
                (reduceMotion ? (
                  <span className="absolute inset-0 rounded-lg border-l-2 border-primary bg-primary/10" />
                ) : (
                  <motion.span
                    layoutId="admin-nav-active"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-lg border-l-2 border-primary bg-primary/10"
                  />
                ))}
              <span className="material-symbols-outlined text-[18px] relative z-10">
                {icon}
              </span>
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-surface-border px-3 py-4 space-y-1">
        <p className="px-3 text-text-muted font-body text-xs truncate pb-1">{userEmail}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-primary font-body text-sm hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
