"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { useFlyToCart } from "@/components/cart/FlyToCartContext";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { localizedField } from "@/lib/i18n";
import type { MenuItemWithCategory } from "@/types/database";

function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

// Shared quantity stepper / add button used in both card and list row
function QuantityControl({ item }: { item: MenuItemWithCategory }) {
  const { addItem, items: cartItems, updateQuantity } = useCart();
  const { locale } = useLanguage();
  const fly = useFlyToCart();
  const cartEntry = cartItems.find((ci) => ci.id === item.id);
  const qty = cartEntry?.quantity ?? 0;
  const name = localizedField(item, "name", locale);

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
          className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-colors"
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

// Badge overlays for popular / featured items
function ItemBadges({
  item,
  compact = false,
}: {
  item: MenuItemWithCategory;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  if (!item.is_popular && !item.is_featured) return null;
  return (
    <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
      {item.is_popular && (
        <span
          className={`font-headline tracking-widest uppercase bg-primary/90 text-white rounded backdrop-blur-sm ${
            compact ? "text-[8px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
          }`}
        >
          {compact ? t("menu.badgePopularShort") : t("menu.badgePopular")}
        </span>
      )}
      {item.is_featured && (
        <span
          className={`font-headline tracking-widest uppercase bg-background/80 text-text-primary border border-surface-border rounded backdrop-blur-sm ${
            compact ? "text-[8px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
          }`}
        >
          {compact ? t("menu.badgeFeaturedShort") : t("menu.badgeFeatured")}
        </span>
      )}
    </div>
  );
}

interface MenuCardProps {
  item: MenuItemWithCategory;
  index: number;
}

function MenuCard({ item, index }: MenuCardProps) {
  const { locale } = useLanguage();
  const name = localizedField(item, "name", locale);
  const description = localizedField(item, "description", locale);
  return (
    <div
      className="group relative bg-surface border border-surface-border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-500 opacity-0 animate-card-enter"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10 pointer-events-none" />
        <ItemBadges item={item} />
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            className="object-cover img-hover-zoom"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted text-5xl opacity-30">
              set_meal
            </span>
          </div>
        )}
      </div>

      <div className="p-6 relative z-20 -mt-12">
        <h3 className="font-headline text-3xl text-text-primary tracking-tighter uppercase mb-1">
          {name}
        </h3>
        {description && (
          <p className="text-text-muted text-sm font-light mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex justify-between items-end">
          <div>
            <span className="font-headline text-primary text-xl">
              {formatPrice(item.price)}
            </span>
            {item.calories !== null && (
              <span className="block text-text-muted font-body text-xs mt-0.5">
                {item.calories} kcal
              </span>
            )}
          </div>
          <QuantityControl item={item} />
        </div>
      </div>
    </div>
  );
}

function MenuListRow({ item, index }: MenuCardProps) {
  const { locale } = useLanguage();
  const name = localizedField(item, "name", locale);
  const description = localizedField(item, "description", locale);
  return (
    <div
      className="group flex items-center gap-4 bg-surface border border-surface-border rounded-xl overflow-hidden p-3 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-500 opacity-0 animate-card-enter"
      style={{ "--i": index } as React.CSSProperties}
    >
      {/* Fixed-size image */}
      <div className="relative w-[120px] h-[120px] flex-shrink-0 rounded-lg overflow-hidden">
        <ItemBadges item={item} compact />
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            className="object-cover img-hover-zoom"
            sizes="120px"
          />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-text-muted text-4xl opacity-30">
              set_meal
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-headline text-2xl tracking-tighter uppercase text-text-primary truncate">
          {name}
        </h3>
        {description && (
          <p className="text-text-muted text-sm font-light mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-headline text-primary text-lg">
              {formatPrice(item.price)}
            </span>
            {item.calories !== null && (
              <span className="ml-2 text-text-muted font-body text-xs">
                {item.calories} kcal
              </span>
            )}
          </div>
          <QuantityControl item={item} />
        </div>
      </div>
    </div>
  );
}

interface MenuGridProps {
  items: MenuItemWithCategory[];
  viewMode: "grid" | "list";
  hasActiveFilters: boolean;
  searchQuery: string;
  onClearFilters: () => void;
}

export default function MenuGrid({
  items,
  viewMode,
  hasActiveFilters,
  searchQuery,
  onClearFilters,
}: MenuGridProps) {
  const { count, openCart } = useCart();
  const { t } = useLanguage();

  return (
    <>
      {/* Cart FAB */}
      {count > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-lg shadow-primary/30 hover:bg-red-700 transition-colors font-body text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          {t("menu.inOrder", {
            count,
            unit: t(count === 1 ? "menu.unitItem" : "menu.unitItems"),
          })}
        </button>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl opacity-20 block mb-4 text-text-muted">
            search_off
          </span>
          <h3 className="font-headline text-3xl uppercase tracking-tighter text-text-primary mb-2">
            {t("menu.noResults")}
          </h3>
          <p className="font-body text-text-muted text-sm mb-6 max-w-[40ch] mx-auto">
            {searchQuery
              ? t("menu.noMatchSearch", { query: searchQuery })
              : t("menu.noMatchFilters")}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="bg-primary text-white font-headline tracking-tight px-6 py-2.5 rounded hover:bg-red-700 transition-colors duration-200"
            >
              {t("menu.clearFilters")}
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <MenuCard key={item.id} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <MenuListRow key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
