"use client";

import { useState, useTransition, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  getAvailability,
  getAlternativeSlots,
  createReservation,
  joinWaitlist,
  type AlternativeSlot,
} from "@/lib/actions/reservations";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { INTL_LOCALE } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n";
import type { RestaurantTable } from "@/types/database";

// Maps a duration in minutes to its translation key.
const DURATION_KEY: Record<number, TranslationKey> = {
  60: "reservations.duration1h",
  90: "reservations.duration15h",
  120: "reservations.duration2h",
};

type Step = "datetime" | "tables" | "contact" | "confirmed" | "waitlist" | "waitlisted";

// Generates half-hour slots from 11:00 to 21:30 (last booking start)
function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 11; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

export const TIME_SLOTS = generateTimeSlots();
export const DURATIONS = [
  { label: "1 hour", minutes: 60 },
  { label: "1.5 hours", minutes: 90 },
  { label: "2 hours", minutes: 120 },
];
export const MAX_GUESTS = 20;

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:00`;
}

export function formatTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function isSlotPast(slot: string, selectedDate: string): boolean {
  const localToday = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone
  if (selectedDate !== localToday) return false;
  const [h, m] = slot.split(":").map(Number);
  const now = new Date();
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
}

export default function ReservationForm() {
  const { t } = useLanguage();
  const guestUnit = (n: number) =>
    t(n === 1 ? "reservations.person" : "reservations.people");
  const [step, setStep] = useState<Step>("datetime");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [guestCount, setGuestCount] = useState(2);
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [altSlots, setAltSlots] = useState<AlternativeSlot[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState("");
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [confirmedToken, setConfirmedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().split("T")[0];

  // Clear selected time if it's now in the past (e.g. date changed to today)
  useEffect(() => {
    if (time && isSlotPast(time, date)) setTime("");
  }, [date, time]);

  // Pre-fill from auth user on mount
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      if (user.email && !email) setEmail(user.email);
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name && !name) setName(data.full_name);
          if (data?.phone && !phone) setPhone(data.phone);
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDateTimeNext() {
    if (!date || !time) return;
    setError(null);
    const startTime = time + ":00";
    const endTime = addMinutesToTime(time, durationMinutes);
    startTransition(async () => {
      const info = await getAvailability(date, startTime, endTime, guestCount);
      setAvailableTables(info.tables);
      setTotalMatching(info.totalMatching);
      setSelectedTable(null);
      // When the slot is full, fetch nearby openings to suggest.
      setAltSlots(info.tables.length === 0
        ? await getAlternativeSlots(date, time, durationMinutes, guestCount)
        : []);
      setStep("tables");
    });
  }

  function handleJoinWaitlist() {
    if (!name || !phone) return;
    setError(null);
    startTransition(async () => {
      const res = await joinWaitlist({
        guest_name: name,
        guest_phone: phone,
        guest_email: email || null,
        reservation_date: date,
        desired_start_time: time + ":00",
        desired_end_time: addMinutesToTime(time, durationMinutes),
        guest_count: guestCount,
      });
      if (res.success) setStep("waitlisted");
      else if (res.error === "rate_limited")
        setError(t("reservations.errWaitlistRate"));
      else setError(t("reservations.errWaitlistGeneric"));
    });
  }

  async function handleSubmit() {
    if (!selectedTable || !name || !phone) return;
    setError(null);
    startTransition(async () => {
      const result = await createReservation({
        guest_name: name,
        guest_phone: phone,
        guest_email: email || null,
        reservation_date: date,
        start_time: time + ":00",
        end_time: addMinutesToTime(time, durationMinutes),
        guest_count: guestCount,
        table_id: selectedTable.id,
        special_requests: specialRequests || null,
        user_id: userId,
      });

      if (result.success) {
        setConfirmedId(result.id);
        setConfirmedToken(result.manageToken);
        setStep("confirmed");
      } else if (result.error === "slot_taken") {
        setError(t("reservations.errSlotTaken"));
      } else {
        setError(result.message);
      }
    });
  }

  // ── Step: Confirmed ───────────────────────────────────────
  if (step === "confirmed") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
        </div>
        <div>
          <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">
            {t("reservations.confirmedTitle")}
          </h2>
          <p className="text-text-muted font-body text-sm">
            {t("reservations.bookingNumber", {
              id: confirmedId?.slice(0, 8).toUpperCase() ?? "",
            })}
          </p>
        </div>
        <div className="bg-surface border border-surface-border rounded-2xl p-6 text-left space-y-3">
          <Detail label={t("reservations.detailName")} value={name} />
          <Detail label={t("reservations.detailDate")} value={date} />
          <Detail label={t("reservations.detailTime")} value={`${formatTime12(time)} — ${formatTime12(addMinutesToTime(time, durationMinutes).slice(0, 5))}`} />
          <Detail label={t("reservations.detailGuests")} value={t("reservations.guestsValue", { count: guestCount, unit: guestUnit(guestCount) })} />
          <Detail label={t("reservations.detailTable")} value={t("reservations.tableValue", { number: selectedTable?.table_number ?? "", capacity: selectedTable?.seat_count ?? "" })} />
        </div>
        {email && (
          <p className="text-text-muted font-body text-sm">
            {t("reservations.emailedConfirmation", { email })}
          </p>
        )}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-3">
          <p className="font-body text-sm text-text-primary leading-relaxed">
            <span className="font-semibold">{t("reservations.modifyTitle")}</span><br />
            {t("reservations.modifyBody")}
          </p>
          {confirmedToken && (
            <a
              href={`/reservations/manage/${confirmedToken}`}
              className="inline-block bg-primary text-white font-headline tracking-tight text-base px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
            >
              {t("reservations.manageReservation")}
            </a>
          )}
          <p className="font-body text-xs text-text-muted">
            {t("reservations.orCallUs")}{" "}
            <a href="tel:+998901234567" className="text-primary">+998 90 123 45 67</a>
          </p>
        </div>
      </div>
    );
  }

  // ── Step: Date & Time ─────────────────────────────────────
  if (step === "datetime") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <StepHeader step={1} total={3} title={t("reservations.step1Title")} stepLabel={t("reservations.stepOf", { step: 1, total: 3 })} />

        <Field label={t("reservations.fieldDate")}>
          <CalendarPicker value={date} min={today} onChange={setDate} />
        </Field>

        <Field label={t("reservations.fieldTime")}>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((t) => {
              const past = isSlotPast(t, date);
              return (
                <button
                  key={t}
                  onClick={() => setTime(t)}
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

        <Field label={t("reservations.fieldDuration")}>
          <div className="flex gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setDurationMinutes(d.minutes)}
                className={`flex-1 py-2 rounded-lg font-body text-sm border transition-colors ${
                  durationMinutes === d.minutes
                    ? "bg-primary border-primary text-white"
                    : "border-surface-border text-text-muted hover:border-primary/60"
                }`}
              >
                {t(DURATION_KEY[d.minutes])}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("reservations.fieldGuests")}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors text-xl"
            >
              −
            </button>
            <span className="text-text-primary font-headline text-2xl w-8 text-center">
              {guestCount}
            </span>
            <button
              onClick={() => setGuestCount(Math.min(MAX_GUESTS, guestCount + 1))}
              className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors text-xl"
            >
              +
            </button>
            <span className="text-text-muted font-body text-sm">
              {guestUnit(guestCount)}
            </span>
          </div>
        </Field>

        <button
          onClick={handleDateTimeNext}
          disabled={!date || !time || isPending}
          className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? t("reservations.checkingAvailability") : t("reservations.checkAvailability")}
        </button>
      </div>
    );
  }

  // ── Step: Table Selection ─────────────────────────────────
  if (step === "tables") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <StepHeader step={2} total={3} title={t("reservations.step2Title")} stepLabel={t("reservations.stepOf", { step: 2, total: 3 })} />
        <button
          onClick={() => setStep("datetime")}
          className="text-text-muted hover:text-text-primary font-body text-sm flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span> {t("reservations.changeDateTime")}
        </button>

        <div className="bg-surface border border-surface-border rounded-xl p-4 text-sm font-body text-text-muted">
          {date} · {formatTime12(time)} – {formatTime12(addMinutesToTime(time, durationMinutes).slice(0, 5))} · {t(DURATION_KEY[durationMinutes])} · {guestCount} {guestUnit(guestCount)}
        </div>

        {availableTables.length === 0 ? (
          <div className="text-center py-8 text-text-muted font-body space-y-5">
            <div>
              <span className="material-symbols-outlined text-4xl mb-3 block opacity-40">event_busy</span>
              <p>{t("reservations.noTables")}</p>
            </div>

            {altSlots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest">{t("reservations.nearbyOpenings")}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {altSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => { setTime(slot.time); handleDateTimeNext(); }}
                      className="px-4 py-2 rounded-lg border border-primary/50 text-primary font-body text-sm hover:bg-primary/10 transition-colors"
                    >
                      {formatTime12(slot.time)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-surface border border-surface-border rounded-xl p-4 space-y-3">
              <p className="text-sm text-text-primary">
                {t("reservations.waitlistPrompt")}
              </p>
              <button
                onClick={() => setStep("waitlist")}
                className="bg-primary text-white font-headline tracking-tight text-base px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
              >
                {t("reservations.joinWaitlistArrow")}
              </button>
            </div>

            <button
              onClick={() => setStep("datetime")}
              className="text-primary hover:underline text-sm"
            >
              {t("reservations.tryDifferentTime")}
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {totalMatching > 0 && availableTables.length <= 2 && (
              <p className="text-amber-400 font-body text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">local_fire_department</span>
                {t("reservations.almostFull", {
                  count: availableTables.length,
                  unit: t(availableTables.length === 1 ? "reservations.table" : "reservations.tables"),
                })}
              </p>
            )}
            {availableTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  selectedTable?.id === table.id
                    ? "border-primary bg-primary/10"
                    : "border-surface-border hover:border-primary/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline text-lg ${
                  selectedTable?.id === table.id ? "bg-primary text-white" : "bg-surface text-text-muted"
                }`}>
                  {table.table_number}
                </div>
                <div>
                  <p className="text-text-primary font-body text-sm font-medium">{t("reservations.tableLabel", { number: table.table_number })}</p>
                  <p className="text-text-muted font-body text-xs">
                    {t("reservations.upToGuests", { count: table.seat_count })}{table.description ? ` · ${table.description}` : ""}
                  </p>
                </div>
                {selectedTable?.id === table.id && (
                  <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                )}
              </button>
            ))}
          </div>
        )}

        {availableTables.length > 0 && (
          <button
            onClick={() => setStep("contact")}
            disabled={!selectedTable}
            className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("reservations.continueArrow")}
          </button>
        )}
      </div>
    );
  }

  // ── Step: Waitlist (contact details) ──────────────────────
  if (step === "waitlist") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => setStep("tables")}
          className="text-text-muted hover:text-text-primary font-body text-sm flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span> {t("reservations.back")}
        </button>
        <div>
          <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">{t("reservations.waitlistTitle")}</h2>
          <p className="text-text-muted font-body text-sm">
            {t("reservations.waitlistSubtitle", {
              date,
              time: formatTime12(time),
              count: guestCount,
              unit: t(guestCount === 1 ? "reservations.guest" : "reservations.guests"),
            })}
          </p>
        </div>

        <Field label={t("reservations.fullName")}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("reservations.namePlaceholder")}
            className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
        </Field>
        <Field label={t("reservations.phoneRequired")}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("reservations.phonePlaceholder")}
            className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
        </Field>
        <Field label={t("reservations.emailToNotify")}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("reservations.emailPlaceholder")}
            className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
        </Field>

        {error && (
          <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={handleJoinWaitlist}
          disabled={!name || !phone || isPending}
          className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? t("reservations.joining") : t("reservations.joinWaitlist")}
        </button>
      </div>
    );
  }

  // ── Step: Waitlisted ──────────────────────────────────────
  if (step === "waitlisted") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-amber-400 text-3xl">hourglass_top</span>
        </div>
        <div>
          <h2 className="font-headline text-3xl tracking-tight text-text-primary mb-2">{t("reservations.waitlistedTitle")}</h2>
          <p className="text-text-muted font-body text-sm">
            {t("reservations.waitlistedBody", {
              date,
              time: formatTime12(time),
              who: email || t("reservations.waitlistedYou"),
            })}
          </p>
        </div>
        <a
          href="/reservations"
          className="inline-block border border-surface-border text-text-primary font-headline tracking-tight text-base px-6 py-2.5 rounded-xl hover:border-primary transition-colors"
        >
          {t("reservations.bookDifferentTime")}
        </a>
      </div>
    );
  }

  // ── Step: Contact Details ─────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <StepHeader step={3} total={3} title={t("reservations.step3Title")} stepLabel={t("reservations.stepOf", { step: 3, total: 3 })} />
      <button
        onClick={() => setStep("tables")}
        className="text-text-muted hover:text-text-primary font-body text-sm flex items-center gap-1 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span> {t("reservations.changeTable")}
      </button>

      <Field label={t("reservations.fullName")}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("reservations.namePlaceholder")}
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
        />
      </Field>
      <Field label={t("reservations.phoneRequired")}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("reservations.phonePlaceholder")}
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
        />
      </Field>
      <Field label={t("reservations.emailOptional")}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("reservations.emailPlaceholder")}
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
        />
      </Field>
      <Field label={t("reservations.specialRequests")}>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder={t("reservations.specialPlaceholder")}
          rows={3}
          className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </Field>

      {error && (
        <p className="text-primary text-sm font-body bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!name || !phone || isPending}
        className="w-full bg-primary text-white font-headline tracking-tight text-lg py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? t("reservations.booking") : t("reservations.confirmReservation")}
      </button>

      <p className="text-text-muted font-body text-xs text-center">
        {t("reservations.emailNote")}
      </p>
    </div>
  );
}

// ── CalendarPicker ────────────────────────────────────────

export function CalendarPicker({ value, min, onChange }: { value: string; min: string; onChange: (v: string) => void }) {
  const { locale, t } = useLanguage();
  const intlTag = INTL_LOCALE[locale];
  // Localized short weekday headers (Sunday-first, matching the grid).
  const DAYS = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(intlTag, { weekday: "narrow" }),
  );
  const today = new Date(min + "T00:00:00");
  const initYear = value ? Number(value.slice(0, 4)) : today.getFullYear();
  const initMonth = value ? Number(value.slice(5, 7)) - 1 : today.getMonth();
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  function toISO(d: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function isPast(d: number) {
    return new Date(toISO(d) + "T00:00:00") < today;
  }

  // don't let user navigate before the current month
  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth();

  return (
    <div className="bg-background border border-surface-border rounded-xl p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-border text-text-muted hover:border-primary/50 hover:text-text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span className="font-headline text-base tracking-tight text-text-primary">
          {new Date(viewYear, viewMonth, 1).toLocaleDateString(intlTag, { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-border text-text-muted hover:border-primary/50 hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-text-muted font-body text-xs py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const iso = toISO(day);
          const past = isPast(day);
          const selected = iso === value;
          const isToday = iso === min;
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onChange(iso)}
              className={`mx-auto w-9 h-9 rounded-full font-body text-sm transition-colors
                ${selected ? "bg-primary text-white" : ""}
                ${!selected && isToday ? "border border-primary/60 text-primary" : ""}
                ${!selected && !isToday && !past ? "text-text-primary hover:bg-primary/15" : ""}
                ${past ? "text-text-muted/30 cursor-not-allowed" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected date display */}
      {value && (
        <p className="mt-3 text-center text-text-muted font-body text-xs">
          {t("reservations.selected")}{" "}
          <span className="text-primary font-medium">
            {new Date(value + "T00:00:00").toLocaleDateString(intlTag, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </p>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function StepHeader({ step, total, title, stepLabel }: { step: number; total: number; title: string; stepLabel: string }) {
  return (
    <div className="space-y-2">
      <p className="text-text-muted font-body text-xs uppercase tracking-widest">
        {stepLabel}
      </p>
      <h2 className="font-headline text-3xl tracking-tight text-text-primary">{title}</h2>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step ? "bg-primary" : "bg-surface-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted font-body text-sm">{label}</span>
      <span className="text-text-primary font-body text-sm font-medium">{value}</span>
    </div>
  );
}
