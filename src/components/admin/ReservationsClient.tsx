"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReservationStatus } from "@/lib/actions/admin/reservations";
import type { ReservationStatus, ReservationWithTable, RestaurantTable } from "@/types/database";
import ReservationCalendar from "./ReservationCalendar";

const STATUS_CLS: Record<ReservationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  confirmed: "bg-green-500/15 text-green-400 border-green-500/20",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  no_show: "bg-white/5 text-text-muted border-white/10",
};

const FILTERS: Array<{ label: string; value: ReservationStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No-show", value: "no_show" },
];

function fmtTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function ReservationsClient({
  reservations,
  tables,
  selectedDate,
}: {
  reservations: ReservationWithTable[];
  tables: RestaurantTable[];
  selectedDate: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");

  const filtered =
    statusFilter === "all" ? reservations : reservations.filter((r) => r.status === statusFilter);

  function handleDate(e: React.ChangeEvent<HTMLInputElement>) {
    router.push(`/admin/reservations?date=${e.target.value}`);
  }

  function doStatus(id: string, status: ReservationStatus) {
    startTransition(async () => {
      await updateReservationStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-4xl text-text-primary tracking-tight">RESERVATIONS</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDate}
          className="bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full font-body text-sm border transition-colors ${
              statusFilter === f.value
                ? "bg-primary border-primary text-white"
                : "border-surface-border text-text-muted hover:border-primary/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-border">
                  {["GUEST", "PHONE", "TIME", "TABLE", "GUESTS", "STATUS", "ACTIONS"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-muted">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3 text-text-primary whitespace-nowrap">{r.guest_name}</td>
                      <td className="px-5 py-3">
                        <a href={`tel:${r.guest_phone}`} className="text-primary hover:underline whitespace-nowrap">
                          {r.guest_phone}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                        {fmtTime(r.start_time)} – {fmtTime(r.end_time)}
                      </td>
                      <td className="px-5 py-3 text-text-muted">
                        {r.restaurant_tables ? `T${r.restaurant_tables.table_number}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-text-muted">{r.guest_count}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${STATUS_CLS[r.status]}`}
                        >
                          {r.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {r.status === "pending" && (
                            <ActionBtn
                              cls="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              disabled={isPending}
                              onClick={() => doStatus(r.id, "confirmed")}
                            >
                              Confirm
                            </ActionBtn>
                          )}
                          {r.status === "confirmed" && (
                            <>
                              <ActionBtn
                                cls="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                disabled={isPending}
                                onClick={() => doStatus(r.id, "completed")}
                              >
                                Complete
                              </ActionBtn>
                              <ActionBtn
                                cls="border-surface-border text-text-muted hover:bg-surface"
                                disabled={isPending}
                                onClick={() => doStatus(r.id, "no_show")}
                              >
                                No-show
                              </ActionBtn>
                            </>
                          )}
                          {(r.status === "pending" || r.status === "confirmed") && (
                            <ActionBtn
                              cls="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              disabled={isPending}
                              onClick={() => doStatus(r.id, "cancelled")}
                            >
                              Cancel
                            </ActionBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ReservationCalendar reservations={reservations} tables={tables} />
      </div>
    </div>
  );
}

function ActionBtn({
  cls,
  disabled,
  onClick,
  children,
}: {
  cls: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 rounded text-xs border transition-colors disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}
