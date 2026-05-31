"use client";

import { useRouter } from "next/navigation";
import type { ReservationStatus, ReservationWithTable } from "@/types/database";

const STATUS_CLS: Record<ReservationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  confirmed: "bg-green-500/15 text-green-400 border-green-500/20",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  no_show: "bg-white/5 text-text-muted border-white/10",
};

function fmtTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerReservations({
  reservations,
  totalPages,
  page,
}: {
  reservations: ReservationWithTable[];
  totalPages: number;
  page: number;
}) {
  const router = useRouter();

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-text-muted/40 block mb-3">
          calendar_today
        </span>
        <p className="text-text-muted font-body text-sm">No reservations yet.</p>
        <a href="/reservations" className="text-primary hover:underline font-body text-sm mt-2 inline-block">
          Book a table
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((r) => (
        <div
          key={r.id}
          className="bg-background border border-surface-border rounded-xl p-4 space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-sm text-text-primary font-medium">
                {fmtDate(r.reservation_date)}
              </p>
              <p className="font-body text-xs text-text-muted mt-0.5">
                {fmtTime(r.start_time)} – {fmtTime(r.end_time)} ·{" "}
                {r.restaurant_tables
                  ? `Table ${r.restaurant_tables.table_number} (${r.restaurant_tables.seat_count} seats)`
                  : "Table TBD"}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-body px-2.5 py-1 rounded-full border capitalize ${STATUS_CLS[r.status]}`}
            >
              {r.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted font-body">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">group</span>
              {r.guest_count} guests
            </span>
            {r.special_requests && (
              <span className="truncate">{r.special_requests}</span>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => router.push(`/profile?page=${page - 1}`)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-surface-border text-text-muted font-body text-sm hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-text-muted font-body text-xs">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => router.push(`/profile?page=${page + 1}`)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-surface-border text-text-muted font-body text-sm hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
