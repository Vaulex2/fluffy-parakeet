"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { FavoriteHeart } from "@/components/favorites/FavoriteHeart";
import MenuItemModal from "@/components/menu/MenuItemModal";
import { QuantityControl, LowStockNote, formatPrice } from "@/components/menu/MenuItemControls";
import { localizedField } from "@/lib/i18n";
import type { MenuItemWithAvailability } from "@/types/database";

// Badge overlays for popular / featured items
function ItemBadges({
  item,
  compact = false,
}: {
  item: MenuItemWithAvailability;
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
  item: MenuItemWithAvailability;
  index: number;
  onOpen: (item: MenuItemWithAvailability) => void;
}

function MenuCard({ item, index, onOpen }: MenuCardProps) {
  const { locale } = useLanguage();
  const name = localizedField(item, "name", locale);
  const description = localizedField(item, "description", locale);
  return (
    <div
      className="group relative bg-surface border border-surface-border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-500 opacity-0 animate-card-enter"
      style={{ "--i": index } as React.CSSProperties}
    >
      <FavoriteHeart id={item.id} className="absolute top-2.5 right-2.5 z-30 w-9 h-9" />
      <div
        className="aspect-[3/4] overflow-hidden relative cursor-pointer"
        onClick={() => onOpen(item)}
      >
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
        <h3
          className="font-headline text-3xl text-text-primary tracking-tighter uppercase mb-1 cursor-pointer hover:text-primary transition-colors"
          onClick={() => onOpen(item)}
        >
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
            <LowStockNote item={item} className="block mt-0.5" />
          </div>
          <QuantityControl item={item} />
        </div>
      </div>
    </div>
  );
}

function MenuListRow({ item, index, onOpen }: MenuCardProps) {
  const { locale } = useLanguage();
  const name = localizedField(item, "name", locale);
  const description = localizedField(item, "description", locale);
  return (
    <div
      className="group flex items-center gap-4 bg-surface border border-surface-border rounded-xl overflow-hidden p-3 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-500 opacity-0 animate-card-enter"
      style={{ "--i": index } as React.CSSProperties}
    >
      {/* Fixed-size image */}
      <div
        className="relative w-[120px] h-[120px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onOpen(item)}
      >
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
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-headline text-2xl tracking-tighter uppercase text-text-primary truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => onOpen(item)}
          >
            {name}
          </h3>
          <FavoriteHeart id={item.id} className="w-8 h-8 shrink-0" size={18} />
        </div>
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
            <LowStockNote item={item} className="block mt-0.5" />
          </div>
          <QuantityControl item={item} />
        </div>
      </div>
    </div>
  );
}

interface MenuGridProps {
  items: MenuItemWithAvailability[];
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
  const [modalItem, setModalItem] = useState<MenuItemWithAvailability | null>(null);

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
            <MenuCard key={item.id} item={item} index={i} onOpen={setModalItem} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <MenuListRow key={item.id} item={item} index={i} onOpen={setModalItem} />
          ))}
        </div>
      )}

      {modalItem && (
        <MenuItemModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </>
  );
}
