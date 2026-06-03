'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/ratelimit';
import {
  sendReservationConfirmation,
  sendWaitlistNotification,
} from '@/lib/email/send';
import type {
  InsertReservation,
  InsertWaitlistEntry,
  Reservation,
  ReservationWithTable,
  RestaurantTable,
} from '@/types/database';

export type ReservationResult =
  | { success: true; id: string; manageToken: string }
  | { success: false; error: 'slot_taken' | 'invalid_input' | 'rate_limited' | 'unknown'; message: string };

// ── Booking hours (must mirror the time slots in ReservationForm) ──────────────
const OPEN_TIME = '11:00';
const LAST_SLOT = '21:30';

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

function manageLink(token: string): string {
  return `${siteUrl()}/reservations/manage/${token}`;
}

// Add minutes to an "HH:MM" time, returning "HH:MM" (clamped within a single day).
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.slice(0, 5).split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

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

export interface AvailabilityInfo {
  tables: RestaurantTable[];
  totalMatching: number; // active tables that fit the party size, regardless of bookings
}

// Shared availability lookup used by getAvailableTables / getAvailability / alternatives.
async function queryAvailability(
  date: string,
  startTime: string,
  endTime: string,
  guestCount: number
): Promise<AvailabilityInfo> {
  // Admin client: guest-accessible read — intentional bypass for unauthenticated users
  const supabase = createAdminClient();

  const { data: allTables, error: tableError } = await supabase
    .from('restaurant_tables')
    .select('*')
    .eq('is_available', true)
    .gte('seat_count', guestCount)
    .order('table_number');

  if (tableError) throw tableError;
  if (!allTables?.length) return { tables: [], totalMatching: 0 };

  const tableIds = allTables.map((t) => t.id);
  const { data: conflicts, error: conflictError } = await supabase
    .from('reservation_slots')
    .select('table_id')
    .in('table_id', tableIds)
    .eq('reservation_date', date)
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (conflictError) throw conflictError;

  const bookedTableIds = new Set((conflicts ?? []).map((r) => r.table_id));
  return {
    tables: (allTables as RestaurantTable[]).filter((t) => !bookedTableIds.has(t.id)),
    totalMatching: allTables.length,
  };
}

export async function getAvailableTables(
  date: string,      // YYYY-MM-DD
  startTime: string, // HH:MM:SS
  endTime: string,   // HH:MM:SS
  guestCount: number
): Promise<RestaurantTable[]> {
  return (await queryAvailability(date, startTime, endTime, guestCount)).tables;
}

export async function getAvailability(
  date: string,
  startTime: string,
  endTime: string,
  guestCount: number
): Promise<AvailabilityInfo> {
  return queryAvailability(date, startTime, endTime, guestCount);
}

export interface AlternativeSlot {
  time: string;       // "HH:MM"
  available: number;  // number of free tables
}

// Probe nearby start times (±30/60 min) for openings when the requested slot is full.
export async function getAlternativeSlots(
  date: string,
  baseTime: string,        // "HH:MM"
  durationMinutes: number,
  guestCount: number
): Promise<AlternativeSlot[]> {
  const offsets = [-60, -30, 30, 60];
  const results: AlternativeSlot[] = [];

  for (const offset of offsets) {
    const candidate = addMinutes(baseTime, offset);
    if (candidate < OPEN_TIME || candidate > LAST_SLOT) continue;
    const end = addMinutes(candidate, durationMinutes) + ':00';
    try {
      const { tables } = await queryAvailability(date, candidate + ':00', end, guestCount);
      if (tables.length > 0) results.push({ time: candidate, available: tables.length });
    } catch {
      // ignore a failed probe — alternatives are best-effort
    }
  }

  return results.sort((a, b) => a.time.localeCompare(b.time));
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

  // ── Rate limit by phone — booking emails arbitrary addresses ──────────────
  const allowed = await checkRateLimit('reservation', parsed.data.guest_phone);
  if (!allowed) {
    return {
      success: false,
      error: 'rate_limited',
      message: 'Too many booking attempts. Please wait a few minutes and try again.',
    };
  }

  // Resolve authenticated user server-side — never trust caller-supplied user_id
  const sessionClient = createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  const verifiedUserId = user?.id ?? null;

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
      user_id: verifiedUserId,
    })
    .select('id, manage_token')
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

  // ── Confirmation email (best-effort — never fail the booking) ─────────────
  if (parsed.data.guest_email) {
    await sendReservationConfirmation(parsed.data.guest_email, {
      name: parsed.data.guest_name,
      date: parsed.data.reservation_date,
      startTime: parsed.data.start_time,
      endTime: parsed.data.end_time,
      guestCount: parsed.data.guest_count,
      phone: parsed.data.guest_phone,
      manageUrl: manageLink(reservation.manage_token),
    }).catch(() => {});
  }

  return { success: true, id: reservation.id, manageToken: reservation.manage_token };
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

// ── Self-service via unguessable manage_token (no account required) ────────────

export async function getReservationByToken(token: string): Promise<ReservationWithTable | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('*, restaurant_tables(*)')
    .eq('manage_token', token)
    .single();

  if (error) return null;
  return data as ReservationWithTable;
}

export async function cancelReservationByToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { success: false, error: 'not_found' };
  const supabase = createAdminClient();

  // Fetch the slot first so we can offer it to the waitlist after cancelling.
  const { data: existing } = await supabase
    .from('reservations')
    .select('reservation_date, start_time, end_time, status')
    .eq('manage_token', token)
    .single();

  if (!existing) return { success: false, error: 'not_found' };
  if (!['pending', 'confirmed'].includes(existing.status)) {
    return { success: false, error: 'not_cancellable' };
  }

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('manage_token', token)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    console.error('[cancelReservationByToken] DB error:', error);
    return { success: false, error: 'unknown' };
  }

  await notifyWaitlistForSlot(existing.reservation_date, existing.start_time, existing.end_time);
  return { success: true };
}

export async function rescheduleReservationByToken(
  token: string,
  tableId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ success: boolean; error?: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { success: false, error: 'not_found' };
  const supabase = createAdminClient();

  // Capture the old slot so it can be offered to the waitlist after the move.
  const { data: existing } = await supabase
    .from('reservations')
    .select('reservation_date, start_time, end_time, status')
    .eq('manage_token', token)
    .single();

  if (!existing) return { success: false, error: 'not_found' };
  if (!['pending', 'confirmed'].includes(existing.status)) {
    return { success: false, error: 'not_modifiable' };
  }

  const { error } = await supabase
    .from('reservations')
    .update({
      table_id: tableId,
      reservation_date: date,
      start_time: startTime,
      end_time: endTime,
    })
    .eq('manage_token', token)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    if (error.code === '23P01') return { success: false, error: 'slot_taken' };
    console.error('[rescheduleReservationByToken] DB error:', error);
    return { success: false, error: 'unknown' };
  }

  // The old slot is now free — offer it to anyone waiting for it.
  await notifyWaitlistForSlot(existing.reservation_date, existing.start_time, existing.end_time);
  return { success: true };
}

// ── Waitlist ──────────────────────────────────────────────────────────────────

const waitlistSchema = z.object({
  guest_name: z.string().min(2).max(100),
  guest_phone: z.string().regex(/^\+?[0-9]{7,15}$/),
  guest_email: z.string().email().optional().nullable(),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  desired_start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  desired_end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  guest_count: z.number().int().min(1).max(20),
});

export async function joinWaitlist(
  data: InsertWaitlistEntry
): Promise<{ success: boolean; error?: string }> {
  const parsed = waitlistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const allowed = await checkRateLimit('reservation', parsed.data.guest_phone);
  if (!allowed) return { success: false, error: 'rate_limited' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('reservation_waitlist').insert({
    guest_name: parsed.data.guest_name,
    guest_phone: parsed.data.guest_phone,
    guest_email: parsed.data.guest_email ?? null,
    reservation_date: parsed.data.reservation_date,
    desired_start_time: parsed.data.desired_start_time,
    desired_end_time: parsed.data.desired_end_time,
    guest_count: parsed.data.guest_count,
  });

  if (error) {
    console.error('[joinWaitlist] DB error:', error);
    return { success: false, error: 'unknown' };
  }
  return { success: true };
}

/**
 * When a slot frees up (cancellation / reschedule), email the earliest waiting
 * guest whose desired time overlaps the freed window and whose party still fits
 * an available table. Best-effort: never throws into the caller.
 */
export async function notifyWaitlistForSlot(
  date: string,
  freedStart: string,
  freedEnd: string
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: entries } = await supabase
      .from('reservation_waitlist')
      .select('*')
      .eq('reservation_date', date)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (!entries?.length) return;

    for (const entry of entries) {
      // overlap check against the freed window
      const overlaps = entry.desired_start_time < freedEnd && entry.desired_end_time > freedStart;
      if (!overlaps || !entry.guest_email) continue;

      const { tables } = await queryAvailability(
        date,
        entry.desired_start_time,
        entry.desired_end_time,
        entry.guest_count
      );
      if (tables.length === 0) continue;

      await sendWaitlistNotification(entry.guest_email, {
        name: entry.guest_name,
        date: entry.reservation_date,
        startTime: entry.desired_start_time,
        endTime: entry.desired_end_time,
        guestCount: entry.guest_count,
        bookingUrl: `${siteUrl()}/reservations`,
      });

      await supabase
        .from('reservation_waitlist')
        .update({ status: 'notified', notified_at: new Date().toISOString() })
        .eq('id', entry.id);

      break; // notify one guest per freed slot
    }
  } catch (err) {
    console.error('[notifyWaitlistForSlot] error:', err);
  }
}
