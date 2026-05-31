"use client";

import type { ReservationWithTable, RestaurantTable } from "@/types/database";

const DAY_START = 11 * 60;
const DAY_SPAN = 11 * 60;

function minsFromTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function ReservationCalendar({
  reservations,
  tables,
}: {
  reservations: ReservationWithTable[];
  tables: RestaurantTable[];
}) {
  const active = reservations.filter(
    (r) => r.status !== "cancelled" && r.status !== "no_show"
  );
  const availableCount = tables.filter(
    (t) => t.is_available && !active.find((r) => r.table_id === t.id)
  ).length;

  return (
    <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <h2 className="font-headline text-base text-text-primary tracking-tight">FLOOR MAP</h2>
        <span className="text-green-400 text-xs font-body">{availableCount} Available</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2.5">
        {tables
          .filter((t) => t.is_available)
          .map((table) => {
            const tableRes = active
              .filter((r) => r.table_id === table.id)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));
            const occupied = tableRes.length > 0;

            return (
              <div
                key={table.id}
                className={`rounded-lg border p-3 ${
                  occupied
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-surface border-surface-border"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <p className="font-headline text-2xl text-text-primary tracking-tight">
                    T{table.table_number}
                  </p>
                  <span className="text-text-muted text-xs font-body flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    {table.seat_count}
                  </span>
                </div>

                <p className={`text-xs font-body font-semibold mb-2 ${occupied ? "text-amber-400" : "text-green-400"}`}>
                  {occupied
                    ? `${tableRes.length} BOOKING${tableRes.length > 1 ? "S" : ""}`
                    : "AVAILABLE"}
                </p>

                {tableRes.length > 0 && (
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    {tableRes.map((r) => {
                      const start = Math.max(minsFromTime(r.start_time), DAY_START);
                      const end = Math.min(minsFromTime(r.end_time), DAY_START + DAY_SPAN);
                      const left = ((start - DAY_START) / DAY_SPAN) * 100;
                      const width = Math.max(((end - start) / DAY_SPAN) * 100, 3);
                      const barCls = r.status === "confirmed" ? "bg-blue-400" : "bg-amber-400";
                      return (
                        <div
                          key={r.id}
                          className={`absolute top-0 h-full rounded-full ${barCls}`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${r.guest_name}: ${r.start_time.slice(0, 5)}–${r.end_time.slice(0, 5)}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
