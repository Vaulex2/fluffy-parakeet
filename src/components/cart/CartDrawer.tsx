"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

export default function CartDrawer() {
  const { t } = useLanguage();
  const { items, count, total, removeItem, updateQuantity, isOpen, closeCart } =
    useCart();

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#111] border-l border-surface-border z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-text-primary">
              shopping_bag
            </span>
            <span className="font-headline text-xl tracking-tight text-text-primary">
              {t("cart.yourOrder")}
            </span>
            {count > 0 && (
              <span className="bg-primary text-white text-xs font-body font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label={t("cart.closeCart")}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-text-muted">
              <span className="material-symbols-outlined text-5xl opacity-30">
                restaurant_menu
              </span>
              <p className="font-body text-sm">{t("cart.empty")}</p>
              <button
                onClick={closeCart}
                className="text-primary font-body text-sm hover:underline"
              >
                {t("cart.browseMenu")}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-surface border border-surface-border rounded-xl p-3"
              >
                {item.image_url && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-body text-sm font-medium truncate">
                    {item.name}
                  </p>
                  <p className="text-primary font-body text-xs mt-0.5">
                    {formatPrice(item.price_uzs)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="text-text-primary font-body text-sm w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-text-muted hover:text-primary transition-colors"
                      aria-label={t("cart.removeItem")}
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted font-body text-sm">{t("cart.total")}</span>
              <span className="text-text-primary font-headline text-xl tracking-tight">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-primary text-white text-center font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors duration-200"
            >
              {t("cart.checkout")}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
