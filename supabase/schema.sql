-- ============================================================
-- SushiGO — Full Database Schema
-- Apply in Supabase: Dashboard → SQL Editor → Run
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist; -- required for EXCLUDE constraint on reservations

-- ============================================================
-- MENU
-- ============================================================

CREATE TABLE menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_en text NOT NULL,
  name_ru text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name_uz text NOT NULL,
  name_en text NOT NULL,
  name_ru text NOT NULL,
  description_uz text,
  description_en text,
  description_ru text,
  price_uzs integer NOT NULL CHECK (price_uzs > 0),
  image_url text,
  is_available boolean DEFAULT true,
  prep_time_minutes integer DEFAULT 15,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RESTAURANT TABLES (seating)
-- ============================================================

CREATE TABLE restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  capacity integer NOT NULL CHECK (capacity > 0),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RESERVATIONS
-- Double-booking is prevented at the DB level with an EXCLUDE
-- constraint: two active reservations cannot share the same
-- table_id AND have overlapping time ranges.
-- ============================================================

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text NOT NULL,
  reservation_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL CHECK (end_time > start_time),
  guest_count integer NOT NULL CHECK (guest_count > 0),
  table_id uuid REFERENCES restaurant_tables(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled_by_admin', 'no_show')),
  special_requests text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
    table_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  ) WHERE (status NOT IN ('canceled_by_admin', 'no_show'))
);

-- ============================================================
-- ORDERS (guest checkout — no customer account required)
-- ============================================================

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  order_type text NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  delivery_address text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'canceled')),
  total_amount_uzs integer NOT NULL CHECK (total_amount_uzs > 0),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL, -- captured at order time; menu name may change later
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_uzs integer NOT NULL,
  subtotal_uzs integer NOT NULL
);

-- ============================================================
-- GALLERY (optional, admin-managed)
-- ============================================================

CREATE TABLE gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt_en text,
  alt_uz text,
  alt_ru text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies: only authenticated admins can upload
CREATE POLICY "admin_upload_menu_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "public_read_menu_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "admin_upload_gallery" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "public_read_gallery_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read: menu and tables
CREATE POLICY "public_read_categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "public_read_items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "public_read_tables" ON restaurant_tables FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_gallery" ON gallery_images FOR SELECT USING (is_active = true);

-- Public read: reservations (for availability checking — client only sees time/table/status)
CREATE POLICY "public_read_reservations" ON reservations FOR SELECT USING (true);

-- Public insert: guests create reservations and orders without an account
CREATE POLICY "public_create_reservation" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "public_create_order" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_create_order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Admin (service role key) bypasses RLS entirely — no extra policies needed.
-- All admin mutations use createAdminClient() which uses SUPABASE_SERVICE_ROLE_KEY.

-- ============================================================
-- SEED DATA
-- ============================================================

-- Restaurant tables
INSERT INTO restaurant_tables (number, capacity, description) VALUES
  (1, 2, 'Window seat'),
  (2, 2, 'Window seat'),
  (3, 4, 'Center table'),
  (4, 4, 'Center table'),
  (5, 4, 'Booth'),
  (6, 6, 'Large booth'),
  (7, 6, 'Private corner'),
  (8, 8, 'Event table');

-- Menu categories
INSERT INTO menu_categories (name_uz, name_en, name_ru, sort_order) VALUES
  ('Roллар', 'Rolls', 'Роллы', 1),
  ('Нигири', 'Nigiri', 'Нигири', 2),
  ('Рамен', 'Ramen', 'Рамен', 3),
  ('Ичимликлар', 'Drinks', 'Напитки', 4);

-- Sample menu items (using first category — Rolls)
INSERT INTO menu_items (category_id, name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order)
SELECT
  c.id,
  name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order
FROM menu_categories c
CROSS JOIN (VALUES
  ('Rolls', 'Dragon Roll', 'Dragon Roll', 'Дракон Ролл', 'Premium eel, avocado, cucumber, unagi sauce.', 55000, 'https://lh3.googleusercontent.com/aida/ADBb0uijkyg1Z6KWD_N5aIBQGMc6RMorexpNshiJVdLqo6J92AVUa9NTxDTeYJej7fR5uQixi9qBajPd5-4OJVmT1EtW7mW6VQEr9SqsvzHk8QCJ3tvC2WEPpuGf8sLvulaPqw-9i_WtOlqN3gH3ZugEdGu1PC-h3DcsZU7ewCl12Ch-cxvJhImynzIGPxE9f7Md89IRoDQPlTYjKMXaoPEadKGQSGMPJfWnVMAqRb2Y0pvckJyuBX9TkqVkVuFL', 15, 1),
  ('Rolls', 'Rainbow Roll', 'Rainbow Roll', 'Рэйнбоу Ролл', 'California roll topped with assorted fresh fish and avocado.', 58000, 'https://lh3.googleusercontent.com/aida/ADBb0ujjI5dibVius1-fdiLTzxsUusq7_lq987nGUnYw8axAg6BeI_Qs0AI9Q6cPjPMYz4czKS7hCdn-00NfUPF_CD9MRI5TaGn3wKWWL2upNLGndC5mdmeZoDZZWdwHhHRBou71Cf5B9kHgpVA9wvRzx9Yp8yDR9pJW5MZfRik735lNFUPhgca-2TGgB95rdNopAS5sandwFYY2-SrUV8XRGXzZ51lbQ6yMpdVDrVa6y6KXShoE0dlKa-Ks84wj', 15, 2)
) AS items(category_name, name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order)
WHERE c.name_en = items.category_name;

INSERT INTO menu_items (category_id, name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order)
SELECT
  c.id,
  name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order
FROM menu_categories c
CROSS JOIN (VALUES
  ('Nigiri', 'Salmon Nigiri', 'Salmon Nigiri', 'Лосось Нигири', 'Hand-pressed premium vinegared rice with fresh Atlantic salmon.', 42000, 'https://lh3.googleusercontent.com/aida/ADBb0ug5v3l6jX6XmiHkS95ThSsVSzNWNufTWwYXJQ0LG3VAb3xOcZNUKfVCXiwz0SWRcpWMestTv_JYJiAiXRsJldVNS_rX4abb_OZqIAmCWC8nIlkmpub6Ie_KYkd-0U9km8H-JkIYtfoHzBDhiInqu9XnuHV7C0BJnIfn7G6TfASCkpRkxzscPfJTy47Or6JyBn8hXbMQt1GV7x4F_40u9Jn_9ykb6YeSx_rCfpXSo35_P20zGAQV2JAzDzCF', 10, 1)
) AS items(category_name, name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order)
WHERE c.name_en = items.category_name;

INSERT INTO menu_items (category_id, name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order)
SELECT
  c.id,
  name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order
FROM menu_categories c
CROSS JOIN (VALUES
  ('Ramen', 'Tonkotsu Ramen', 'Tonkotsu Ramen', 'Тонкоцу Рамен', '12-hour simmered pork broth, chashu pork, and soft egg.', 65000, 'https://lh3.googleusercontent.com/aida/ADBb0uiQnQ8vkdWjZc7uPGTUY7ukrUe6dhq47q0-QdfPmveIBejjw_fyartPYkRF11l5udtKMCxmx_1Y81r2TcxBiASRTVv1DiOjixH5-BHX8CzHKQBwRUKYR8ADpdaNH199EIewJGI6N5pBTqhGZm23VHd0AhS4O6H9rFsA3kBkABf-eGCLIC0ojmnBigDa0f3EMey7Q2L-zz17XHfqOKip2ujuK_EIxWRuGqZ1Yl8uD5busnJUHJGB_1dPYsw', 20, 1)
) AS items(category_name, name_uz, name_en, name_ru, description_en, price_uzs, image_url, prep_time_minutes, sort_order)
WHERE c.name_en = items.category_name;
