"use client";

import { useFavorites } from "@/components/favorites/FavoritesContext";
import { useLanguage } from "@/components/i18n/LanguageProvider";

/** Heart toggle for a menu item. Stops propagation so it works over a clickable card. */
export function FavoriteHeart({
  id,
  className = "",
  size = 20,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const { isFavorite, toggle } = useFavorites();
  const { t } = useLanguage();
  const fav = isFavorite(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={fav ? t("favorites.remove") : t("favorites.add")}
      aria-pressed={fav}
      className={`flex items-center justify-center rounded-full bg-background/70 backdrop-blur-sm border border-surface-border hover:border-primary/50 transition-colors ${className}`}
    >
      <span
        className={`material-symbols-outlined ${fav ? "fill text-primary" : "text-white"}`}
        style={{ fontSize: size }}
      >
        favorite
      </span>
    </button>
  );
}
