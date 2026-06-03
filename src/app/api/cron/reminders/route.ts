import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReservationReminder } from "@/lib/email/send";

// Always run dynamically — never cache this endpoint.
export const dynamic = "force-dynamic";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// YYYY-MM-DD for "tomorrow" (UTC; cron runs ~10:00 Asia/Tashkent = 05:00 UTC, same calendar day).
function tomorrowISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  // ── Authorize: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` ────
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const date = tomorrowISO();

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("id, guest_name, guest_email, reservation_date, start_time, end_time, guest_count, manage_token")
    .eq("reservation_date", date)
    .in("status", ["pending", "confirmed"])
    .not("guest_email", "is", null)
    .is("reminder_sent_at", null);

  if (error) {
    console.error("[cron/reminders] query error:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  let sent = 0;
  for (const r of reservations ?? []) {
    if (!r.guest_email) continue;
    try {
      await sendReservationReminder(r.guest_email, {
        name: r.guest_name,
        date: r.reservation_date,
        startTime: r.start_time,
        endTime: r.end_time,
        guestCount: r.guest_count,
        manageUrl: `${siteUrl()}/reservations/manage/${r.manage_token}`,
      });
      // Mark only after a successful send so failures are retried next run (idempotent).
      await supabase
        .from("reservations")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", r.id);
      sent++;
    } catch (err) {
      console.error(`[cron/reminders] failed for reservation ${r.id}:`, err);
    }
  }

  return NextResponse.json({ date, candidates: reservations?.length ?? 0, sent });
}
