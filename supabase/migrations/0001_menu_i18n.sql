-- Menu content localization (additive, non-breaking).
-- Adds nullable per-language columns. The existing `name` / `description`
-- columns remain the canonical fallback used when a translation is empty
-- (see localizedField() in src/lib/i18n/index.ts).

alter table public.menu_items
  add column if not exists name_uz        text,
  add column if not exists name_ru        text,
  add column if not exists name_en        text,
  add column if not exists description_uz text,
  add column if not exists description_ru text,
  add column if not exists description_en text;

alter table public.menu_categories
  add column if not exists name_uz text,
  add column if not exists name_ru text,
  add column if not exists name_en text;

-- Seed the Uzbek (default-locale) columns from the existing base values so
-- nothing reads as blank before admins fill in translations. Other locales
-- stay NULL and fall back to the base column at render time.
update public.menu_items
  set name_uz = coalesce(name_uz, name),
      description_uz = coalesce(description_uz, description);

update public.menu_categories
  set name_uz = coalesce(name_uz, name);
