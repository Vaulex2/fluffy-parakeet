"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { FavoriteHeart } from "@/components/favorites/FavoriteHeart";
import { QuantityControl, LowStockNote, formatPrice } from "@/components/menu/MenuItemControls";
import { localizedField } from "@/lib/i18n";
import type { MenuItemWithAvailability } from "@/types/database";

export default function MenuItemModal({
  item,
  onClose,
}: {
  item: MenuItemWithAvailability;
  onClose: () => void;
}) {
  const { locale, t } = useLanguage();
  const name = localizedField(item, "name", locale);
  const description = localizedField(item, "description", locale);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0f0f0f] border border-surface-border rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-surface">
          {item.image_url ? (
            <Image src={item.image_url} alt={name} fill className="object-cover" sizes="512px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-text-muted text-6xl opacity-30">set_meal</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent pointer-events-none" />
          <FavoriteHeart id={item.id} className="absolute top-3 right-3 w-10 h-10" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cart.closeCart")}
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-surface-border text-text-primary hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <h2 className="font-headline text-4xl tracking-tighter uppercase text-text-primary">{name}</h2>
          {description && (
            <p className="font-body text-text-muted text-sm leading-relaxed">{description}</p>
          )}

          <div className="flex items-end justify-between gap-4 pt-2">
            <div>
              <span className="font-headline text-primary text-2xl">{formatPrice(item.price)}</span>
              {item.calories !== null && (
                <span className="block text-text-muted font-body text-xs mt-0.5">{item.calories} kcal</span>
              )}
              <LowStockNote item={item} className="block mt-1" />
            </div>
            <QuantityControl item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
