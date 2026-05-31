'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { InsertReservation, Reservation, RestaurantTable } from '@/types/database';

export type ReservationResult =
  | { success: true; id: string }
  | { success: false; error: 'slot_taken' | 'invalid_input' | 'unknown'; message: string };

// ── Input validation schema (M-01) ────────────────────────────────────────────
const reservationSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  guest_phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Phone number must be 7–15 digits'),
  guest_email: z.string().email('Invalid email').optional().nullable(),
  reservation_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine(
      (d) => new Date(d) >= new Date(new Date().toDateString()),
      'Reservation date cannot be in the past'
    ),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid start time format'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid end time format'),
  guest_count: z
    .number()
    .int()
    .min(1, 'At least 1 guest required')
    .max(20, 'Maximum 20 guests'),
  table_id: z.string().uuid('Invalid table ID'),
  special_requests: z.string().max(500, 'Special requests must be under 500 characters').optional().nullable(),
});

export async function getAvailableTables(
  date: string,      // YYYY-MM-DD
  startTime: string, // HH:MM:SS
  endTime: string,   // HH:MM:SS
  guestCount: number
): Promise<RestaurantTable[]> {
  // Admin client: guest-accessible read — intentional bypass for unauthenticated users
  const supabase = createAdminClient();

  const { data: allTables, error: tableError } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('is_available', true)
    .gte('seat_count', guestCount)
    .order('table_number');

  if (tableError) throw tableError;
  if (!allTables?.length) return [];

  const tableIds = allTables.map((t) => t.id);
  const { data: conflicts, error: conflictError } = await supabase
    .from('reservations')
    .select('table_id')
    .in('table_id', tableIds)
    .in('status', ['pending', 'confirmed'])
    .eq('reservation_date', date)
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (conflictError) throw conflictError;

  const bookedTableIds = new Set((conflicts ?? []).map((r) => r.table_id));
  return allTables.filter((t) => !bookedTableIds.has(t.id));
}

export async function createReservation(
  data: InsertReservation
): Promise<ReservationResult> {
  // ── Zod validation (M-01) ────────────────────────────────────────────────
  const parsed = reservationSchema.safeParse({
    guest_name: data.guest_name,
    guest_phone: data.guest_phone,
    guest_email: data.guest_email,
    reservation_date: data.reservation_date,
    start_time: data.start_time,
    end_time: data.end_time,
    guest_count: data.guest_count,
    table_id: data.table_id,
    special_requests: data.special_requests,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input.';
    return { success: false, error: 'invalid_input', message: firstError };
  }

  // Admin client: unauthenticated guests can create reservations via public RLS policy
  const supabase = createAdminClient();
  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      guest_name: parsed.data.guest_name,
      guest_phone: parsed.data.guest_phone,
      guest_email: parsed.data.guest_email ?? null,
      reservation_date: parsed.data.reservation_date,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      guest_count: parsed.data.guest_count,
      table_id: parsed.data.table_id,
      special_requests: parsed.data.special_requests ?? null,
      user_id: data.user_id ?? null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23P01') {
      return {
        success: false,
        error: 'slot_taken',
        message: 'This table is no longer available. Please choose another slot.',
      };
    }
    // ── Sanitize DB error (M-04) — never expose raw error.message to client
    console.error('[createReservation] DB error:', error);
    return { success: false, error: 'unknown', message: 'An error occurred. Please try again.' };
  }

  return { success: true, id: reservation.id };
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  // ── Auth + ownership check (C-04) ─────────────────────────────────────────
  // Use the user-scoped client. Guest reservations (no user_id) return null —
  // guests should access their booking only via the confirmation email link.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // ownership check — prevents IDOR
    .single();

  if (error) return null;
  return data;
}
