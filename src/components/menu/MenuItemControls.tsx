"use client";

import { useCart } from "@/components/cart/CartContext";
import { useFlyToCart } from "@/components/cart/FlyToCartContext";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { localizedField } from "@/lib/i18n";
import type { MenuItemWithAvailability } from "@/types/database";

// Below this many remaining, surface a "Only N left today" hint to customers.
export const LOW_STOCK_THRESHOLD = 5;

export function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

// Shared quantity stepper / add button used in cards, list rows, and the modal.
// Respects the item's remaining daily capacity (null = unlimited).
export function QuantityControl({ item }: { item: MenuItemWithAvailability }) {
  const { addItem, items: cartItems, updateQuantity } = useCart();
  const { locale, t } = useLanguage();
  const fly = useFlyToCart();
  const cartEntry = cartItems.find((ci) => ci.id === item.id);
  const qty = cartEntry?.quantity ?? 0;
  const name = localizedField(item, "name", locale);
  const { remaining } = item;

  // Fully sold out for today — no add control at all.
  if (remaining === 0) {
    return (
      <span className="font-headline tracking-tight uppercase text-[11px] px-3 py-1.5 rounded-full bg-surface border border-surface-border text-text-muted whitespace-nowrap">
        {t("menu.soldOutToday")}
      </span>
    );
  }

  const atMax = remaining != null && qty >= remaining;

  if (qty > 0) {
    return (
      <div className="flex items-center gap-1.5 bg-surface border border-surface-border rounded-full px-2 py-1">
        <button
          onClick={() => updateQuantity(item.id, qty - 1)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-colors text-base leading-none"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="text-text-primary font-body text-sm w-4 text-center select-none">
          {qty}
        </span>
        <button
          onClick={() => updateQuantity(item.id, qty + 1)}
          disabled={atMax}
          className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-text-muted"
          aria-label="Increase quantity"
        >
          <span className="material-symbols-outlined fill text-[16px]">add</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        fly({ imageUrl: item.image_url, from: e.currentTarget.getBoundingClientRect() });
        addItem(
          {
            id: item.id,
            name,
            price_uzs: item.price,
            image_url: item.image_url,
          },
          { openDrawer: false }
        );
      }}
      className="bg-light-bg text-background p-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-300"
      aria-label={`Add ${name} to cart`}
    >
      <span className="material-symbols-outlined fill text-[20px]">add</span>
    </button>
  );
}

// "Only N left today" hint — shown when an item is low but not sold out.
export function LowStockNote({
  item,
  className = "",
}: {
  item: MenuItemWithAvailability;
  className?: string;
}) {
  const { t } = useLanguage();
  const { remaining } = item;
  if (remaining == null || remaining === 0 || remaining > LOW_STOCK_THRESHOLD) return null;
  return (
    <span className={`font-body text-xs text-amber-400 ${className}`}>
      {t("menu.onlyNLeft", { count: remaining })}
    </span>
  );
}
