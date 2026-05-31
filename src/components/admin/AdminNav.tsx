"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "grid_view" },
  { href: "/admin/reservations", label: "Reservations", icon: "calendar_month" },
  { href: "/admin/orders", label: "Orders", icon: "shopping_bag" },
  { href: "/admin/menu", label: "Menu", icon: "restaurant_menu" },
  { href: "/admin/tables", label: "Tables", icon: "table_restaurant" },
  { href: "/admin/users", label: "Users", icon: "people" },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-40 w-64 h-screen bg-[#0f0f0f] border-r border-surface-border flex flex-col">
      <div className="px-5 py-5 border-b border-surface-border">
        <p className="font-headline text-xl text-primary tracking-tight">SUSHIGO</p>
        <p className="text-text-muted font-body text-xs mt-0.5">Admin Panel</p>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors border-l-2 ${
                active
                  ? "bg-primary/10 text-primary border-primary"
                  : "text-text-muted hover:text-text-primary hover:bg-surface border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
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
