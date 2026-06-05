"use client";

import { useState } from "react";
import MenuGrid from "./MenuGrid";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { localizedField } from "@/lib/i18n";
import type { MenuCategory, MenuItemWithAvailability } from "@/types/database";

interface MenuClientShellProps {
  items: MenuItemWithAvailability[];
  categories: MenuCategory[];
}

export default function MenuClientShell({ items, categories }: MenuClientShellProps) {
  const { locale, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopular, setShowPopular] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const q = searchQuery.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      (!activeCategory || item.category_id === activeCategory) &&
      (!q ||
        localizedField(item, "name", locale).toLowerCase().includes(q) ||
        localizedField(item, "description", locale).toLowerCase().includes(q)) &&
      (!showPopular || item.is_popular) &&
      (!showFeatured || item.is_featured)
  );

  const hasActiveFilters =
    activeCategory !== null || q !== "" || showPopular || showFeatured;

  function clearAllFilters() {
    setActiveCategory(null);
    setSearchQuery("");
    setShowPopular(false);
    setShowFeatured(false);
  }

  const pillBase =
    "flex-shrink-0 px-5 py-2 rounded-full font-body text-sm border transition-colors duration-200";
  const pillActive = "bg-primary border-primary text-white";
  const pillInactive = "border-surface-border text-text-muted hover:border-primary/60";

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-[72px] z-30 -mx-6 px-6 py-3 backdrop-blur-md bg-background/80 border-b border-surface-border">
        {/* Row 1: category pills | search | view toggle */}
        <div className="flex items-center gap-3">
          {/* Scrollable category pills */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-0.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={`${pillBase} ${activeCategory === null ? pillActive : pillInactive}`}
            >
              {t("menu.filterAll")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveCategory(activeCategory === cat.id ? null : cat.id)
                }
                className={`${pillBase} ${
                  activeCategory === cat.id ? pillActive : pillInactive
                }`}
              >
                {localizedField(cat, "name", locale)}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-shrink-0 w-36 md:w-56">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder={t("menu.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-full pl-9 pr-4 py-1.5 text-sm font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {/* View toggle */}
          <div className="flex-shrink-0 flex items-center border border-surface-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-surface text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
              aria-label={t("menu.gridView")}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-surface text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
              aria-label={t("menu.listView")}
            >
              <span className="material-symbols-outlined text-[18px]">view_agenda</span>
            </button>
          </div>
        </div>

        {/* Row 2: quick-filter chips + item count */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPopular((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs border transition-colors duration-200 ${
                showPopular ? pillActive : pillInactive
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                local_fire_department
              </span>
              {t("menu.popular")}
            </button>
            <button
              onClick={() => setShowFeatured((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs border transition-colors duration-200 ${
                showFeatured ? pillActive : pillInactive
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">star</span>
              {t("menu.featured")}
            </button>
          </div>

          <span className="text-text-muted font-body text-xs">
            {t("menu.showing", {
              count: filtered.length,
              unit: t(filtered.length === 1 ? "menu.unitItem" : "menu.unitItems"),
            })}
          </span>
        </div>
      </div>

      {/* Grid / list */}
      <div className="mt-8">
        <MenuGrid
          items={filtered}
          viewMode={viewMode}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery.trim()}
          onClearFilters={clearAllFilters}
        />
      </div>
    </div>
  );
}
