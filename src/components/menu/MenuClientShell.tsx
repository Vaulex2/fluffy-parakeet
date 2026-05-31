"use client";

import { useState } from "react";
import MenuGrid from "./MenuGrid";
import type { MenuCategory, MenuItemWithCategory } from "@/types/database";

interface MenuClientShellProps {
  items: MenuItemWithCategory[];
  categories: MenuCategory[];
}

export default function MenuClientShell({ items, categories }: MenuClientShellProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-2 rounded-full font-body text-sm border transition-colors ${
            activeCategory === null
              ? "bg-primary border-primary text-white"
              : "border-surface-border text-text-muted hover:border-primary/60"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2 rounded-full font-body text-sm border transition-colors ${
              activeCategory === cat.id
                ? "bg-primary border-primary text-white"
                : "border-surface-border text-text-muted hover:border-primary/60"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <MenuGrid items={items} categories={categories} activeCategory={activeCategory} />
    </div>
  );
}
