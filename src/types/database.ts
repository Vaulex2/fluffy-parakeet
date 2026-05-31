// ============================================================
// Database row types — mirrors actual Supabase schema
// ============================================================

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'dine_in' | 'delivery' | 'pickup';
export type TableType = 'indoor' | 'outdoor' | 'vip' | 'bar';

// ── Menu ──────────────────────────────────────────────────

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  calories: number | null;
  image_url: string | null;
  is_featured: boolean;
  is_popular: boolean;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItemWithCategory extends MenuItem {
  menu_categories: MenuCategory | null;
}

// ── Tables ────────────────────────────────────────────────

export interface RestaurantTable {
  id: string;
  table_number: number;
  seat_count: number;
  table_type: TableType;
  is_available: boolean;
  description: string | null;
  created_at: string;
}

// ── Reservations ──────────────────────────────────────────

export interface Reservation {
  id: string;
  user_id: string | null;
  table_id: string;
  reservation_date: string;  // "YYYY-MM-DD"
  start_time: string;        // "HH:MM:SS" (TIME)
  end_time: string;          // "HH:MM:SS" (TIME)
  guest_count: number;
  status: ReservationStatus;
  special_requests: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithTable extends Reservation {
  restaurant_tables: RestaurantTable | null;
}

// ── Orders ────────────────────────────────────────────────

export interface Order {
  id: string;
  user_id: string | null;
  order_type: OrderType;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  delivery_address: string | null;
  table_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// ── Insert types (omit server-generated fields) ───────────

export type InsertReservation = Pick<
  Reservation,
  'table_id' | 'reservation_date' | 'start_time' | 'end_time' |
  'guest_count' | 'guest_name' | 'guest_phone' | 'special_requests'
> & { guest_email?: string | null; user_id?: string | null };

export type InsertOrder = Pick<
  Order,
  'order_type' | 'total_amount' | 'delivery_address' | 'notes'
> & {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
};

export type InsertOrderItem = {
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type InsertMenuItem = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
export type InsertMenuCategory = Pick<MenuCategory, 'name' | 'slug' | 'sort_order'> & {
  description?: string | null;
  image_url?: string | null;
};
export type InsertRestaurantTable = Omit<RestaurantTable, 'id' | 'created_at'>;

// ── Auth / Profiles ───────────────────────────────────────

export type UserRole = 'customer' | 'staff' | 'admin';
export type PreferredLanguage = 'en' | 'uz' | 'ru';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  loyalty_points: number;
  preferred_language: PreferredLanguage;
  role: UserRole;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export type UpdateProfile = Partial<Pick<Profile, 'full_name' | 'phone' | 'preferred_language' | 'avatar_url'>>;

export interface ProfileWithStats extends Profile {
  order_count: number;
  reservation_count: number;
}

// ── Audit Log ─────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}
