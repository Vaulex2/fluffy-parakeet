"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getAvailableTables,
  cancelReservationByToken,
  rescheduleReservationByToken,
} from "@/lib/actions/reservations";
import {
  CalendarPicker,
  Field,
  TIME_SLOTS,
  DURATIONS,
  addMinutesToTime,
  formatTime12,
  isSlotPast,
} from "@/components/reservation/ReservationForm";
import type { ReservationWithTable, RestaurantTable } from "@/types/database";

type Mode = "view" | "reschedule" | "cancelled" | "rescheduled";

function durationFromTimes(start: string, end: string): number {
  const [sh, sm] = start.slice(0, 5).split(":").map(Number);
  const [eh, em] = end.slice(0, 5).split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export default function ManageReservation({
  reservation,
}: {
  reservation: ReservationWithTable;
}) {
  const alreadyClosed = ["cancelled", "completed", "no_show"].includes(reservation.status);

  const [mode, setMode] = useState<Mode>("view");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // reschedule state
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(reservation.reservation_date);
  const [time, setTime] = useState(reservation.start_time.slice(0, 5));
  const [durationMinutes, setDurationMinutes] = useState(
    durationFromTimes(reservation.start_time, reservation.end_time) || 90
  );
  const [availableTables, setAvailableTables] = useState<RestaurantTable[] | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Clear a selected time that's now in the past (e.g. date switched to today)
  useEffect(() => {
    if (time && isSlotPast(time, date)) {
      setTime("");
      setAvailableTables(null);
    }
  }, [date, time]);

  // display helpers
  const dateLabel = new Date(reservation.reservation_date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = `${formatTime12(reservation.start_time.slice(0, 5))} — ${formatTime12(
    reservation.end_time.slice(0, 5)
  )}`;

  function handleCancel() {
    if (!confirm("Cancel this reservation? This cannot be undone.")) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelReservationByToken(reservation.manage_token);
      if (res.success) setMode("cancelled");
      else setError("We couldn't cancel this reservation. Please call us at +998 90 123 45 67.");
    });
  }

  function loadTables() {
    setError(null);
    setSelectedTable(null);
    startTransition(async () => {
      const start = time + ":00";
      const end = addMinutesToTime(time, durationMinutes);
      const tables = await getAvailableTables(date, start, end, reservation.guest_count);
      setAvailableTables(tables);
    });
  }

  function handleReschedule() {
    if (!selectedTable) return;
    setError(null);
    startTransition(async () => {
      const res = await rescheduleReservationByToken(
        reservation.manage_token,
        selectedTable.id,
        date,
        time + ":00",
        addMinutesToTime(time, durationMinutes)
      );
      if (res.success) setMode("rescheduled");
      else if (res.error === "slot_taken")
        setError("That table was just taken. Pick another table or time.");
      else setError("Something went wrong. Please try again or call us.");
    });
  }

  // ── Closed states ─────────────────────────────────────────
  if (mode === "cancelled") {
    return (
      <Card>
        <Banner icon="cancel" tone="muted" title="Reservation cancelled" />
        <p className="text-text-muted font-body text-sm text-center">
          Your table has been released. We hope to see you another time!
        </p>
      </Card>
    );
  }

  if (mode === "rescheduled") {
    return (
      <Card>
        <Banner icon="check_circle" tone="green" title="Reservation updated" />
        <div className="bg-surface border border-surface-border rounded-2xl p-6 text-left space-y-3">
          <Detail label="Date" value={new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} />
          <Detail label="Time" value={`${formatTime12(time)} — ${formatTime12(addMinutesToTime(time, durationMinutes).slice(0, 5))}`} />
          <Detail label="Table" value={`Table ${selectedTable?.table_number}`} />
        </div>
      </Card>
    );
  }

  // ── Reschedule mode ───────────────────────────────────────
  if (mode === "reschedule") {
    return (
      <Card>
        <button
          onClick={() => { setMode("view"); setAvailableTables(null); }}
          className="text-text-muted hover:text-text-primary font-body text-sm flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span> Back
        </button>
        <h2 className="font-headline text-2xl tracking-tight text-text-primary">Change date &amp; time</h2>

        <Field label="Date">
          <CalendarPicker value={date} min={today} onChange={(v) => { setDate(v); setAvailableTables(null); }} />
        </Field>

        <Field label="Time">
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((t) => {
              const past = isSlotPast(t, date);
              return (
                <button
                  key={t}
                  onClick={() => { setTime(t); setAvailableTables(null); }}
                  disabled={past}
                  className={`py-2 rounded-lg font-body text-sm border transition-colors ${
                    time === t
                      ? "bg-primary border-primary text-white"
                      : past
                      ? "border-surface-border text-text-muted/25 cursor-not-allowed line-through"
                      : "border-surface-border text-text-muted hover:border-primary/60"
                  }`}
                >
                  {formatTime12(t)}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Duration">
          <div className="flex gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => { setDurationMinutes(d.minutes); setAvailableTables(null); }}
                className={`flex-1 py-2 rounded-lg font-body text-sm border transition-colors ${
                  durationMinutes === d.minutes
                    ? "bg-primary border-primary text-white"
                    : "border-surface-border text-text-muted hover:border-primary/60"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Field>

        {availableTables === null ? (
          <button
            onClick={loadTables}
            disabled={isPending || !time}
            className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Checking…" : "Check Availability →"}
          </button>
        ) : availableTables.length === 0 ? (
          <p className="text-center text-text-muted font-body text-sm py-4">
            No tables available for {reservation.guest_count} guests at this time. Try another slot.
          </p>
        ) : (
          <div className="grid gap-3">
            {availableTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  selectedTable?.id === table.id ? "border-primary bg-primary/10" : "border-surface-border hover:border-primary/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline text-lg ${
                  selectedTable?.id === table.id ? "bg-primary text-white" : "bg-surface text-text-muted"
                }`}>
                  {table.table_number}
                </div>
                <div>
                  <p className="text-text-primary font-body text-sm font-medium">Table {table.table_number}</p>
                  <p className="text-text-muted font-body text-xs">
                    Up to {table.seat_count} guests{table.description ? ` · ${table.description}` : ""}
                  </p>
                </div>
                {selectedTable?.id === table.id && (
                  <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && <ErrorNote>{error}</ErrorNote>}

        {availableTables && availableTables.length > 0 && (
          <button
            onClick={handleReschedule}
            disabled={!selectedTable || isPending}
            className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {isPending ? "Saving…" : "Confirm Change"}
          </button>
        )}
      </Card>
    );
  }

  // ── View mode ─────────────────────────────────────────────
  return (
    <Card>
      <p className="text-text-muted font-body text-sm text-center">
        Booking #{reservation.id.slice(0, 8).toUpperCase()}
      </p>
      <div className="bg-surface border border-surface-border rounded-2xl p-6 text-left space-y-3">
        <Detail label="Name" value={reservation.guest_name} />
        <Detail label="Date" value={dateLabel} />
        <Detail label="Time" value={timeLabel} />
        <Detail label="Guests" value={`${reservation.guest_count} ${reservation.guest_count === 1 ? "person" : "people"}`} />
        {reservation.restaurant_tables && (
          <Detail label="Table" value={`Table ${reservation.restaurant_tables.table_number}`} />
        )}
        <Detail label="Status" value={reservation.status} />
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {alreadyClosed ? (
        <p className="text-text-muted font-body text-sm text-center">
          This reservation is {reservation.status.replace("_", " ")} and can no longer be changed.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode("reschedule")}
            disabled={isPending}
            className="w-full border border-surface-border text-text-primary font-headline tracking-tight text-base py-3 rounded-xl hover:border-primary transition-colors disabled:opacity-40"
          >
            Change date/time
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="w-full bg-primary text-white font-headline tracking-tight text-base py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {isPending ? "Cancelling…" : "Cancel reservation"}
          </button>
        </div>
      )}
    </Card>
  );
}

// ── Local UI helpers ──────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <div className="max-w-lg mx-auto space-y-6">{children}</div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted font-body text-sm">{label}</span>
      <span className="text-text-primary font-body text-sm font-medium capitalize">{value}</span>
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
      {children}
    </p>
  );
}

function Banner({ icon, tone, title }: { icon: string; tone: "green" | "muted"; title: string }) {
  const color = tone === "green" ? "text-green-400 bg-green-500/10 border-green-500/30" : "text-text-muted bg-surface border-surface-border";
  return (
    <div className="text-center space-y-4">
      <div className={`w-16 h-16 border rounded-full flex items-center justify-center mx-auto ${color}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h2 className="font-headline text-3xl tracking-tight text-text-primary">{title}</h2>
    </div>
  );
}
