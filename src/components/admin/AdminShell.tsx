"use client";

import { useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar (hidden once the sidebar is permanent at lg+) */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0f0f0f] border-b border-surface-border">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center text-text-primary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
        <p className="font-headline text-lg text-primary tracking-tight">
          SUSHIGO <span className="text-text-muted font-body text-xs">Admin</span>
        </p>
        <span className="w-8" aria-hidden />
      </header>

      <AdminNav userEmail={userEmail} open={open} onClose={() => setOpen(false)} />

      {/* Backdrop — only on mobile while the drawer is open */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <main className="lg:pl-64 p-4 sm:p-6 lg:p-8 min-h-screen">{children}</main>
    </div>
  );
}
