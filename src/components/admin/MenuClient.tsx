"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  uploadMenuImage,
  createCategory,
  deleteCategory,
} from "@/lib/actions/admin/menu";
import type { MenuCategory, MenuItemWithCategory, InsertMenuItem } from "@/types/database";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

function fmt(uzs: number) {
  return uzs.toLocaleString("uz-UZ") + " UZS";
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const BLANK: Omit<InsertMenuItem, "sort_order"> = {
  name: "",
  name_uz: null,
  name_ru: null,
  name_en: null,
  category_id: null,
  price: 0,
  description: null,
  description_uz: null,
  description_ru: null,
  description_en: null,
  image_url: null,
  is_available: true,
  is_featured: false,
  is_popular: false,
  calories: null,
  daily_limit: 30,
};

export default function MenuClient({
  initialItems,
  categories,
  soldToday = {},
}: {
  initialItems: MenuItemWithCategory[];
  categories: MenuCategory[];
  soldToday?: Record<string, number>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "item">(null);
  const [editingItem, setEditingItem] = useState<MenuItemWithCategory | null>(null);
  const [form, setForm] = useState<Omit<InsertMenuItem, "sort_order">>(BLANK);
  const [langTab, setLangTab] = useState<Locale>("uz");
  const [uploading, setUploading] = useState(false);
  const [catName, setCatName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = activeCategory
    ? initialItems.filter((i) => i.category_id === activeCategory)
    : initialItems;

  function openAdd() {
    setEditingItem(null);
    setForm(BLANK);
    setLangTab("uz");
    setModal("item");
  }

  function openEdit(item: MenuItemWithCategory) {
    setEditingItem(item);
    setLangTab("uz");
    setForm({
      name: item.name,
      // Seed the Uzbek tab from the base column for items created before i18n.
      name_uz: item.name_uz ?? item.name,
      name_ru: item.name_ru,
      name_en: item.name_en,
      category_id: item.category_id,
      price: item.price,
      description: item.description,
      description_uz: item.description_uz ?? item.description,
      description_ru: item.description_ru,
      description_en: item.description_en,
      image_url: item.image_url,
      is_available: item.is_available,
      is_featured: item.is_featured,
      is_popular: item.is_popular,
      calories: item.calories,
      daily_limit: item.daily_limit,
    });
    setModal("item");
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadMenuImage(fd);
    setUploading(false);
    if ("url" in result) setForm((f) => ({ ...f, image_url: result.url }));
  }

  function saveItem() {
    // Base columns are the fallback: derive them from the localized fields
    // (Uzbek first), so the NOT NULL `name` is always populated.
    const baseName = (form.name_uz || form.name_en || form.name_ru || "").trim();
    const baseDescription =
      form.description_uz || form.description_en || form.description_ru || null;
    if (!baseName || !form.price) return;
    startTransition(async () => {
      const payload: InsertMenuItem = {
        ...form,
        name: baseName,
        description: baseDescription,
        sort_order: editingItem?.sort_order ?? 0,
      };
      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }
      setModal(null);
      router.refresh();
    });
  }

  function doDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    startTransition(async () => {
      await deleteMenuItem(id);
      router.refresh();
    });
  }

  function doToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleItemAvailability(id, !current);
      router.refresh();
    });
  }

  function addCategory() {
    if (!catName.trim()) return;
    startTransition(async () => {
      await createCategory({
        name: catName.trim(),
        name_uz: catName.trim(),
        slug: slugify(catName.trim()),
        sort_order: categories.length + 1,
      });
      setCatName("");
      router.refresh();
    });
  }

  function doDeleteCat(id: string) {
    if (!confirm("Delete category? Items will lose their category.")) return;
    startTransition(async () => {
      await deleteCategory(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl sm:text-4xl text-text-primary tracking-tight">MENU</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-body text-sm hover:bg-red-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Item
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-1.5 rounded-full font-body text-sm border transition-colors ${
            activeCategory === null
              ? "bg-primary border-primary text-white"
              : "border-surface-border text-text-muted hover:border-primary/50"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-5 py-1.5 rounded-full font-body text-sm border transition-colors ${
              activeCategory === c.id
                ? "bg-primary border-primary text-white"
                : "border-surface-border text-text-muted hover:border-primary/50"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-surface border border-surface-border rounded-xl overflow-hidden group"
          >
            <div className="aspect-video relative bg-[#111]">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="300px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-text-muted text-4xl opacity-20">set_meal</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="w-7 h-7 bg-background/80 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] text-text-muted">edit</span>
                </button>
                <button
                  onClick={() => doDelete(item.id)}
                  className="w-7 h-7 bg-background/80 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary">delete</span>
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="font-headline text-lg text-text-primary tracking-tight">{item.name}</p>
              {item.description && (
                <p className="text-text-muted font-body text-xs line-clamp-2">{item.description}</p>
              )}
              {(() => {
                const sold = soldToday[item.id] ?? 0;
                const limit = item.daily_limit;
                const soldOut = limit != null && sold >= limit;
                return (
                  <p className={`font-body text-[11px] ${soldOut ? "text-primary" : "text-text-muted"}`}>
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">
                      inventory_2
                    </span>
                    {limit != null ? `${sold} / ${limit} today` : `${sold} today · no limit`}
                    {soldOut ? " · sold out" : ""}
                  </p>
                );
              })()}
              <div className="flex items-center justify-between pt-1">
                <span className="text-primary font-body text-sm font-semibold">{fmt(item.price)}</span>
                <button
                  onClick={() => doToggle(item.id, item.is_available)}
                  disabled={isPending}
                  className={`relative w-10 h-5 rounded-full transition-colors overflow-hidden disabled:opacity-40 ${
                    item.is_available ? "bg-green-500" : "bg-surface-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      item.is_available ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-text-muted font-body">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-20">restaurant_menu</span>
            No items in this category
          </div>
        )}
      </div>

      {/* Categories section */}
      <section className="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-headline text-base text-text-primary tracking-tight">CATEGORIES</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-text-muted text-xs border-b border-surface-border">
                <th className="px-5 py-3 text-left font-medium">NAME</th>
                <th className="px-5 py-3 text-left font-medium">SLUG</th>
                <th className="px-5 py-3 text-left font-medium">ORDER</th>
                <th className="px-5 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50">
                  <td className="px-5 py-3 text-text-primary">{c.name}</td>
                  <td className="px-5 py-3 text-text-muted font-mono text-xs">{c.slug}</td>
                  <td className="px-5 py-3 text-text-muted">{c.sort_order}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => doDeleteCat(c.id)}
                      disabled={isPending}
                      className="text-primary text-xs hover:underline disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-surface-border">
          <p className="font-body text-xs text-text-muted mb-3">Add Category</p>
          <div className="flex gap-2">
            <input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Category name *"
              className="flex-1 min-w-0 bg-background border border-surface-border rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={addCategory}
              disabled={isPending || !catName.trim()}
              className="bg-primary text-white px-4 py-2 rounded-lg font-body text-sm hover:bg-red-700 transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* Item modal */}
      {modal === "item" && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModal(null)} />
          <div className="relative ml-auto w-full max-w-md bg-[#0f0f0f] border-l border-surface-border h-full overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl text-text-primary tracking-tight">
                {editingItem ? "EDIT ITEM" : "ADD NEW ITEM"}
              </h2>
              <button onClick={() => setModal(null)} className="text-text-muted hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest mb-2">
                Item Image
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-surface-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors"
              >
                {form.image_url ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <Image src={form.image_url} alt="preview" fill className="object-cover" sizes="400px" />
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-text-muted text-3xl">
                      {uploading ? "sync" : "cloud_upload"}
                    </span>
                    <span className="text-text-muted font-body text-sm">
                      {uploading ? "Uploading…" : "Click to upload"}
                    </span>
                    <span className="text-text-muted font-body text-xs">PNG, JPG up to 5MB</span>
                  </>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Localized name + description (per-language tabs) */}
            <div className="space-y-3">
              <div className="flex gap-1">
                {LOCALES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLangTab(l)}
                    className={`px-3 py-1.5 rounded-lg font-body text-xs border transition-colors ${
                      langTab === l
                        ? "bg-primary text-white border-primary"
                        : "border-surface-border text-text-muted hover:border-primary/40"
                    }`}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>

              <Field label={`Name (${LOCALE_LABELS[langTab]})${langTab === "uz" ? " *" : ""}`}>
                <input
                  value={(form[`name_${langTab}` as `name_${Locale}`] as string | null) ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [`name_${langTab}`]: e.target.value || null,
                    }) as typeof f)
                  }
                  placeholder="e.g. Tiger Roll"
                  className={inputCls}
                />
              </Field>

              <Field label={`Description (${LOCALE_LABELS[langTab]})`}>
                <textarea
                  value={
                    (form[`description_${langTab}` as `description_${Locale}`] as
                      | string
                      | null) ?? ""
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [`description_${langTab}`]: e.target.value || null,
                    }) as typeof f)
                  }
                  placeholder="Ingredients, taste profile…"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <p className="text-text-muted/70 font-body text-[11px]">
                Uzbek is required and is used as the fallback when a translation is
                left empty.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={form.category_id ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}
                  className={inputCls}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Price (UZS) *">
                <input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Daily limit (per day)">
              <input
                type="number"
                min={0}
                value={form.daily_limit ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    daily_limit: e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
                  }))
                }
                placeholder="Leave blank = unlimited"
                className={inputCls}
              />
              <p className="text-text-muted/70 font-body text-[11px] mt-1">
                Max units orderable per day. Blank = unlimited. Resets each day.
              </p>
            </Field>

            <Field label="Availability">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_available: !f.is_available }))}
                  className={`relative w-10 h-5 rounded-full transition-colors overflow-hidden ${
                    form.is_available ? "bg-green-500" : "bg-surface-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.is_available ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-text-muted font-body text-sm">
                  {form.is_available ? "Available on menu" : "Hidden from menu"}
                </span>
              </div>
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-surface-border text-text-muted font-body text-sm hover:border-primary/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                disabled={isPending || uploading || !form.name_uz || !form.price}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-body text-sm hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                {isPending ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-surface-border rounded-xl px-4 py-2.5 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}
