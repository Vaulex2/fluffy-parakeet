"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import type { MenuCategory, MenuItemWithCategory } from "@/types/database";

function formatPrice(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

interface MenuCardProps {
  item: MenuItemWithCategory;
}

function MenuCard({ item }: MenuCardProps) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem({
      id: item.id,
      name: item.name,
      price_uzs: item.price,
      image_url: item.image_url,
    });
  }

  return (
    <div className="group relative bg-surface border border-surface-border rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
      <div className="aspect-[3/4] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10 pointer-events-none" />
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
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
          {item.name}
        </h3>
        {item.description && (
          <p className="text-text-muted text-sm font-light mb-4 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-end">
          <span className="font-headline text-primary text-xl">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={handleAdd}
            className="bg-light-bg text-background p-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-300"
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="material-symbols-outlined fill text-[20px]">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface MenuGridProps {
  items: MenuItemWithCategory[];
  categories: MenuCategory[];
  activeCategory: string | null;
}

export default function MenuGrid({ items, activeCategory }: MenuGridProps) {
  const { count, openCart } = useCart();
  const filtered = activeCategory
    ? items.filter((i) => i.category_id === activeCategory)
    : items;

  return (
    <>
      {/* Cart FAB */}
      {count > 0 && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-lg shadow-primary/30 hover:bg-red-700 transition-colors font-body text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          {count} {count === 1 ? "item" : "items"} in order
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-text-muted font-body">
          <span className="material-symbols-outlined text-5xl opacity-30 block mb-3">
            restaurant_menu
          </span>
          No items in this category yet.
        </div>
      )}
    </>
  );
}
